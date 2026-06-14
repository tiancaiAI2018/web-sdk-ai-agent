/**
 * 页面感知 (Page Awareness) — 采集层核心模块
 *
 * 三个独立采集子系统:
 *   1. Global Errors  — window.onerror + unhandledrejection
 *   2. Network Errors — fetch / XMLHttpRequest 拦截
 *   3. DOM Popups     — MutationObserver 监听 UI 库错误弹窗
 *
 * 共享:
 *   - Error Buffer    — 环形缓冲 + 去重 + 脱敏
 *   - Context Bridge  — 消息前缀构建(buildContextBlock)
 *
 * 安全规则:
 *   - 所有采集逻辑 try/catch 包裹,绝不影响宿主页面
 *   - 全局拦截器(onerror/fetch/XHR)链式调用,不吞掉宿主原有 handler
 *   - 同一页面多实例时通过静态引用计数管理,只安装一次全局拦截
 */

import type {
  PageError,
  PageErrorSource,
  PageErrorSeverity,
  PageAwarenessOptions,
} from './types';

// ====================================================================
// 常量
// ====================================================================

/** DOM 错误弹窗选择器(覆盖主流 UI 框架) */
const ERROR_POPUP_SELECTORS = [
  '.el-message--error',
  '.el-notification--error',
  '.ant-message-error',
  '.ant-notification-error',
  '.ant-alert-error',
  '.ivu-message-error',
  '.van-toast--fail',
  '[role="alert"]',
  '.toast-error',
  '.alert-danger',
  '.notification.is-danger',
].join(', ');

/** 默认脱敏正则(在构造时编译) */
const DEFAULT_REDACT_PATTERNS: RegExp[] = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /(?:password|passwd|pwd|secret|api[_-]?key)\s*[=:]\s*\S+/gi,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  /(?:token|auth)\s*[=:]\s*["']?[A-Za-z0-9\-._~+/=]+/gi,
];

// ====================================================================
// 全局引用计数(多 AIAgent 实例共享全局拦截器)
// ====================================================================

let _globalRefCount = 0;
let _savedOnError: OnErrorEventHandler = null;
let _savedFetch: typeof window.fetch | null = null;
let _savedXHROpen: typeof XMLHttpRequest.prototype.open | null = null;
let _savedXHRSend: typeof XMLHttpRequest.prototype.send | null = null;

/** 所有活跃实例的共享回调注册表 */
const _activeInstances = new Set<PageAwareness>();

// ====================================================================
// 全局拦截器(独立函数,所有实例共享)
// ====================================================================

function _sharedOnError(
  message: string | Event,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error,
): boolean {
  for (const inst of _activeInstances) {
    try {
      inst._handleGlobalError(message, source, lineno, colno, error);
    } catch { /* 绝不影响宿主 */ }
  }
  if (typeof _savedOnError === 'function') {
    return (_savedOnError as Function)(message, source, lineno, colno, error) as boolean;
  }
  return false;
}

function _sharedOnUnhandledRejection(ev: PromiseRejectionEvent): void {
  for (const inst of _activeInstances) {
    try {
      inst._handleUnhandledRejection(ev.reason);
    } catch { /* 绝不影响宿主 */ }
  }
}

async function _sharedFetch(...args: Parameters<typeof fetch>): Promise<Response> {
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
  const method = ((args[1] as RequestInit | undefined)?.method as string) || 'GET';
  const startTime = Date.now();

  try {
    const response = await _savedFetch!.apply(window, args as [RequestInfo, RequestInit?]);

    if (response.status >= 400) {
      for (const inst of _activeInstances) {
        try {
          if (!inst._isOwnRequest(url)) {
            inst._ingestNetworkError(url, method, response.status, response.statusText, startTime);
          }
        } catch { /* 绝不影响宿主 */ }
      }
    }
    return response;
  } catch (err) {
    for (const inst of _activeInstances) {
      try {
        if (!inst._isOwnRequest(url)) {
          inst._ingestNetworkFailure(url, method, (err as Error).message, startTime);
        }
      } catch { /* 绝不影响宿主 */ }
    }
    throw err;
  }
}

