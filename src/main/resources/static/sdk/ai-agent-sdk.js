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
    // ===== 工具结果重试/取消按钮(_onToolResultFailed 触发) =====
    '.aiagent-sdk-tool-result-failed{align-self:stretch;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 12px;margin:2px 0;font-size:12.5px;color:#991b1b;line-height:1.5;display:flex;flex-direction:column;gap:6px}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-tool-result-failed{background:#450a0a;border-color:#7f1d1d;color:#fecaca}',
    '.aiagent-sdk-tool-result-failed-header{display:flex;align-items:center;gap:6px;font-weight:600}',
    '.aiagent-sdk-tool-result-failed-header::before{content:"⚠️";font-size:14px}',
    '.aiagent-sdk-tool-result-failed-detail{font-weight:400;opacity:.85;font-size:12px;margin-left:22px}',
    '.aiagent-sdk-tool-result-actions{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:22px}',
    '.aiagent-sdk-tool-result-actions button{font-family:inherit;font-size:12px;line-height:1;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:500;transition:background .15s,border-color .15s,color .15s,transform .08s}',
    '.aiagent-sdk-tool-result-actions button:active{transform:scale(0.96)}',
    '.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry{background:#3b82f6;color:#fff;border:1px solid #3b82f6}',
    '.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry:hover{background:#2563eb;border-color:#2563eb}',
    '.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel{background:transparent;color:#6b7280;border:1px solid #d1d5db}',
    '.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel:hover{background:#f3f4f6;color:#374151;border-color:#9ca3af}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel{color:#9ca3af;border-color:#4b5563}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel:hover{background:#374151;color:#e5e7eb;border-color:#6b7280}',
    '.aiagent-sdk-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:10px;min-width:18px;height:18px;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 0 0 2px #fff}',
    '.aiagent-sdk-panel.aiagent-sdk-pos-bl{right:auto;left:24px}',
    '.aiagent-sdk-bubble.aiagent-sdk-pos-bl{right:auto;left:24px}',
    // ===== Markdown 渲染样式(marked + DOMPurify) =====',
    '.aiagent-sdk-msg p{margin:.35em 0}',
    '.aiagent-sdk-msg p:first-child{margin-top:0}',
    '.aiagent-sdk-msg p:last-child{margin-bottom:0}',
    '.aiagent-sdk-msg h1,.aiagent-sdk-msg h2,.aiagent-sdk-msg h3,.aiagent-sdk-msg h4{font-weight:600;line-height:1.3;margin:.7em 0 .3em}',
    '.aiagent-sdk-msg h1{font-size:1.3em}',
    '.aiagent-sdk-msg h2{font-size:1.18em}',
    '.aiagent-sdk-msg h3{font-size:1.08em}',
    '.aiagent-sdk-msg h4{font-size:1em}',
    '.aiagent-sdk-msg ul,.aiagent-sdk-msg ol{margin:.4em 0;padding-left:1.5em}',
    '.aiagent-sdk-msg li{margin:.15em 0}',
    '.aiagent-sdk-msg li>p{margin:.15em 0}',
    '.aiagent-sdk-msg blockquote{border-left:3px solid #d1d5db;padding:2px 10px;margin:.5em 0;color:#6b7280;background:rgba(0,0,0,.02);border-radius:0 4px 4px 0}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg blockquote{border-left-color:#4b5563;background:rgba(255,255,255,.04);color:#9ca3af}',
    '.aiagent-sdk-msg hr{border:none;border-top:1px solid #e5e7eb;margin:.8em 0}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg hr{border-top-color:#374151}',
    '.aiagent-sdk-msg pre{background:rgba(0,0,0,.05);border-radius:6px;padding:8px 10px;margin:.5em 0;overflow-x:auto;font-family:ui-monospace,"Cascadia Code",monospace;font-size:12.5px;line-height:1.5;white-space:pre}',
    '.aiagent-sdk-msg pre code{background:transparent;padding:0;font-size:inherit}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg pre{background:rgba(0,0,0,.35)}',
    '.aiagent-sdk-msg code{background:rgba(0,0,0,.08);padding:1px 5px;border-radius:3px;font-size:12.5px;font-family:ui-monospace,monospace}',
    '.aiagent-sdk-msg-assistant code{background:rgba(0,0,0,.06)}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg code{background:rgba(255,255,255,.08)}',
    '.aiagent-sdk-msg a{color:#3b82f6;text-decoration:underline;word-break:break-all}',
    '.aiagent-sdk-msg a:hover{color:#2563eb}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg a{color:#93c5fd}',
    '.aiagent-sdk-msg table{border-collapse:separate;border-spacing:0;margin:.6em 0;font-size:13px;display:table;overflow:hidden;max-width:100%;border:1px solid #e5e7eb;border-radius:8px;width:auto}',
    '.aiagent-sdk-msg th,.aiagent-sdk-msg td{border:none;border-bottom:1px solid #f3f4f6;padding:7px 12px;text-align:left;vertical-align:middle}',
    '.aiagent-sdk-msg tr:last-child td{border-bottom:none}',
    '.aiagent-sdk-msg th{background:#f9fafb;font-weight:600;color:#374151}',
    '.aiagent-sdk-msg tbody tr:nth-child(even) td{background:#fafbfc}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg table{border-color:#374151}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg th{background:#1f2937;color:#e5e7eb}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg th,.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg td{border-bottom-color:#374151}',
    '.aiagent-sdk-panel.aiagent-sdk-theme-dark .aiagent-sdk-msg tbody tr:nth-child(even) td{background:#1f2937}',
    '.aiagent-sdk-msg del{color:#9ca3af;text-decoration:line-through}',
    '.aiagent-sdk-msg input[type=checkbox]{margin-right:6px}',
    // ===== 图片:百分比缩放(限制在消息气泡内)+ 加载模糊过渡 =====',
    '.aiagent-sdk-msg img{max-width:100%;height:auto;border-radius:6px;margin:.4em 0;display:block;cursor:zoom-in;background:rgba(0,0,0,.03)}',
    '.aiagent-sdk-msg img.aiagent-sdk-img-loading{opacity:.3;filter:blur(6px);transition:opacity .35s,filter .35s}',
    '.aiagent-sdk-msg img.aiagent-sdk-img-loaded{opacity:1;filter:none;transition:opacity .35s,filter .35s}'
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

    // 待提交 / 已失败可重试的 tool result。失败时持久化到 sessionStorage,
    // 页面刷新后由 _resumePendingToolResults() 自动续传,无需用户重输。
    this._pendingToolCall = null;

    this._mount();
    if (this._opts.autoOpen) this.open();

    // 启动时扫 sessionStorage 续传上次未提交的 tool result(异步,不影响 init)
    var self = this;
    setTimeout(function () { self._resumePendingToolResults(); }, 0);

    // demoTools 模式:init 后台异步注册 demo 工具组(用内部固定 sessionId)
    if (this._opts.demoTools) {
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

    // 后台预加载 marked + DOMPurify(不阻塞浮窗出现)
    // 首次发消息时若还没到,会走 fallback;到了之后下次渲染自动切到完整路径
    ensureMarkdown();
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
    // 顺手 abort 旧 sid(如果还在挂起中),免得新会话的 stream 撞 409
    var oldSid = this._chatSessionId;
    if (oldSid) this._postAbort(oldSid).catch(function () {});
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
      decorateImages(div);
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

  // ====================================================================
  // Markdown 渲染(marked + DOMPurify,带 CDN/本地/降级三段式)
  // ====================================================================

  /**
   * 把一个 <script src=...> 标签 append 到 head,resolve 当 onload 触发。
   * 超时(timeoutMs)未加载完 reject —— 调用方 catch 后继续降级。
   */
  function loadScript(src, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        s.remove();
        reject(new Error('timeout: ' + src));
      }, timeoutMs || 5000);
      s.onload = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      s.onerror = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        s.remove();
        reject(new Error('load fail: ' + src));
      };
      document.head.appendChild(s);
    });
  }

  // SDK 自身所在的目录(用于本地兜底 vendor 路径)
  var SDK_BASE = (function () {
    var scripts = document.querySelectorAll('script[src*="ai-agent-sdk"]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      var m = src.match(/^(.*\/)?ai-agent-sdk/);
      if (m) return m[1] || '';
    }
    return '';
  })();

  // 加载策略:CDN(jsdelivr)优先 → 失败/超时回退本地 vendor → 仍失败则纯 fallback
  // 两个 Promise 都缓存,后续 _ensureMarkdown 拿到的是同一个 promise
  var _mdReady = null;
  function ensureMarkdown() {
    if (_mdReady) return _mdReady;
    if (typeof window === 'undefined') {
      _mdReady = Promise.resolve(false);
      return _mdReady;
    }
    // 已经存在(比如宿主页面预先引了),不重复加载
    if (window.marked && window.DOMPurify) {
      _mdReady = Promise.resolve(true);
      return _mdReady;
    }
    var cdnBase = 'https://cdn.jsdelivr.net/npm/';
    var cdnMarked = cdnBase + 'marked@13.0.3/marked.min.js';
    var cdnDomPurify = cdnBase + 'dompurify@3.1.6/dist/purify.min.js';
    var localMarked = SDK_BASE + 'vendor/marked.min.js';
    var localDomPurify = SDK_BASE + 'vendor/purify.min.js';
    _mdReady = loadScript(cdnMarked)
      .then(function () { return loadScript(cdnDomPurify); })
      .catch(function (cdnErr) {
        console.warn('[AIAgent SDK] markdown CDN fail, try local:', cdnErr.message);
        return loadScript(localMarked)
          .then(function () { return loadScript(localDomPurify); });
      })
      .then(function () {
        // 标记已配置好
        if (window.marked && window.DOMPurify) return true;
        throw new Error('libs missing after load');
      })
      .catch(function (e) {
        console.warn('[AIAgent SDK] markdown lib unavailable, fallback to lite:', e.message);
        return false;
      });
    return _mdReady;
  }

  // marked + DOMPurify 走的安全处理
  // 备注:DOMPurify 默认会过滤掉 javascript: 等危险 href —— 整个 <a> 标签会被剥,
  // 不会"链接降级成 #"。这是最严格的安全行为,我们直接接受,不自己再叠一层白名单
  // (容易写漏,得不偿失)。这里只补 target/rel 防 tabnabbing。
  function sanitizeAndDecorate(html) {
    if (!window.DOMPurify) return html;
    var clean = window.DOMPurify.sanitize(html, {
      ADD_ATTR: ['target', 'rel'],
      // 不放行 <style> / <script> / <iframe> 等,DOMPurify 默认就过滤掉
    });
    // 给所有 <a> 强制加 target=_blank rel=noopener(防 tabnabbing)
    clean = clean.replace(/<a\s+([^>]*?)>/gi, function (m, attrs) {
      if (!/\btarget\s*=/i.test(attrs)) attrs += ' target="_blank"';
      if (!/\brel\s*=/i.test(attrs)) attrs += ' rel="noopener noreferrer"';
      return '<a ' + attrs + '>';
    });
    return clean;
  }

  // 渲染主入口:异步(因为 marked 可能是 lazy 加载)
  // 调用方 await 它,或者 renderImmediate 走 fallback
  var _mdConfigured = false;
  function configureMarked() {
    if (_mdConfigured || !window.marked) return;
    _mdConfigured = true;
    // breaks:true 让单个 \n 也变 <br/>(LLM 流式输出时常合并成一行)
    window.marked.setOptions({ gfm: true, breaks: true, headerIds: false, mangle: false });
  }

  function renderMarkdownLite(text) {
    if (!text) return '';
    // 路径 A:marked + DOMPurify(功能完整,GFM + 图片 + 链接 + 表格 + 任务列表)
    if (typeof window !== 'undefined' && window.marked && window.DOMPurify) {
      configureMarked();
      try {
        var raw = window.marked.parse(text);
        return sanitizeAndDecorate(raw);
      } catch (e) {
        console.warn('[AIAgent SDK] marked parse failed, fallback:', e);
        return renderMarkdownFallback(text);
      }
    }
    // 路径 B:库还没就绪(或加载失败)→ 降级到自实现(只有换行 + bold + code)
    return renderMarkdownFallback(text);
  }

  // 自实现 fallback(约 30 行,库加载失败时用,聊胜于无)
  function renderMarkdownFallback(text) {
    var t = escapeHtml(text);
    t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\n/g, '<br/>');
    return t;
  }

  /**
   * 把已经 innerHTML 完的消息 div 里的 <img> 元素挂上"懒加载 + 模糊过渡"行为。
   * - 加 loading="lazy"(浏览器原生懒加载,长对话时只渲染可见的)
   * - 给所有 img 加 aiagent-sdk-img-loading 初始 class
   * - 监听 onload / onerror 切到 loaded class(从 blur 6px → 清晰)
   */
  function decorateImages(container) {
    if (!container) return;
    var imgs = container.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        if (img.dataset.aiagentDecorated === '1') return;
        img.dataset.aiagentDecorated = '1';
        img.setAttribute('loading', 'lazy');
        img.classList.add('aiagent-sdk-img-loading');
        function done() { img.classList.remove('aiagent-sdk-img-loading'); img.classList.add('aiagent-sdk-img-loaded'); }
        if (img.complete && img.naturalWidth > 0) done();
        else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
      })(imgs[i]);
    }
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
        decorateImages(typing);
        self._msgEl.scrollTop = self._msgEl.scrollHeight;
      },
      onDone: function () {
        upgradeTyping();
        // **不**再 append 新 div —— typing 已经是最终内容
        typing.innerHTML = renderMarkdownLite(assistantBuf);
        decorateImages(typing);
        self._msgEl.scrollTop = self._msgEl.scrollHeight;
        // 若本轮有 tool_call,_postToolResult 会接管 busy(在它的 onDone 里关),
        // 避免用户在工具结果回传完成前又发新消息撞 409
        if (!submitted) self._setBusy(false);
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
        submitted = true;  // 错误时也不让 _postToolResult 接管 busy
      },
      onToolCall: async function (parsed) {
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
        // 调本地 onCall 拿 result(sync 或 async 都能 await)
        var toolResult;
        var localTool = self._getLocalTool(self._chatSessionId, parsed.tool);
        if (localTool && localTool.onCall) {
          try {
            toolResult = await Promise.resolve(localTool.onCall(parsed.args));
          } catch (e) {
            console.error('[AIAgent SDK] onCall threw:', e);
            self._appendMsg('system', '⚠️ onCall 失败: ' + e.message);
          }
        }
        // 浮窗录单模式下,onCallSnapshot 是 startExtractSession 时传进来的 onFormSubmit
        if (onCallSnapshot && parsed.tool === 'submit_form') {
          try {
            var r = onCallSnapshot(parsed.args);
            if (r != null && toolResult == null) toolResult = r;
          } catch (e) {
            console.error('[AIAgent SDK] extract onCall threw:', e);
          }
        }
        // 把 result 回传后端,触发 LLM 看到结果后继续(官方 TOOL 恢复模式)
        if (parsed.id) {
          await self._postToolResult(parsed.id, toolResult);
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

  // 简单 sleep —— _postToolResult 指数退避用
  AIAgent.prototype._sleep = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
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
   * 内部:onCall 完成后,把工具执行结果 POST 到 /chat/{sid}/tools/result,
   * 后端用官方模式 agent.call(toolResultMsg) 恢复 TOOL_SUSPENDED 状态,
   * 把 LLM 的确认回复以 SSE 流式推回。SDK 端按新消息渲染。
   *
   * <p>可靠性:
   * <ul>
   *   <li>先持久化 pending 到 sessionStorage,刷新页面后能续传</li>
   *   <li>5xx / 429 / 网络错误 指数退避(500/1000/2000ms,共 4 次)</li>
   *   <li>409 状态机错配:主动 abort 清后端 + 清本地,不重试</li>
   *   <li>4xx 其他 + SSE 消费失败:不再重试,挂"重试/取消"按钮给用户</li>
   * </ul>
   */
  AIAgent.prototype._postToolResult = async function (toolUseId, result) {
    if (!toolUseId) return;
    var sessionId = this._chatSessionId;
    if (!sessionId) { console.warn('[AIAgent SDK] no sessionId for tool result'); return; }

    // 先把 pending 存 sessionStorage,刷新页面后 _resumePendingToolResults() 能续传
    this._pendingToolCall = { toolUseId: toolUseId, result: result, ts: Date.now() };
    try {
      sessionStorage.setItem('pending:' + sessionId, JSON.stringify(this._pendingToolCall));
    } catch (e) { /* 隐私模式可能抛,吞掉 */ }

    var token;
    try { token = await this._ensureToken(); }
    catch (e) { this._appendMsg('system', '⚠️ ' + e.message); this._setBusy(false); return; }

    var url = this.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/result';
    var body = JSON.stringify({
      toolUseId: toolUseId,
      // onCall 没返回值时(JSON.stringify 会整个删掉 undefined 字段,
      // 后端就报 "toolUseId and result required")给个占位
      result: result == null ? '[Tool executed by client SDK; no result returned]'
            : typeof result === 'string' ? result
            : JSON.stringify(result)
    });
    var headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    };

    var maxAttempts = 4;   // 1 初始 + 3 重试
    var backoff = 500;
    var attempt = 0;
    var r;
    var fetchErr;

    while (attempt < maxAttempts) {
      fetchErr = null;
      try {
        r = await fetch(url, { method: 'POST', headers: headers, body: body });
      } catch (e) {
        fetchErr = e;
      }

      if (fetchErr) {
        if (attempt === maxAttempts - 1) break;
        await this._sleep(backoff); backoff *= 2; attempt++; continue;
      }

      // 5xx 重试
      if (r.status >= 500 && r.status < 600 && attempt < maxAttempts - 1) {
        await this._sleep(backoff); backoff *= 2; attempt++; continue;
      }
      // 429:尊重 Retry-After
      if (r.status === 429 && attempt < maxAttempts - 1) {
        var ra = parseInt(r.headers.get('Retry-After') || '1', 10);
        await this._sleep(Math.max(ra * 1000, backoff));
        backoff *= 2; attempt++; continue;
      }
      // 其它状态码(2xx / 4xx 非 429)直接跳出循环,不再重试
      break;
    }

    // 所有重试用尽仍网络层失败
    if (fetchErr) {
      this._onToolResultFailed(sessionId, toolUseId, 'network: ' + fetchErr.message);
      return;
    }

    // 409:后端状态机已乱(挂起池已 evict / sid 错 / ttl 过期),
    // 主动 abort 清后端 + 清本地 storage,不让用户卡住
    if (r.status === 409) {
      var errText = await r.text();
      this._appendMsg('system', '⚠️ ' + (errText || 'session 已被工具调用占用'));
      this._postAbort(sessionId).catch(function () {});
      sessionStorage.removeItem('pending:' + sessionId);
      this._pendingToolCall = null;
      this._setBusy(false);
      return;
    }
    // 4xx 其他 / 重试后仍 5xx —— 不可重试错误,挂按钮
    if (!r.ok || !r.body) {
      this._onToolResultFailed(sessionId, toolUseId, 'http ' + r.status);
      return;
    }

    // 2xx:消耗 SSE,渲染 LLM 确认回复
    var typing = this._appendTyping();
    var assistantBuf = '';
    var replaced = false;
    var self = this;
    function upgradeTyping() {
      if (!replaced) {
        replaced = true;
        typing.className = 'aiagent-sdk-msg aiagent-sdk-msg-assistant';
      }
    }
    var consumed = true;
    try {
      await this._consumeSseStream(r.body,
        function (ev) {
          assistantBuf += (ev.data || '');
          upgradeTyping();
          typing.innerHTML = renderMarkdownLite(assistantBuf);
          decorateImages(typing);
          self._msgEl.scrollTop = self._msgEl.scrollHeight;
        },
        function () {
          upgradeTyping();
          typing.innerHTML = renderMarkdownLite(assistantBuf);
          decorateImages(typing);
          self._msgEl.scrollTop = self._msgEl.scrollHeight;
          self._setBusy(false);  // 接管 _sendUserMessage 留的 busy
        },
        function (e) {
          consumed = false;
          if (replaced) {
            typing.className = 'aiagent-sdk-msg aiagent-sdk-msg-system';
            typing.textContent = '⚠️ ' + e.message;
          } else {
            typing.remove();
            self._appendMsg('system', '⚠️ ' + e.message);
          }
          self._setBusy(false);
        },
        function (parsed) {
          // 不应该出现(resume 后 LLM 不会立刻再调工具),有则按普通 tool_call 处理
          if (parsed && parsed.tool && parsed.tool.indexOf('__') !== 0) {
            self._appendMsg('tool', '', { tool: parsed.tool, args: parsed.args || {} });
          }
        }
      );
    } catch (e) {
      consumed = false;
    }
    if (consumed) {
      // 成功:清 storage,清 pending
      sessionStorage.removeItem('pending:' + sessionId);
      this._pendingToolCall = null;
    } else {
      this._onToolResultFailed(sessionId, toolUseId, 'sse');
    }
  };

  /**
   * 释放后端挂起的 agent。幂等,失败静默 —— best-effort。
   */
  AIAgent.prototype._postAbort = async function (sessionId) {
    if (!sessionId) return;
    try {
      var token = await this._ensureToken();
      await fetch(this.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/abort', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    } catch (e) {
      console.warn('[AIAgent SDK] abort failed:', e.message);
    }
    try { sessionStorage.removeItem('pending:' + sessionId); } catch (e) {}
    this._pendingToolCall = null;
  };

  /**
   * 失败后用户点"重试"按钮 —— 用 _pendingToolCall 缓存的 result 再发一次。
   * 走完整 _postToolResult 流程(包含 sessionStorage 刷新 + 指数退避)。
   */
  AIAgent.prototype._retryToolResult = async function () {
    if (!this._pendingToolCall) return;
    var p = this._pendingToolCall;
    this._setBusy(true);
    await this._postToolResult(p.toolUseId, p.result);
  };

  /**
   * 失败后用户点"取消"按钮 —— 主动调 /tools/abort 释放后端 agent,
   * 删本地 pending storage,UI 提示用户。
   */
  AIAgent.prototype._cancelToolResult = async function () {
    var sid = this._chatSessionId;
    await this._postAbort(sid);
    this._appendMsg('system', '已放弃本次工具调用,可继续对话。');
    this._setBusy(false);
  };

  /**
   * /tools/result 不可重试失败时调用:展示"重试/取消"按钮给用户。
   * 默认实现:插入一个醒目的红色错误卡片 + 两个按钮;宿主可覆盖此方法做更精致的 UI。
   */
  AIAgent.prototype._onToolResultFailed = function (sessionId, toolUseId, reason) {
    console.warn('[AIAgent SDK] tool result failed:', reason);
    this._renderToolResultFailedCard(reason);
    this._setBusy(false);
  };

  /**
   * 渲染"工具结果提交失败"卡片:错误描述 + 重试/取消按钮。
   * 复用 .aiagent-sdk-tool-result-failed 容器样式(顶部 style 块已定义)。
   * 用 _messages 也记一条(角色 system),方便后续 reload 检查状态。
   */
  AIAgent.prototype._renderToolResultFailedCard = function (reason) {
    // 防御:已存在错误卡片就不再插
    if (this._msgEl.querySelector('.aiagent-sdk-tool-result-failed')) {
      return;
    }
    var card = document.createElement('div');
    card.className = 'aiagent-sdk-tool-result-failed';

    var header = document.createElement('div');
    header.className = 'aiagent-sdk-tool-result-failed-header';
    header.textContent = '提交工具结果失败';

    var detail = document.createElement('div');
    detail.className = 'aiagent-sdk-tool-result-failed-detail';
    detail.textContent = '原因:' + (reason || '未知') + '。可重试,或取消本次调用以继续对话。';

    var bar = document.createElement('div');
    bar.className = 'aiagent-sdk-tool-result-actions';

    var self = this;
    var retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'aiagent-sdk-btn-retry';
    retryBtn.textContent = '↻ 重试';
    retryBtn.addEventListener('click', function () {
      if (card.parentNode) card.parentNode.removeChild(card);
      self._retryToolResult();
    });

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'aiagent-sdk-btn-cancel';
    cancelBtn.textContent = '✕ 取消';
    cancelBtn.addEventListener('click', function () {
      if (card.parentNode) card.parentNode.removeChild(card);
      self._cancelToolResult();
    });

    bar.appendChild(retryBtn);
    bar.appendChild(cancelBtn);
    card.appendChild(header);
    card.appendChild(detail);
    card.appendChild(bar);
    this._msgEl.appendChild(card);
    this._messages.push({ role: 'system', text: 'tool result failed: ' + (reason || '') });
    this._msgEl.scrollTop = this._msgEl.scrollHeight;
  };

  /**
   * SDK 启动时调:扫 sessionStorage,续传上次未提交的 tool result。
   * 后端用 409 回应就视为 TTL 过期,主动 abort 清掉,不让用户感知残留。
   */
  AIAgent.prototype._resumePendingToolResults = async function () {
    if (typeof sessionStorage === 'undefined') return;
    var pendingKey = null;
    var pending = null;
    try {
      for (var i = 0; i < sessionStorage.length; i++) {
        var k = sessionStorage.key(i);
        if (k && k.indexOf('pending:') === 0) {
          pendingKey = k;
          pending = JSON.parse(sessionStorage.getItem(k) || 'null');
          break;  // 一次只处理一个
        }
      }
    } catch (e) { return; }
    if (!pendingKey || !pending || !pending.toolUseId) {
      if (pendingKey) sessionStorage.removeItem(pendingKey);
      return;
    }
    var sid = pendingKey.substring('pending:'.length);
    this._appendMsg('system', '检测到上次未完成的工具调用,正在重试提交…');
    this._pendingToolCall = pending;
    // 直接复用 _postToolResult(走完整流程,失败的话会显示重试/取消)
    await this._postToolResult(pending.toolUseId, pending.result);
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
