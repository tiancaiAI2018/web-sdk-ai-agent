/**
 * AIAgent 主类 —— 编排器,把 TokenCache / ToolsRegistry / Widget /
 * SSE 消费 / Markdown 渲染 / 录单模式全部串起来。
 *
 * 1:1 平移原 SDK 的 AIAgent.prototype.* 方法(原文件 165-1288),
 * 拆分到 ui/、core/、markdown.ts、sse.ts、tools.ts、extract.ts 等模块;
 * 原型方法保留,只把内部实现委托给模块。
 *
 * 公共 API 保持原样,完全向后兼容:
 *   AIAgent.init({...})        // 工厂
 *   agent.stream({...})        // 不带 UI 的程序化流
 *   agent.registerTools({...}) // 工具注册
 *   agent.unregisterTools({...})
 *   agent.listTools({...})
 *   agent.startExtractSession({...})
 *   agent.stopExtractSession()
 *   agent.open() / .close() / .toggle()
 *   agent.setTheme({theme:'dark'})
 *   agent.destroy()
 *
 * 兼容性细节:
 *   - agent._opts 仍是公共字段(host-page.html 第 114 行读取)
 *   - sessionStorage key "pending:{sid}" 形状不变
 *   - 所有 CSS class 名前缀不变
 *   - 浮窗注入位置:document.body,定位 bottom-right/bottom-left
 */

import { TokenCache } from './auth';
import { consumeSseStream } from './sse';
import {
  renderMarkdownLite,
  decorateImages,
  ensureMarkdown,
} from './markdown';
import {
  ToolsRegistry,
  registerRemote,
  unregisterRemote,
  listRemote,
  postAbort,
  postToolResult,
  renderToolResultFailedCard,
  resumePendingToolResults,
  type ToolCtx,
} from './tools';
import {
  toggleExtractMode,
  startExtractSession,
  stopExtractSession,
  type ExtractCtx,
} from './extract';
import { Widget } from '../ui/widget';
import { applyTheme, DEFAULT_THEME } from '../ui/theme';
import { appendMessage, createMessageEl } from '../ui/components/message';
import {
  appendTyping,
  clearTypingParticles,
  markTypingActive,
  unmarkTypingActive,
} from '../ui/components/typing';
import {
  markToolCardSuccess,
  updateToolCardProgress,
} from '../ui/components/tool-card';
import type {
  AIAgentOptions,
  Message,
  PendingToolCall,
  SSEEvent,
  StreamOptions,
  RegisterToolsOptions,
  UnregisterToolsOptions,
  ListToolsOptions,
  StartExtractOptions,
  ToolDef,
  ToolCallPayload,
  MessageRole,
} from './types';

// 默认 demoOrderTools(原文件 189-207)
const DEFAULT_DEMO_TOOLS: ToolDef[] = [
  {
    name: 'submit_form',
    description:
      'Submit the collected order fields. Call only when ALL required fields are collected.',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: '订单编号,如 PO-2024-001' },
        customerName: { type: 'string', description: '客户全名' },
        customerPhone: { type: 'string', description: '11 位手机号' },
        items: { type: 'string', description: '商品清单' },
        totalAmount: { type: 'number', description: '订单总金额,单位元' },
        notes: { type: 'string', description: '其他备注' },
      },
      required: ['orderId', 'customerName', 'items', 'totalAmount'],
    },
    strict: true,
  },
];

export class AIAgent {
  // ===== init 时填的字段(host-page.html demo 读 agent._opts)=====
  endpoint!: string;
  getAccessToken!: () => Promise<{
    accessToken: string;
    refreshToken?: string;
  }>;
  /** 公共字段:host-page.html 第 114 行读 agent._opts.demoOrderTools */
  _opts!: {
    title: string;
    subtitle: string;
    placeholder: string;
    welcomeMessage: string;
    theme: 'ink' | 'paper' | 'dark' | 'light';
    position: 'bottom-right' | 'bottom-left';
    autoOpen: boolean;
    avatar: string;
    clientPrefix: string;
    demoTools: boolean;
    demoOrderTools: ToolDef[];
  };

  // ===== 内部状态 =====
  _tokenCache = new TokenCache();
  _tools = new ToolsRegistry();
  _widget: Widget | null = null;
  _isOpen = false;
  _busy = false;
  _messages: Message[] = [];
  _chatSessionId: string | null = null;
  _activeTools: string[] = [];
  _extractOnCall: ((payload: Record<string, unknown>) => unknown) | null = null;
  _pendingToolCall: PendingToolCall | null = null;
  _demoSessionId: string | null = null;
  /** 最近一张工具调用卡片的根元素(供 _postToolResult 标记成功/失败用) */
  _lastToolCard: HTMLElement | null = null;