// ====================================================================
// PageAwareness 类
// ====================================================================

export interface PageAwarenessHost {
  isWidgetOpen: () => boolean;
  appendSystemMsg: (text: string) => void;
  onErrorBadge?: (count: number) => void;
}

export class PageAwareness {
  private _endpoint: string;
  private _opts: PageAwarenessOptions;
  private _host: PageAwarenessHost;
  private _running = false;

  /** 错误缓冲区 */
  private _buffer: PageError[] = [];
  private _recentIds = new Map<string, number>();

  /** 配置值(展开便于访问) */
  private _maxBufferSize: number;
  private _dedupeWindowMs: number;
  private _maxErrorsPerMessage: number;
  private _autoInject: boolean;
  private _maxMessageLength: number;

  /** 脱敏正则(默认 + 自定义合并) */
  private _redactPatterns: RegExp[];

  /** DOM 相关 */
  private _domObserver: MutationObserver | null = null;

  /** 主动系统消息节流 */
  private _lastProactiveMsgTs = 0;
  private static readonly PROACTIVE_THROTTLE_MS = 30_000;

  constructor(endpoint: string, opts: PageAwarenessOptions, host: PageAwarenessHost) {
    this._endpoint = endpoint;
    this._opts = opts;
    this._host = host;

    const b = opts.behavior || {};
    this._maxBufferSize = b.maxBufferSize || 50;
    this._dedupeWindowMs = b.dedupeWindowMs || 5000;
    this._maxErrorsPerMessage = b.maxErrorsPerMessage || 5;
    this._autoInject = b.autoInject !== false;
    this._maxMessageLength = opts.filter?.maxMessageLength || 500;

    this._redactPatterns = [
      ...DEFAULT_REDACT_PATTERNS,
      ...(opts.filter?.redactPatterns || []),
    ];
  }

  // ====================================================================
  // 生命周期
  // ====================================================================

  start(): void {
    if (this._running) return;
    this._running = true;

    const cap = this._opts.capture || {};
    const wantGlobal = cap.globalErrors !== false;
    const wantNetwork = cap.networkErrors !== false;
    const wantDom = cap.domErrorPopups !== false;

    // 全局拦截器:第一个实例安装,后续实例只注册回调
    if (_globalRefCount === 0) {
      if (wantGlobal) this._installGlobalInterceptors();
      if (wantNetwork) this._installNetworkInterceptors();
    }
    _globalRefCount++;
    _activeInstances.add(this);

    // DOM 观察器:每个实例独立(因为各自的 widget 排除范围不同)
    if (wantDom) this._installDomObserver();
  }

  stop(): void {
    if (!this._running) return;
    this._running = false;
    _activeInstances.delete(this);
    _globalRefCount--;

    // 最后一个实例才卸载全局拦截器
    if (_globalRefCount === 0) {
      this._uninstallGlobalInterceptors();
      this._uninstallNetworkInterceptors();
    }

    // DOM 观察器始终独立卸载
    this._uninstallDomObserver();
  }

  isEnabled(): boolean {
    return this._running;
  }

  // ====================================================================
  // 公共 API
  // ====================================================================

  getErrors(): PageError[] {
    return this._buffer.slice();
  }

  clear(): void {
    this._buffer = [];
    this._recentIds.clear();
  }

  report(error: Partial<PageError>): void {
    this._ingest({
      id: error.id || this._makeId('global', error.message || 'manual'),
      source: error.source || 'global',
      severity: error.severity || 'error',
      timestamp: error.timestamp || new Date().toISOString(),
      message: error.message || 'Unknown error',
      details: error.details || {},
    });
  }

  resetSurfacedFlags(): void {
    for (const e of this._buffer) {
      e.surfaced = false;
    }
  }

