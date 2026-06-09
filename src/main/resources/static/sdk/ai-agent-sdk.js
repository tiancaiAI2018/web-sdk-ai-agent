/**
 * AIAgent SDK v3 — 浏览器 UMD bundle
 *
 * 设计原则:
 *   - SDK 不持 secret,secret 永远在第三方自家后端
 *   - SDK 接受一个 `getAccessToken` 钩子,由第三方业务自己实现
 *     (内部用 client_credentials 调我方,或用 refresh_token 续期)
 *   - SDK 内部缓存 access_token,临近过期时自动重调 getAccessToken 续期
 *   - SSE 解析逻辑沿用 v1(EventSource 自动重连用不上,自己 fetch 控流)
 *   - v3:
 *       a) **浮窗机器人 UI**:init() 后自动在右下角插入气泡 + 聊天面板,
 *          第三方页面不用写一行 DOM 就能用。
 *       b) **智能录单**:startExtractSession 带 schema 启动,模型调 submit_form
 *          工具把字段值推回 onFormSubmit 回调,UI 模式会同时在聊天框内显示
 *          "📋 已提交表单"卡片。
 *
 * 最小用法(3 行):
 *   <script src="https://your-host/sdk/ai-agent-sdk.js"></script>
 *   <script>
 *     const agent = AIAgent.init({
 *       endpoint: 'https://your-host',
 *       getAccessToken: async () => ({ accessToken: await fetchTokenFromMyBackend() })
 *     });
 *     // 浮窗已经在右下角出现;点开就能聊
 *   </script>
 *
 * 智能录单用法:
 *   agent.startExtractSession({
 *     sessionId: 'my-app:order-' + Date.now(),
 *     fields: [
 *       {name:'orderId', type:'string', required:true, hint:'订单编号'},
 *       {name:'customerName', type:'string', required:true, hint:'客户全名'}
 *     ],
 *     onFormSubmit: payload => fillMyForm(payload)
 *   });
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AIAgent = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // ====================================================================
  // CSS(注入一次,带 aiagent-sdk- 前缀避免污染第三方页面)
  // ====================================================================
  var CSS = [
    '.aiagent-sdk-bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(59,130,246,.4);z-index:2147483600;display:flex;align-items:center;justify-content:center;font-size:28px;transition:transform .2s,box-shadow .2s;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
    '.aiagent-sdk-bubble:hover{transform:scale(1.08);box-shadow:0 8px 28px rgba(59,130,246,.55)}',
    '.aiagent-sdk-bubble.aiagent-sdk-hidden{display:none}',
    '.aiagent-sdk-panel{position:fixed;bottom:96px;right:24px;width:380px;height:540px;max-height:80vh;background:#fff;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.18);z-index:2147483600;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border:1px solid #e5e7eb}',
    '.aiagent-sdk-panel.aiagent-sdk-open{display:flex;animation:aiagent-sdk-slide .2s ease-out}',
    '@keyframes aiagent-sdk-slide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark{background:#1f2937;color:#e5e7eb;border-color:#374151}',
    '.aiagent-sdk-header{padding:14px 16px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;font-weight:600;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}',
    '.aiagent-sdk-header-info{display:flex;flex-direction:column;min-width:0}',
    '.aiagent-sdk-title{font-size:14px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.aiagent-sdk-subtitle{font-size:11px;opacity:.85;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.aiagent-sdk-header-actions{display:flex;gap:4px}',
    '.aiagent-sdk-iconbtn{background:transparent;border:none;color:#fff;cursor:pointer;width:26px;height:26px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;padding:0;opacity:.85}',
    '.aiagent-sdk-iconbtn:hover{background:rgba(255,255,255,.15);opacity:1}',
    '.aiagent-sdk-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#f9fafb}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-messages{background:#111827}',
    '.aiagent-sdk-msg{max-width:85%;padding:9px 12px;border-radius:10px;font-size:13.5px;line-height:1.55;word-wrap:break-word;white-space:pre-wrap;animation:aiagent-sdk-fade .15s ease-out}',
    '@keyframes aiagent-sdk-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}',
    '.aiagent-sdk-msg-user{align-self:flex-end;background:#3b82f6;color:#fff;border-bottom-right-radius:2px}',
    '.aiagent-sdk-msg-assistant{align-self:flex-start;background:#fff;color:#1f2937;border:1px solid #e5e7eb;border-bottom-left-radius:2px}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg-assistant{background:#374151;color:#e5e7eb;border-color:#4b5563}',
    '.aiagent-sdk-msg-system{align-self:center;background:transparent;color:#9ca3af;font-size:11.5px;font-style:italic;padding:4px 8px}',
    '.aiagent-sdk-msg-tool{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;font-size:12.5px;padding:10px 12px;align-self:flex-start;max-width:90%;border-radius:10px;border-bottom-left-radius:2px;font-family:ui-monospace,"Cascadia Code",monospace}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg-tool{background:#064e3b;color:#a7f3d0;border-color:#047857}',
    '.aiagent-sdk-msg-tool .aiagent-sdk-tool-title{font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:600;margin-bottom:4px;font-size:12px}',
    '.aiagent-sdk-msg-tool pre{margin:4px 0 0;white-space:pre-wrap;word-wrap:break-word;font-size:11.5px}',
    '.aiagent-sdk-msg b{font-weight:600}',
    '.aiagent-sdk-msg code{background:rgba(0,0,0,.08);padding:1px 4px;border-radius:3px;font-size:12.5px;font-family:ui-monospace,monospace}',
    '.aiagent-sdk-msg-assistant code{background:rgba(0,0,0,.06)}',
    '.aiagent-sdk-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:10px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;border-bottom-left-radius:2px}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-typing{background:#374151;border-color:#4b5563}',
    '.aiagent-sdk-typing span{width:6px;height:6px;border-radius:50%;background:#9ca3af;animation:aiagent-sdk-bounce 1.2s infinite}',
    '.aiagent-sdk-typing span:nth-child(2){animation-delay:.2s}',
    '.aiagent-sdk-typing span:nth-child(3){animation-delay:.4s}',
    '@keyframes aiagent-sdk-bounce{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}',
    '.aiagent-sdk-inputbar{padding:10px;border-top:1px solid #e5e7eb;background:#fff;display:flex;gap:6px;flex-shrink:0}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-inputbar{background:#1f2937;border-top-color:#374151}',
    '.aiagent-sdk-inputbar textarea{flex:1;resize:none;border:1px solid #d1d5db;border-radius:8px;padding:8px 10px;font:inherit;font-size:13.5px;line-height:1.4;outline:none;max-height:80px;background:#fff;color:#1f2937;font-family:inherit}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-inputbar textarea{background:#374151;color:#e5e7eb;border-color:#4b5563}',
    '.aiagent-sdk-inputbar textarea:focus{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.15)}',
    '.aiagent-sdk-send{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:0 14px;cursor:pointer;font-size:13px;font-weight:500;transition:background .15s;min-width:54px}',
    '.aiagent-sdk-send:hover:not(:disabled){background:#2563eb}',
    '.aiagent-sdk-send:disabled{background:#9ca3af;cursor:not-allowed}',
    '.aiagent-sdk-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:10px;min-width:18px;height:18px;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 0 0 2px #fff}',
    '.aiagent-sdk-panel.aiagent-sdk-pos-bl{right:auto;left:24px}',
    '.aiagent-sdk-bubble.aiagent-sdk-pos-bl{right:auto;left:24px}'
  ].join('');

  function injectCss() {
    if (document.getElementById('aiagent-sdk-styles')) return;
    var s = document.createElement('style');
    s.id = 'aiagent-sdk-styles';
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);
  }

  // ====================================================================
  // AIAgent 类
  // ====================================================================
  function AIAgent() {}

  AIAgent.prototype.init = function (opts) {
    if (!opts || !opts.endpoint) throw new Error('endpoint required');
    if (typeof opts.getAccessToken !== 'function') throw new Error('getAccessToken() required');
    this.endpoint = String(opts.endpoint).replace(/\/+$/, '');
    this.getAccessToken = opts.getAccessToken;

    // ===== 浮窗配置 =====
    this._opts = {
      title: opts.title || 'AI 助手',
      subtitle: opts.subtitle || '在线',
      placeholder: opts.placeholder || '输入消息,Enter 发送,Shift+Enter 换行',
      welcomeMessage: opts.welcomeMessage || '你好!我是 AI 助手,有什么可以帮你的?',
      theme: opts.theme || 'light',  // 'light' | 'dark'
      position: opts.position || 'bottom-right',  // 'bottom-right' | 'bottom-left'
      autoOpen: !!opts.autoOpen,  // 是否自动展开面板
      avatar: opts.avatar || '🤖',  // 气泡图标
      // 默认 sessionId 前缀(对应 clientId)
      clientPrefix: opts.clientPrefix || 'app',
      // demoTools: true → SDK 内部自动注册一组"订单"工具(用 demo sessionId),
      // 浮窗右上角会出现"📋 录单"按钮,点开调 startExtractSession
      demoTools: !!opts.demoTools,
      // 浮窗内可注册的"录单"工具(若 demoTools=true 则默认填这一组)
      demoOrderTools: opts.demoOrderTools || [
        {
          name: 'submit_form',
          description: 'Submit the collected order fields. Call only when ALL required fields are collected.',
          parameters: {
            type: 'object',
            properties: {
              orderId:       { type: 'string',  description: '订单编号,如 PO-2024-001' },
              customerName:  { type: 'string',  description: '客户全名' },
              customerPhone: { type: 'string',  description: '11 位手机号' },
              items:         { type: 'string',  description: '商品清单' },
              totalAmount:   { type: 'number',  description: '订单总金额,单位元' },
              notes:         { type: 'string',  description: '其他备注' }
            },
            required: ['orderId', 'customerName', 'items', 'totalAmount']
          },
          strict: true
        }
      ]
    };

    // token 缓存
    this._accessToken = null;
    this._expEpoch = 0;

    // 浮窗状态
    this._isOpen = false;
    this._busy = false;
    this._messages = [];

    // 当前会话 + 当前激活的工具集合(浮窗模式下)
    this._chatSessionId = null;
    this._activeTools = [];   // 当前 stream 想激活的工具名
    this._extractOnCall = null;  // submit_form 调时执行的回调(浮窗录单模式)

    // 工具池:sessionId → name → tool 定义(本地存,后端只存 schema 不存 onCall)
    this._tools = new Map();  // Map<sessionId, Map<name, {description, parameters, strict, onCall}>>

    this._mount();
    if (this._opts.autoOpen) this.open();

    // demoTools 模式:init 后台异步注册 demo 工具组(用内部固定 sessionId)
    if (this._opts.demoTools) {
      var self = this;
      this._demoSessionId = this._opts.clientPrefix + ':demo';
      this._internalRegister(this._demoSessionId, this._opts.demoOrderTools)
        .catch(function (e) { console.warn('[AIAgent SDK] demo tools register failed:', e); });
    }
    return this;
  };

  // ====================================================================
  // 浮窗 DOM 挂载
  // ====================================================================
  AIAgent.prototype._mount = function () {
    if (typeof document === 'undefined') return;
    injectCss();
    var pos = this._opts.position === 'bottom-left' ? 'aiagent-sdk-pos-bl' : '';

    // 气泡按钮
    var bubble = document.createElement('button');
    bubble.className = 'aiagent-sdk-bubble ' + pos;
    bubble.setAttribute('aria-label', this._opts.title);
    bubble.title = this._opts.title;
    bubble.innerHTML = this._opts.avatar;
    bubble.addEventListener('click', () => this.toggle());
    document.body.appendChild(bubble);
    this._bubble = bubble;

    // 面板
    var panel = document.createElement('div');
    panel.className = 'aiagent-sdk-panel ' + pos +
      (this._opts.theme === 'dark' ? ' aiagent-sdk-theme-dark' : '');
    var demoToolsBtn = this._opts.demoTools
      ? '<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式">📋</button>'
      : '';
    panel.innerHTML = [
      '<div class="aiagent-sdk-header">',
      '  <div class="aiagent-sdk-header-info">',
      '    <div class="aiagent-sdk-title"></div>',
      '    <div class="aiagent-sdk-subtitle"></div>',
      '  </div>',
      '  <div class="aiagent-sdk-header-actions">',
      demoToolsBtn,
      '    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话">＋</button>',
      '    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭">✕</button>',
      '  </div>',
      '</div>',
      '<div class="aiagent-sdk-messages"></div>',
      '<div class="aiagent-sdk-inputbar">',
      '  <textarea rows="1" placeholder=""></textarea>',
      '  <button class="aiagent-sdk-send">发送</button>',
      '</div>'
    ].join('');
    document.body.appendChild(panel);
    this._panel = panel;

    // 填文本
    panel.querySelector('.aiagent-sdk-title').textContent = this._opts.title;
    panel.querySelector('.aiagent-sdk-subtitle').textContent = this._opts.subtitle;
    var ta = panel.querySelector('textarea');
    ta.placeholder = this._opts.placeholder;

    // 绑定事件
    this._msgEl = panel.querySelector('.aiagent-sdk-messages');
    this._taEl = ta;
    this._sendBtn = panel.querySelector('.aiagent-sdk-send');
    panel.querySelector('.aiagent-sdk-close').addEventListener('click', () => this.close());
    panel.querySelector('.aiagent-sdk-new').addEventListener('click', () => this._newSession());
    var extractBtn = panel.querySelector('.aiagent-sdk-extract');
    if (extractBtn) extractBtn.addEventListener('click', () => this._toggleExtractMode());
    this._sendBtn.addEventListener('click', () => this._onSend());
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._onSend();
      }
    });
    // 自适应高度
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
    });

    // 欢迎语
    this._appendMsg('system', this._opts.welcomeMessage);
  };

  AIAgent.prototype.toggle = function () {
    if (this._isOpen) this.close(); else this.open();
  };
  AIAgent.prototype.open = function () {
    if (!this._panel) return;
    this._panel.classList.add('aiagent-sdk-open');
    this._isOpen = true;
    setTimeout(() => { if (this._taEl) this._taEl.focus(); }, 50);
  };
  AIAgent.prototype.close = function () {
    if (!this._panel) return;
    this._panel.classList.remove('aiagent-sdk-open');
    this._isOpen = false;
  };

  AIAgent.prototype._newSession = function () {
    // 清空消息 + 重置激活的工具 + 结束录单
    this._msgEl.innerHTML = '';
    this._messages = [];
    this._activeTools = [];
    this._extractOnCall = null;
    this._chatSessionId = null;
    this._appendMsg('system', '新会话已开启');
  };

  // ====================================================================
  // 消息渲染
  // ====================================================================
  AIAgent.prototype._appendMsg = function (role, text, data) {
    var div = document.createElement('div');
    if (role === 'user') div.className = 'aiagent-sdk-msg aiagent-sdk-msg-user';
    else if (role === 'assistant') div.className = 'aiagent-sdk-msg aiagent-sdk-msg-assistant';
    else if (role === 'tool') div.className = 'aiagent-sdk-msg aiagent-sdk-msg-tool';
    else div.className = 'aiagent-sdk-msg aiagent-sdk-msg-system';
    if (role === 'tool') {
      // data = {tool, args} —— 显示工具调用摘要
      div.innerHTML = '<div class="aiagent-sdk-tool-title">📋 ' + escapeHtml(data.tool || 'tool') + '</div>'
        + '<pre>' + escapeHtml(JSON.stringify(data.args, null, 2)) + '</pre>';
    } else {
      div.innerHTML = renderMarkdownLite(text || '');
    }
    this._msgEl.appendChild(div);
    this._msgEl.scrollTop = this._msgEl.scrollHeight;
    this._messages.push({ role: role, text: text, data: data });
  };

  AIAgent.prototype._appendTyping = function () {
    var div = document.createElement('div');
    div.className = 'aiagent-sdk-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    this._msgEl.appendChild(div);
    this._msgEl.scrollTop = this._msgEl.scrollHeight;
    return div;
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  // 简单 markdown:换行 + **bold** + `code`
  function renderMarkdownLite(text) {
    var t = escapeHtml(text);
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    return t;
  }

  // ====================================================================
  // Token 管理
  // ====================================================================
  AIAgent.prototype._ensureToken = async function () {
    var now = Math.floor(Date.now() / 1000);
    if (this._accessToken && this._expEpoch > now + 30) return this._accessToken;
    console.log('[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...');
    var got = await this.getAccessToken();
    if (!got || !got.accessToken) {
      throw new Error('getAccessToken() must return { accessToken }');
    }
    this._accessToken = got.accessToken;
    this._expEpoch = parseJwtExp(got.accessToken) || (now + 300);
    return this._accessToken;
  };

  // ====================================================================
  // 发送处理
  // ====================================================================
  AIAgent.prototype._onSend = function () {
    var text = this._taEl.value.trim();
    if (!text || this._busy) return;
    this._taEl.value = '';
    this._taEl.style.height = 'auto';
    this._sendUserMessage(text);
  };

  /**
   * 内部:用户发消息 → 调后端 → 渲染。
   * 用 this._activeTools 数组作为激活的工具列表(浮窗顶部"📋 录单"按钮控制)。
   *
   * <p>渲染策略:<b>复用 typing div</b> 作为"正在写"的助手消息 ——
   * onChunk 一直改它,onDone 时它已经是最新的最终内容,<b>不再 append 新 div</b>。
   * 这样不会"页面显示少一段"。
   */
  AIAgent.prototype._sendUserMessage = async function (text) {
    this._appendMsg('user', text);
    this._setBusy(true);
    var typing = this._appendTyping();
    var assistantBuf = '';
    var self = this;
    var activeSnapshot = this._activeTools.slice();
    var onCallSnapshot = this._extractOnCall;
    var submitted = false;
    var replaced = false;  // typing 第一次变 assistant 消息的标志

    function upgradeTyping() {
      if (!replaced) {
        replaced = true;
        typing.className = 'aiagent-sdk-msg aiagent-sdk-msg-assistant';
      }
    }

    var postOpts = {
      message: text,
      onChunk: function (ev) {
        assistantBuf += (ev.data || '');
        upgradeTyping();
        typing.innerHTML = renderMarkdownLite(assistantBuf);
        self._msgEl.scrollTop = self._msgEl.scrollHeight;
      },
      onDone: function () {
        upgradeTyping();
        // **不**再 append 新 div —— typing 已经是最终内容
        typing.innerHTML = renderMarkdownLite(assistantBuf);
        self._msgEl.scrollTop = self._msgEl.scrollHeight;
        self._setBusy(false);
      },
      onError: function (e) {
        if (replaced) {
          // typing 已经被改造,改回显示错误
          typing.className = 'aiagent-sdk-msg aiagent-sdk-msg-system';
          typing.textContent = '⚠️ 错误:' + e.message;
        } else {
          // typing 还是"打字中"动画,直接移除
          typing.remove();
          self._appendMsg('system', '⚠️ 错误:' + e.message);
        }
        self._setBusy(false);
      },
      onToolCall: function (parsed) {
        if (!parsed || !parsed.tool) return;
        // 过滤掉 AgentScope 内部的工具(框架用 __fragment__ 推流式分片)
        if (parsed.tool.indexOf('__') === 0) return;
        // 必须有非空 args 才是"完整可执行"调用 —— 框架在增量生成 JSON 时
        // 会先用空对象推一次 tool_call,再后续补;空对象视为"未完成"
        if (!parsed.args || typeof parsed.args !== 'object') return;
        var keys = Object.keys(parsed.args);
        if (!keys.length) return;
        if (submitted) return;  // 一个 stream 内只处理第一次"完整"调用
        submitted = true;
        self._appendMsg('tool', '', { tool: parsed.tool, args: parsed.args });
        // 找本地注册时保存的 onCall 回调(按 sid + name)
        var localTool = self._getLocalTool(self._chatSessionId, parsed.tool);
        if (localTool && localTool.onCall) {
          try { localTool.onCall(parsed.args); }
          catch (e) { console.error('[AIAgent SDK] onCall threw:', e); }
        }
        // 浮窗录单模式下,onCallSnapshot 是 startExtractSession 时传进来的 onFormSubmit
        if (onCallSnapshot && parsed.tool === 'submit_form') {
          try { onCallSnapshot(parsed.args); }
          catch (e) { console.error('[AIAgent SDK] extract onCall threw:', e); }
        }
      }
    };

    if (!this._chatSessionId) {
      this._chatSessionId = this._opts.clientPrefix + ':user-' + Date.now();
    }
    postOpts.sessionId = this._chatSessionId;
    postOpts.activeTools = activeSnapshot;

    try { await this._postStream(postOpts); }
    catch (e) { /* _postStream 内部已 onError */ }
  };

  AIAgent.prototype._setBusy = function (busy) {
    this._busy = busy;
    this._sendBtn.disabled = busy;
    this._sendBtn.textContent = busy ? '...' : '发送';
  };

  // ====================================================================
  // 工具注册(对外 API) —— v3 重构
  // ====================================================================

  /**
   * 内部:把 tool 定义存到 _tools,后端只接 schema 不接 onCall。
   */
  AIAgent.prototype._internalRegister = async function (sessionId, toolDefs) {
    // 本地保存
    var inner = this._tools.get(sessionId) || new Map();
    var schemaOnly = [];
    for (var i = 0; i < toolDefs.length; i++) {
      var t = toolDefs[i];
      var local = {
        description: t.description || '',
        parameters: t.parameters || { type: 'object', properties: {} },
        strict: t.strict !== false,
        onCall: typeof t.onCall === 'function' ? t.onCall : null
      };
      inner.set(t.name, local);
      schemaOnly.push({
        name: t.name,
        description: local.description,
        parameters: local.parameters,
        strict: local.strict
      });
    }
    this._tools.set(sessionId, inner);
    // 发到后端
    var token = await this._ensureToken();
    var r = await fetch(this.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/register', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tools: schemaOnly })
    });
    if (!r.ok) {
      var txt = await r.text();
      throw new Error('register failed: ' + r.status + ' ' + txt);
    }
    return await r.json();
  };

  AIAgent.prototype.registerTools = async function (opts) {
    if (!opts || !opts.sessionId) throw new Error('sessionId required');
    if (!opts.tools || !opts.tools.length) throw new Error('tools required');
    return this._internalRegister(opts.sessionId, opts.tools);
  };

  AIAgent.prototype.unregisterTools = async function (opts) {
    opts = opts || {};
    if (!opts.sessionId) throw new Error('sessionId required');
    var names = opts.names || null;  // null = 全清
    // 本地清
    var inner = this._tools.get(opts.sessionId);
    if (inner) {
      if (!names || !names.length) {
        inner.clear();
        this._tools.delete(opts.sessionId);
      } else {
        for (var i = 0; i < names.length; i++) inner.delete(names[i]);
        if (inner.size === 0) this._tools.delete(opts.sessionId);
      }
    }
    // 后端清
    var token = await this._ensureToken();
    var r = await fetch(this.endpoint + '/chat/' + encodeURIComponent(opts.sessionId) + '/tools/unregister', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ names: names })
    });
    if (!r.ok) throw new Error('unregister failed: ' + r.status);
    return await r.json();
  };

  AIAgent.prototype.listTools = async function (opts) {
    opts = opts || {};
    if (!opts.sessionId) throw new Error('sessionId required');
    var token = await this._ensureToken();
    var r = await fetch(this.endpoint + '/chat/' + encodeURIComponent(opts.sessionId) + '/tools', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!r.ok) throw new Error('list failed: ' + r.status);
    return await r.json();
  };

  /** 内部:本地查 tool 定义(用于 SSE tool_call 时找 onCall 回调)。 */
  AIAgent.prototype._getLocalTool = function (sessionId, name) {
    var inner = this._tools.get(sessionId);
    return inner ? inner.get(name) : null;
  };

  // ====================================================================
  // 浮窗"录单模式"开关(demoTools=true 时显示)
  // ====================================================================
  AIAgent.prototype._toggleExtractMode = function () {
    if (this._activeTools.indexOf('submit_form') >= 0) {
      this._activeTools = [];
      this._extractOnCall = null;
      this._appendMsg('system', '📋 录单模式已关闭(普通聊天)');
    } else {
      if (!this._chatSessionId) {
        // 还没 session,先发"开始录单"提示
        this._chatSessionId = this._demoSessionId || (this._opts.clientPrefix + ':order-' + Date.now());
      }
      // 如果当前 chatSessionId 下没注册 submit_form 工具,用 demoSessionId(已在 init 时注册过)
      // 让 stream 在 demoSessionId 上发,模型能看到 submit_form
      if (!this._getLocalTool(this._chatSessionId, 'submit_form')) {
        // 切到 demoSessionId
        this._chatSessionId = this._demoSessionId;
      }
      this._activeTools = ['submit_form'];
      this._extractOnCall = null;  // 用户没传 onFormSubmit → 工具调用只在 UI 上显示
      this._appendMsg('system', '📋 录单模式已开启。请粘订单文本,模型会多轮收集字段。');
    }
  };

  // ====================================================================
  // 智能录单(对外 API,只用于想"一键进入录单"的第三方)
  // ====================================================================
  AIAgent.prototype.startExtractSession = function (opts) {
    // 1) 校验/取 sessionId(若没传,生成一个)
    var sessionId = opts.sessionId || (this._opts.clientPrefix + ':order-' + Date.now());
    var tools = opts.tools || [];  // [{name, description, parameters, strict, onCall}]
    var activeTools = opts.activeTools || (tools.length ? [tools[0].name] : []);
    if (!tools.length) { console.warn('[AIAgent SDK] startExtractSession: tools required'); return; }

    var self = this;
    // 2) 注册工具
    this.registerTools({ sessionId: sessionId, tools: tools })
      .then(function () {
        self._chatSessionId = sessionId;
        self._activeTools = activeTools;
        // 找到 onCall 回调(传给 _extractOnCall,SSE tool_call 时调)
        var first = tools[0];
        self._extractOnCall = first && first.onCall ? first.onCall : null;
        self._appendMsg('system', '📋 智能录单已开启(' + sessionId + '),激活工具: ' + activeTools.join(','));
        // 3) 发引导消息
        self._sendUserMessage(opts.initialMessage || ('请开始按工具定义收集字段,或直接让我粘订单文本。'));
      })
      .catch(function (e) {
        self._appendMsg('system', '⚠️ 工具注册失败:' + e.message);
      });
  };

  AIAgent.prototype.stopExtractSession = function () {
    this._activeTools = [];
    this._extractOnCall = null;
    this._appendMsg('system', '📋 录单模式已关闭');
  };

  // ====================================================================
  // 兼容旧 API:stream() 不带 UI(给想要自己渲染的第三方)
  // ====================================================================
  AIAgent.prototype.stream = function (opts) {
    opts = opts || {};
    return this._postStream({
      sessionId: opts.sessionId,
      message: opts.message,
      activeTools: opts.activeTools || [],
      onChunk: opts.onChunk || function () {},
      onDone: opts.onDone || function () {},
      onError: opts.onError || function (e) { console.error(e); }
    });
  };

  // ====================================================================
  // 内部:POST + SSE 解析
  // ====================================================================
  AIAgent.prototype._postStream = async function (opts) {
    var sessionId = opts.sessionId;
    var message = opts.message;
    var activeTools = opts.activeTools;
    var onChunk = opts.onChunk || function () {};
    var onDone = opts.onDone || function () {};
    var onError = opts.onError || function (e) { console.error(e); };
    var onToolCall = opts.onToolCall;

    if (!sessionId) { onError(new Error('sessionId required')); return; }
    if (message == null) { onError(new Error('message required')); return; }

    var token;
    try { token = await this._ensureToken(); }
    catch (e) { onError(e); return; }

    var url = this.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/stream';
    var body = { message: message };
    if (activeTools && activeTools.length) body.activeTools = activeTools;

    var r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(body)
      });
    } catch (e) {
      onError(e);
      return;
    }
    if (!r.ok || !r.body) { onError(new Error('http ' + r.status)); return; }
    return this._consumeSseStream(r.body, onChunk, onDone, onError, onToolCall);
  };

  /**
   * SSE 解析器 —— 简单 indexOf('\n\n') 切帧。
   *
   * <p>后端 controller 把 data 里的 \n 转义成 \n(字符串),Spring WebFlux 不会
   * 拆多 data 行,每帧必然是 `event:X\ndata:单行\nid:(可选)\n\n` 形态。
   * 前端解析时 data 字段直接拿,再用 .replace(/\\n/g, '\n') 还原真换行。
   */
  AIAgent.prototype._consumeSseStream = async function (body, onChunk, onDone, onError, onToolCall) {
    var reader = body.getReader();
    var dec = new TextDecoder();
    var buf = '';
    var doneCalled = false;
    function fireDone() { if (!doneCalled) { doneCalled = true; onDone(); } }

    function flushFrames() {
      // 循环切帧,直到 buf 里没有完整的 \n\n
      while (true) {
        var idx = buf.indexOf('\n\n');
        if (idx < 0) return;
        var frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        if (!frame) continue;
        // 解析单帧
        var ev = {};
        var lines = frame.split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          var colon = line.indexOf(':');
          if (colon < 0) continue;
          var k = line.slice(0, colon).trim();
          var v = line.slice(colon + 1);
          if (v.length > 0 && v.charAt(0) === ' ') v = v.slice(1);
          // data 字段可能多行(Spring 拆过),用 \n 拼起来,再还原 \\n → \n
          if (k === 'data') {
            ev.data = (ev.data ? ev.data + '\n' : '') + v;
          } else {
            ev[k] = v;
          }
        }
        if (ev.data) ev.data = ev.data.replace(/\\n/g, '\n');

        if (ev.id === 'last') { fireDone(); return; }
        if (ev.event === 'tool_call' && typeof onToolCall === 'function') {
          try { onToolCall(JSON.parse(ev.data || '{}')); }
          catch (e) { console.error('[AIAgent SDK] tool_call parse failed', e, ev.data); }
          continue;
        }
        if (ev.data !== undefined) onChunk(ev);
      }
    }

    try {
      while (true) {
        var step = await reader.read();
        if (step.done) break;
        buf += dec.decode(step.value, { stream: true });
        flushFrames();
      }
      // 流关闭
      flushFrames();
      fireDone();
    } catch (e) {
      onError(e);
    }
  };

  // ====================================================================
  // JWT 解析
  // ====================================================================
  function parseJwtExp(jwt) {
    try {
      var parts = jwt.split('.');
      if (parts.length !== 3) return null;
      var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) payload += '=';
      var json = atob(payload);
      var obj = JSON.parse(json);
      return typeof obj.exp === 'number' ? obj.exp : null;
    } catch (e) { return null; }
  }

  return {
    init: function (opts) { return new AIAgent().init(opts); }
  };
}));