  // ====================================================================
  // 公共入口
  // ====================================================================

  init(opts: AIAgentOptions): this {
    if (!opts || !opts.endpoint) throw new Error('endpoint required');
    if (typeof opts.getAccessToken !== 'function')
      throw new Error('getAccessToken() required');
    this.endpoint = String(opts.endpoint).replace(/\/+$/, '');
    this.getAccessToken = opts.getAccessToken;

    // ===== 浮窗配置(默认 + 用户覆盖)=====
    this._opts = {
      title: opts.title || 'AI 助手',
      subtitle: opts.subtitle || '在线',
      placeholder:
        opts.placeholder || '输入消息,Enter 发送,Shift+Enter 换行',
      welcomeMessage:
        opts.welcomeMessage || '你好!我是 AI 助手,有什么可以帮你的?',
      theme: opts.theme || 'ink',
      position: opts.position || 'bottom-right',
      autoOpen: !!opts.autoOpen,
      avatar: opts.avatar || '🤖',
      clientPrefix: opts.clientPrefix || 'app',
      demoTools: !!opts.demoTools,
      demoOrderTools: opts.demoOrderTools || DEFAULT_DEMO_TOOLS,
    };

    // ===== 挂载浮窗 =====
    this._widget = new Widget(this._opts, {
      onSend: () => this._onSend(),
      onNew: () => this._newSession(),
      onClose: () => this.close(),
      onToggleExtract: () => this._toggleExtractMode(),
      onPanelOpen: () => {
        /* no-op,保留钩子 */
      },
    });
    this._widget.mount();

    if (this._opts.autoOpen) this.open();

    // 欢迎区(专属 UI,不是消息):init 后显示在 messages 之上
    // 用户发第一条消息后会自动 hideWelcome
    if (this._opts.welcomeMessage) {
      this._widget.setWelcome(this._opts.welcomeMessage);
    }

    // 启动时扫 sessionStorage 续传上次未提交的 tool result(异步,不影响 init)
    setTimeout(() => {
      void this._resumePendingToolResults();
    }, 0);

    // demoTools 模式:init 后台异步注册 demo 工具组
    if (this._opts.demoTools) {
      this._demoSessionId = this._opts.clientPrefix + ':demo';
      this._internalRegister(this._demoSessionId, this._opts.demoOrderTools)
        .then(() => {
          /* ok */
        })
        .catch((e) => {
          console.warn('[AIAgent SDK] demo tools register failed:', e);
        });
    }

    return this;
  }

  destroy(): void {
    if (this._widget) {
      this._widget.destroy();
      this._widget = null;
    }
  }

  // ====================================================================
  // 公共 API — 工具注册(对应原 registerTools / unregisterTools / listTools)
  // ====================================================================

  async registerTools(opts: RegisterToolsOptions): Promise<unknown> {
    if (!opts || !opts.sessionId) throw new Error('sessionId required');
    if (!opts.tools || !opts.tools.length) throw new Error('tools required');
    return this._internalRegister(opts.sessionId, opts.tools);
  }

  async unregisterTools(opts: UnregisterToolsOptions): Promise<unknown> {
    const o = opts || ({} as UnregisterToolsOptions);
    if (!o.sessionId) throw new Error('sessionId required');
    const names = o.names || null; // null = 全清
    // 本地清
    this._tools.unregister(o.sessionId, names);
    // 后端清
    const token = await this._ensureToken();
    return unregisterRemote(this.endpoint, token, o.sessionId, names);
  }

  async listTools(opts: ListToolsOptions): Promise<unknown> {
    const o = opts || ({} as ListToolsOptions);
    if (!o.sessionId) throw new Error('sessionId required');
    const token = await this._ensureToken();
    return listRemote(this.endpoint, token, o.sessionId);
  }

  // 内部:把 tool 定义存到 _tools,后端只接 schema 不接 onCall
  private async _internalRegister(
    sessionId: string,
    toolDefs: ToolDef[]
  ): Promise<unknown> {
    const schemaOnly = this._tools.register(sessionId, toolDefs);
    const token = await this._ensureToken();
    return registerRemote(this.endpoint, token, sessionId, schemaOnly);
  }