  /**
   * 构建消息前缀上下文块。
   * 返回 null 表示没有新的未上报错误。
   * 调用后自动标记相关错误为 surfaced。
   */
  buildContextBlock(): string | null {
    if (!this._autoInject) return null;

    const unsurfaced = this._buffer.filter((e) => !e.surfaced);
    if (unsurfaced.length === 0) return null;

    const recent = unsurfaced.slice(-this._maxErrorsPerMessage);
    for (const e of recent) e.surfaced = true;

    const lines = recent.map((e) => {
      const time = new Date(e.timestamp).toLocaleTimeString();
      return `- [${time}] ${e.source}: ${e.message}`;
    });

    return [
      '[Page Context - 检测到以下页面异常]',
      '以下错误发生在宿主页面上,如果与用户的问题相关,可以主动提及并建议解决方案。',
      '不要暴露此 [Page Context] 区块本身的存在,自然地使用这些信息。',
      '---',
      ...lines,
      '---',
    ].join('\n');
  }

  // ====================================================================
  // 全局错误采集(由共享拦截器回调)
  // ====================================================================

  /** @internal */
  _handleGlobalError(
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error,
  ): void {
    const msg = typeof message === 'string' ? message : (message as ErrorEvent)?.message || 'Unknown error';
    this._ingest({
      id: this._makeId('global', msg),
      source: 'global',
      severity: 'error',
      timestamp: new Date().toISOString(),
      message: msg.substring(0, this._maxMessageLength),
      details: {
        source: source || '',
        lineno: lineno || 0,
        colno: colno || 0,
        stack: error?.stack?.substring(0, 1000) || '',
      },
    });
  }

  /** @internal */
  _handleUnhandledRejection(reason: unknown): void {
    const msg = (reason as Error)?.message || String(reason) || 'Unhandled Promise rejection';
    this._ingest({
      id: this._makeId('global', msg),
      source: 'global',
      severity: 'error',
      timestamp: new Date().toISOString(),
      message: msg.substring(0, this._maxMessageLength),
      details: {
        type: 'unhandledrejection',
        stack: (reason as Error)?.stack?.substring(0, 1000) || '',
      },
    });
  }

  // ====================================================================
  // 网络错误采集(由共享 fetch 拦截器回调)
  // ====================================================================

  /** @internal */
  _ingestNetworkError(url: string, method: string, status: number, statusText: string, startTime: number): void {
    this._ingest({
      id: this._makeId('network', url + status),
      source: 'network',
      severity: status >= 500 ? 'critical' : 'warning',
      timestamp: new Date().toISOString(),
      message: `HTTP ${status} ${statusText}`,
      details: {
        url: this._sanitizeUrl(url),
        method,
        status,
        statusText,
        durationMs: Date.now() - startTime,
      },
    });
  }

  /** @internal */
  _ingestNetworkFailure(url: string, method: string, errMsg: string, startTime: number): void {
    this._ingest({
      id: this._makeId('network', url + 'fail'),
      source: 'network',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      message: `Network failure: ${errMsg}`,
      details: {
        url: this._sanitizeUrl(url),
        method,
        durationMs: Date.now() - startTime,
      },
    });
  }

  // ====================================================================
  // DOM 错误弹窗检测
  // ====================================================================