  /** 内部:本地查 tool 定义 */
  _getLocalTool(sessionId: string, name: string) {
    return this._tools.get(sessionId, name);
  }

  // ====================================================================
  // 公共 API — 录单
  // ====================================================================

  startExtractSession(opts: StartExtractOptions): void {
    const ctx = this._extractCtx();
    startExtractSession(ctx, opts);
  }

  stopExtractSession(): void {
    stopExtractSession(this._extractCtx());
  }

  /** 浮窗 📋 按钮 */
  private _toggleExtractMode(): void {
    toggleExtractMode(this._extractCtx());
  }

  // ====================================================================
  // 公共 API — 不带 UI 的流式(老 SDK 兼容)
  // ====================================================================

  async stream(opts: StreamOptions): Promise<void> {
    const o = opts || ({} as StreamOptions);
    return this._postStream({
      sessionId: o.sessionId,
      message: o.message,
      activeTools: o.activeTools || [],
      onChunk: o.onChunk || (() => {}),
      onDone: o.onDone || (() => {}),
      onError: o.onError || ((e) => console.error(e)),
      onToolCall: o.onToolCall,
    });
  }

  // ====================================================================
  // 公共 API — UI 控制
  // ====================================================================

  open(): void {
    if (this._widget) this._widget.open();
    this._isOpen = true;
  }
  close(): void {
    if (this._widget) this._widget.close();
    this._isOpen = false;
  }
  toggle(): void {
    if (this._widget) this._widget.toggle();
    this._isOpen = this._widget ? this._widget.getIsOpen() : false;
  }

  /** 切换主题(ink/paper/dark/light) */
  setTheme(opts: { theme: 'ink' | 'paper' | 'dark' | 'light' }): void {
    if (this._widget) applyTheme(this._widget, opts.theme);
  }

  // ====================================================================
  // 内部:token / 新会话 / 发送
  // ====================================================================

  /** 内部:拉 token(委托给 TokenCache) */
  async _ensureToken(): Promise<string> {
    return this._tokenCache.get(this.getAccessToken);
  }

  /** 新会话:abort 旧 sid + 清消息 + 重置 */
  private _newSession(): void {
    const oldSid = this._chatSessionId;
    if (oldSid) postAbort(this.endpoint, '', oldSid).catch(() => {});
    if (this._widget) this._widget.clearMessages();
    this._messages = [];
    this._activeTools = [];
    this._extractOnCall = null;
    this._chatSessionId = null;
    // 新会话:重新显示 welcome 区(如果是新会话)
    if (this._widget && this._opts.welcomeMessage) {
      this._widget.setWelcome(this._opts.welcomeMessage);
    }
  }

  /** 内部:输入栏发送 */
  private _onSend(): void {
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    const text = refs.taEl.value.trim();
    if (!text || this._busy) return;
    refs.taEl.value = '';
    refs.taEl.style.height = 'auto';
    void this._sendUserMessage(text);
  }