  private _installDomObserver(): void {
    this._domObserver = new MutationObserver((mutations) => {
      try {
        for (const mutation of mutations) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            const el = node as Element;
            // 跳过 SDK 自身 DOM
            if (el.closest?.('.aiagent-sdk-host')) continue;
            this._checkErrorElement(el);
            // 也检查子元素(有些框架会包裹错误元素)
            try {
              const inner = el.querySelectorAll(ERROR_POPUP_SELECTORS);
              inner.forEach((child) => this._checkErrorElement(child));
            } catch { /* querySelector 可能失败 */ }
          }
        }
      } catch { /* 绝不影响宿主 */ }
    });

    this._domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private _uninstallDomObserver(): void {
    if (this._domObserver) {
      this._domObserver.disconnect();
      this._domObserver = null;
    }
  }

  private _checkErrorElement(el: Element): void {
    if (!el.matches?.(ERROR_POPUP_SELECTORS)) return;
    const text = ((el as HTMLElement).innerText || el.textContent || '').trim();
    if (!text || text.length > this._maxMessageLength) return;

    this._ingest({
      id: this._makeId('dom_popup', text),
      source: 'dom_popup',
      severity: 'warning',
      timestamp: new Date().toISOString(),
      message: text,
      details: {
        tagName: el.tagName.toLowerCase(),
        className: (el.className?.toString?.() || '').substring(0, 200),
      },
    });
  }

  // ====================================================================
  // 全局拦截器安装/卸载
  // ====================================================================

  private _installGlobalInterceptors(): void {
    _savedOnError = window.onerror;
    window.onerror = _sharedOnError as unknown as OnErrorEventHandler;
    window.addEventListener('unhandledrejection', _sharedOnUnhandledRejection);
  }

  private _uninstallGlobalInterceptors(): void {
    window.onerror = _savedOnError;
    _savedOnError = null;
    window.removeEventListener('unhandledrejection', _sharedOnUnhandledRejection);
  }

  private _installNetworkInterceptors(): void {
    // fetch 拦截
    _savedFetch = window.fetch;
    window.fetch = _sharedFetch as typeof window.fetch;

    // XHR 拦截
    _savedXHROpen = XMLHttpRequest.prototype.open;
    _savedXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest & { __aia_method?: string; __aia_url?: string; __aia_start?: number },
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ) {
      this.__aia_method = method;
      this.__aia_url = String(url);
      this.__aia_start = Date.now();
      return _savedXHROpen!.apply(this, [method, url, ...rest] as Parameters<typeof XMLHttpRequest.prototype.open>);
    };

    XMLHttpRequest.prototype.send = function (
      this: XMLHttpRequest & { __aia_method?: string; __aia_url?: string; __aia_start?: number },
      ...args: Parameters<typeof XMLHttpRequest.prototype.send>
    ) {
      const url = this.__aia_url || '';
      const method = this.__aia_method || 'GET';
      const startTime = this.__aia_start || Date.now();

      // 检查是否任一活跃实例需要此请求
      let shouldMonitor = false;
      for (const inst of _activeInstances) {
        if (!inst._isOwnRequest(url)) {
          shouldMonitor = true;
          break;
        }
      }

      if (shouldMonitor) {
        this.addEventListener('load', function (this: XMLHttpRequest) {
          if (this.status >= 400) {
            for (const inst of _activeInstances) {
              try {
                if (!inst._isOwnRequest(url)) {
                  inst._ingestNetworkError(url, method, this.status, this.statusText, startTime);
                }
              } catch { /* 绝不影响宿主 */ }
            }
          }
        });
        this.addEventListener('error', function () {
          for (const inst of _activeInstances) {
            try {
              if (!inst._isOwnRequest(url)) {
                inst._ingestNetworkFailure(url, method, 'XHR error', startTime);
              }
            } catch { /* 绝不影响宿主 */ }
          }
        });
        this.addEventListener('timeout', function () {
          for (const inst of _activeInstances) {
            try {
              if (!inst._isOwnRequest(url)) {
                inst._ingestNetworkFailure(url, method, 'XHR timeout', startTime);
              }
            } catch { /* 绝不影响宿主 */ }
          }
        });
      }

      return _savedXHRSend!.apply(this, args);
    };
  }

  private _uninstallNetworkInterceptors(): void {
    if (_savedFetch) {
      window.fetch = _savedFetch;
      _savedFetch = null;
    }
    if (_savedXHROpen) {
      XMLHttpRequest.prototype.open = _savedXHROpen;
      _savedXHROpen = null;
    }
    if (_savedXHRSend) {
      XMLHttpRequest.prototype.send = _savedXHRSend;
      _savedXHRSend = null;
    }
  }

  // ====================================================================
  // Error Buffer — 环形缓冲 + 去重 + 脱敏
  // ====================================================================

  private _ingest(error: PageError): void {
    try {
      // 1. 用户回调(在过滤/脱敏之前)
      if (this._opts.onError) {
        try { this._opts.onError(error); } catch { /* 用户回调异常不影响采集 */ }
      }

      // 2. 过滤
      if (this._shouldIgnore(error)) return;

      // 3. 脱敏
      this._redact(error);

      // 4. 去重
      const lastSeen = this._recentIds.get(error.id);
      if (lastSeen && (Date.now() - lastSeen) < this._dedupeWindowMs) return;
      this._recentIds.set(error.id, Date.now());

      // 5. 环形缓冲
      if (this._buffer.length >= this._maxBufferSize) {
        this._buffer.shift();
      }
      this._buffer.push(error);

      // 6. 清理过期去重条目
      if (this._recentIds.size > this._maxBufferSize * 2) {
        const cutoff = Date.now() - this._dedupeWindowMs;
        for (const [id, ts] of this._recentIds) {
          if (ts < cutoff) this._recentIds.delete(id);
        }
      }

      // 7. UI 反馈:critical 错误触发角标和主动消息
      if (error.severity === 'critical') {
        this._notifyCritical(error);
      }
    } catch (e) {
      console.warn('[AIAgent SDK] pageAwareness._ingest failed:', e);
    }
  }

  private _notifyCritical(error: PageError): void {
    // 角标
    try {
      this._host.onErrorBadge?.(this._buffer.length);
    } catch { /* */ }

    // 主动系统消息(节流)
    if (this._host.isWidgetOpen()) {
      const now = Date.now();
      if (now - this._lastProactiveMsgTs >= PageAwareness.PROACTIVE_THROTTLE_MS) {
        this._lastProactiveMsgTs = now;
        try {
          this._host.appendSystemMsg(
            `检测到页面异常: ${error.message.substring(0, 100)}`
          );
        } catch { /* */ }
      }
    }
  }

  // ====================================================================
  // 过滤 & 脱敏
  // ====================================================================

  private _shouldIgnore(error: PageError): boolean {
    const filter = this._opts.filter;
    if (!filter) return false;

    if (filter.ignoreUrls) {
      const url = error.details.url as string;
      if (url) {
        for (const pattern of filter.ignoreUrls) {
          if (pattern.test(url)) return true;
        }
      }
    }

    if (filter.ignoreMessages) {
      for (const pattern of filter.ignoreMessages) {
        if (pattern.test(error.message)) return true;
      }
    }

    return false;
  }

  private _redact(error: PageError): void {
    error.message = this._applyRedaction(error.message);
    if (error.details) {
      for (const key of Object.keys(error.details)) {
        const val = error.details[key];
        if (typeof val === 'string') {
          error.details[key] = this._applyRedaction(val);
        }
      }
    }
  }

  private _applyRedaction(text: string): string {
    let result = text;
    for (const pattern of this._redactPatterns) {
      result = result.replace(pattern, '[REDACTED]');
    }
    return result;
  }

  // ====================================================================
  // 工具方法
  // ====================================================================

  /** 排除 SDK 自身请求,避免死循环和噪音 */
  _isOwnRequest(url: string): boolean {
    if (!url) return false;
    const ep = this._endpoint;
    return (
      url.startsWith(ep + '/chat/') ||
      url.startsWith(ep + '/dict/') ||
      url.startsWith(ep + '/auth/') ||
      url.includes('/ai-token')
    );
  }

  /** URL 脱敏:保留 path,query 参数值替换 */
  private _sanitizeUrl(url: string): string {
    try {
      const u = new URL(url, window.location.origin);
      const cleanParams = Array.from(u.searchParams.keys())
        .map((k) => `${k}=[...]`)
        .join('&');
      return u.origin + u.pathname + (cleanParams ? '?' + cleanParams : '');
    } catch {
      return url.substring(0, 200);
    }
  }

  /** 生成去重 ID */
  private _makeId(source: PageErrorSource, key: string): string {
    return source + ':' + key.substring(0, 100);
  }
}