  /**
   * 内部:用户发消息 → 调后端 → 渲染。
   * 渲染策略:复用 typing div 作为"正在写"的助手消息 —
   * onChunk 一直改它,onDone 时它已经是最新的最终内容,不再 append 新 div。
   * 这样不会"页面显示少一段"。
   */
  async _sendUserMessage(text: string): Promise<void> {
    // 用户开始对话 → 隐藏 welcome 区(它的工作已经完成)
    if (this._widget) this._widget.hideWelcome();
    this._appendMsg('user', text);
    this._setBusy(true);
    const refs = this._widget!.getRefs()!;
    // assistant 消息占位(内部是 5 颗粒子,等第一次 onChunk 到达时清空填文本)
    const typing = appendTyping(refs.msgEl);
    let assistantBuf = '';
    const self = this;
    const activeSnapshot = this._activeTools.slice();
    const onCallSnapshot = this._extractOnCall;
    let submitted = false;
    let replaced = false; // typing 第一次变 assistant 消息的标志

    function upgradeTyping() {
      if (!replaced) {
        replaced = true;
        // 第一次有内容到达:清空粒子 + 流式光标 active
        clearTypingParticles(typing);
        markTypingActive(typing);
      }
    }

    const postOpts: {
      sessionId?: string;
      message: string;
      activeTools?: string[];
      onChunk: (ev: SSEEvent) => void;
      onDone: () => void;
      onError: (e: Error) => void;
      onToolCall: (parsed: ToolCallPayload) => Promise<void>;
    } = {
      message: text,
      onChunk: (ev: SSEEvent) => {
        assistantBuf += ev.data || '';
        upgradeTyping();
        typing.innerHTML = renderMarkdownLite(assistantBuf);
        decorateImages(typing);
        refs.msgEl.scrollTop = refs.msgEl.scrollHeight;
      },
      onDone: () => {
        upgradeTyping();
        unmarkTypingActive(typing); // 移除流式光标
        typing.innerHTML = renderMarkdownLite(assistantBuf);
        decorateImages(typing);
        refs.msgEl.scrollTop = refs.msgEl.scrollHeight;
        // 若本轮有 tool_call,_postToolResult 会接管 busy(在它的 onDone 里关),
        // 避免用户在工具结果回传完成前又发新消息撞 409
        if (!submitted) self._setBusy(false);
      },
      onError: (e: Error) => {
        // 错误时清掉粒子(占位 div 转为 system 消息)
        clearTypingParticles(typing);
        if (replaced) {
          unmarkTypingActive(typing);
          typing.className = 'aiagent-sdk-msg aiagent-sdk-msg-system';
          typing.textContent = '⚠️ 错误:' + e.message;
        } else {
          typing.remove();
          self._appendMsg('system', '⚠️ 错误:' + e.message);
        }
        self._setBusy(false);
        submitted = true; // 错误时也不让 _postToolResult 接管 busy
      },
      onToolCall: async (parsed: ToolCallPayload) => {
        if (!parsed || !parsed.tool) return;
        // 过滤掉 AgentScope 内部的工具(框架用 __fragment__ 推流式分片)
        if (parsed.tool.indexOf('__') === 0) return;
        // 必须有非空 args 才是"完整可执行"调用
        if (!parsed.args || typeof parsed.args !== 'object') return;
        const keys = Object.keys(parsed.args);
        if (!keys.length) return;
        if (submitted) return; // 一个 stream 内只处理第一次"完整"调用
        submitted = true;
        // 添加工具调用卡片(油彩终端);保存引用供后续更新进度
        self._appendMsg('tool', '', { tool: parsed.tool, args: parsed.args });
        // 找到刚加的卡片(最新一张 .aiagent-sdk-tool-card)
        const cards = refs.msgEl.querySelectorAll('.aiagent-sdk-tool-card');
        self._lastToolCard = cards.length ? (cards[cards.length - 1] as HTMLElement) : null;
        if (self._lastToolCard) {
          updateToolCardProgress(self._lastToolCard, 30, '执行中…');
        }
        // 调本地 onCall 拿 result
        let toolResult: unknown;
        const localTool = self._getLocalTool(
          self._chatSessionId!,
          parsed.tool
        );
        if (localTool && localTool.onCall) {
          try {
            toolResult = await Promise.resolve(localTool.onCall(parsed.args));
          } catch (e) {
            console.error('[AIAgent SDK] onCall threw:', e);
            self._appendMsg('system', '⚠️ onCall 失败: ' + (e as Error).message);
          }
        }
        // 浮窗录单模式下,onCallSnapshot 是 startExtractSession 时传进来的 onFormSubmit
        if (onCallSnapshot && parsed.tool === 'submit_form') {
          try {
            const r = onCallSnapshot(parsed.args);
            if (r != null && toolResult == null) toolResult = r;
          } catch (e) {
            console.error('[AIAgent SDK] extract onCall threw:', e);
          }
        }
        if (self._lastToolCard) {
          updateToolCardProgress(self._lastToolCard, 60, '提交结果…');
        }
        // 把 result 回传后端,触发 LLM 看到结果后继续(官方 TOOL 恢复模式)
        if (parsed.id) {
          await self._postToolResult(parsed.id, toolResult, self._lastToolCard);
        }
      },
    };

    if (!this._chatSessionId) {
      this._chatSessionId = this._opts.clientPrefix + ':user-' + Date.now();
    }
    postOpts.sessionId = this._chatSessionId;
    postOpts.activeTools = activeSnapshot;

    try {
      await this._postStream(postOpts);
    } catch (e) {
      /* _postStream 内部已 onError */
    }
  }

  _setBusy(busy: boolean): void {
    this._busy = busy;
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    refs.sendBtn.disabled = busy;
    refs.sendBtn.textContent = busy ? '...' : '发送';
  }

  /** 简单 sleep —— _postToolResult 指数退避用 */
  _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ====================================================================
  // 内部:消息渲染(委托给 ui/components/message)
  // ====================================================================

  _appendMsg(
    role: MessageRole,
    text: string,
    data?: { tool: string; args: Record<string, unknown> }
  ): void {
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    // stagger 索引 = 当前消息总数
    appendMessage(refs.msgEl, role, text, this._messages.length, data);
    this._messages.push({ role, text, data });
  }

  _appendTyping(): HTMLDivElement {
    if (!this._widget) return document.createElement('div');
    const refs = this._widget.getRefs();
    if (!refs) return document.createElement('div');
    return appendTyping(refs.msgEl);
  }

  // ====================================================================
  // 内部:POST + SSE(无 tool_call)
  // ====================================================================

  async _postStream(opts: {
    sessionId?: string;
    message?: string;
    activeTools?: string[];
    onChunk?: (ev: SSEEvent) => void;
    onDone?: () => void;
    onError?: (e: Error) => void;
    onToolCall?: (parsed: ToolCallPayload) => void;
  }): Promise<void> {
    const sessionId = opts.sessionId;
    const message = opts.message;
    const activeTools = opts.activeTools;
    const onChunk = opts.onChunk || (() => {});
    const onDone = opts.onDone || (() => {});
    const onError = opts.onError || ((e: Error) => console.error(e));
    const onToolCall = opts.onToolCall;

    if (!sessionId) {
      onError(new Error('sessionId required'));
      return;
    }
    if (message == null) {
      onError(new Error('message required'));
      return;
    }

    let token: string;
    try {
      token = await this._ensureToken();
    } catch (e) {
      onError(e as Error);
      return;
    }

    const url =
      this.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/stream';
    const body: { message: string; activeTools?: string[] } = { message };
    if (activeTools && activeTools.length) body.activeTools = activeTools;

    let r: Response;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      onError(e as Error);
      return;
    }
    if (!r.ok || !r.body) {
      onError(new Error('http ' + r.status));
      return;
    }
    return consumeSseStream(r.body, onChunk, onDone, onError, onToolCall);
  }

  // ====================================================================
  // 内部:TOOL_SUSPENDED 恢复(委托给 tools.ts)
  // ====================================================================

  /** 暴露一个 postToolResult 包装,供 _sendUserMessage 的 onToolCall 调 */
  async _postToolResult(
    toolUseId: string,
    result: unknown,
    card?: HTMLElement | null
  ): Promise<void> {
    const ctx = this._toolCtx();
    return postToolResult(ctx, toolUseId, result, card);
  }

  /** 启动时续传 — 委托 tools.ts */
  private async _resumePendingToolResults(): Promise<void> {
    return resumePendingToolResults(this._toolCtx());
  }

  // ====================================================================
  // 内部:构造 ctx(给 tools.ts / extract.ts 注入依赖)
  // ====================================================================

  private _toolCtx(): ToolCtx {
    const self = this;
    return {
      endpoint: this.endpoint,
      ensureToken: () => self._ensureToken(),
      getSessionId: () => self._chatSessionId,
      getPending: () => self._pendingToolCall,
      setPending: (p) => {
        self._pendingToolCall = p;
      },
      appendMsg: (role, text, data) => self._appendMsg(role, text, data),
      setBusy: (b) => self._setBusy(b),
      sleep: (ms) => self._sleep(ms),
      appendTyping: () => self._appendTyping(),
      getMsgEl: () => {
        const refs = self._widget?.getRefs();
        return refs?.msgEl || document.createElement('div');
      },
    };
  }

  private _extractCtx(): ExtractCtx {
    const self = this;
    return {
      clientPrefix: this._opts.clientPrefix,
      getDemoSessionId: () => self._demoSessionId,
      getChatSessionId: () => self._chatSessionId,
      setChatSessionId: (sid) => {
        self._chatSessionId = sid;
      },
      getActiveTools: () => self._activeTools,
      setActiveTools: (t) => {
        self._activeTools = t;
      },
      getExtractOnCall: () => self._extractOnCall,
      setExtractOnCall: (fn) => {
        self._extractOnCall = fn;
      },
      hasLocalTool: (sid, name) => !!self._tools.get(sid, name),
      registerTools: (sid, tools) => self._internalRegister(sid, tools || []),
      sendUserMessage: (text) => self._sendUserMessage(text),
      appendMsg: (role, text) => self._appendMsg(role, text),
    };
  }
}

/** 工厂函数 — 暴露 init(opts) 用法(老 SDK 完全兼容) */
export function createAIAgent(): { init: (opts: AIAgentOptions) => AIAgent } {
  return {
    init: (opts: AIAgentOptions) => new AIAgent().init(opts),
  };
}
