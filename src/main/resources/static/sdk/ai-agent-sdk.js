/**
 * AIAgent SDK v2 — 浏览器 UMD bundle
 *
 * 设计原则:
 *   - SDK 不持 secret,secret 永远在第三方自家后端
 *   - SDK 接受一个 `getAccessToken` 钩子,由第三方业务自己实现
 *     (内部用 client_credentials 调我方,或用 refresh_token 续期)
 *   - SDK 内部缓存 access_token,临近过期时自动重调 getAccessToken 续期
 *   - SSE 解析逻辑沿用 v1(EventSource 自动重连用不上,自己 fetch 控流)
 *
 * 用法:
 *   <script src="https://your-host/sdk/ai-agent-sdk.js"></script>
 *   <script>
 *     const agent = AIAgent.init({
 *       endpoint: 'https://your-host',
 *       // 第三方业务自实现:从自家后端取 token
 *       getAccessToken: async () => {
 *         const r = await fetch('https://third-party.com/api/ai-token', { method: 'POST' });
 *         const j = await r.json();
 *         return { accessToken: j.accessToken, refreshToken: j.refreshToken };
 *       }
 *     });
 *     agent.stream({
 *       sessionId: 'my-app:user-123',   // 必须以 clientId: 开头
 *       message: '你好',
 *       onChunk: ev => console.log(ev.data),
 *       onDone:  () => console.log('done'),
 *       onError: e => console.error(e)
 *     });
 *   </script>
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

  function AIAgent() {}

  AIAgent.prototype.init = function (opts) {
    if (!opts || !opts.endpoint) throw new Error('endpoint required');
    if (typeof opts.getAccessToken !== 'function') throw new Error('getAccessToken() required');
    this.endpoint = String(opts.endpoint).replace(/\/+$/, '');
    this.getAccessToken = opts.getAccessToken;
    // 缓存当前 token
    this._accessToken = null;
    this._expEpoch = 0;
    return this;
  };

  /**
   * 拿一个未过期的 access_token。
   * 提前 30s 续期,避免边界情况。
   * 注:refresh_token 不直接出现在 SDK 调用里——它由 getAccessToken 内部使用。
   * SDK 只关心 access_token,何时换新由第三方业务自己决定(通过 getAccessToken)。
   */
  AIAgent.prototype._ensureToken = async function () {
    var now = Math.floor(Date.now() / 1000);
    if (this._accessToken && this._expEpoch > now + 30) {
      return this._accessToken;
    }
    console.log('[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...');
    var got = await this.getAccessToken();
    if (!got || !got.accessToken) {
      throw new Error('getAccessToken() must return { accessToken }');
    }
    this._accessToken = got.accessToken;
    // 解析 JWT payload 拿 exp;失败就当 5 分钟
    this._expEpoch = parseJwtExp(got.accessToken) || (now + 300);
    console.log('[AIAgent SDK] token refreshed, expires at epoch', this._expEpoch);
    return this._accessToken;
  };

  /**
   * 流式调用。SSE 解析同 v1。
   */
  AIAgent.prototype.stream = async function (opts) {
    var sessionId = opts.sessionId;
    var message = opts.message;
    var onChunk = opts.onChunk || function () {};
    var onDone  = opts.onDone  || function () {};
    var onError = opts.onError || function (e) { console.error(e); };

    if (!sessionId) { onError(new Error('sessionId required')); return; }
    if (!message)   { onError(new Error('message required'));   return; }

    var token;
    try { token = await this._ensureToken(); }
    catch (e) { onError(e); return; }

    var url = this.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/stream';
    console.log('[AIAgent SDK] POST', url, 'sessionId=' + sessionId, 'msgLen=' + message.length);

    var r;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ message: message })
      });
    } catch (e) {
      console.error('[AIAgent SDK] fetch threw', e);
      onError(e);
      return;
    }

    console.log('[AIAgent SDK] stream response', r.status, 'content-type=', r.headers.get('content-type'));
    if (!r.ok || !r.body) {
      // 401 时下次 _ensureToken 会重拉,所以这里不强制清缓存
      onError(new Error('http ' + r.status));
      return;
    }

    var reader = r.body.getReader();
    var dec = new TextDecoder();
    var buf = '';
    try {
      while (true) {
        var step = await reader.read();
        if (step.done) break;
        buf += dec.decode(step.value, { stream: true });
        var idx;
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          var frame = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          var ev = {};
          var lines = frame.split('\n');
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var colon = line.indexOf(':');
            if (colon < 0) continue;
            var k = line.slice(0, colon).trim();
            var v = line.slice(colon + 1).trim();
            if (k) ev[k] = v;
          }
          if (ev.id === 'last') { onDone(); return; }
          if (Object.prototype.hasOwnProperty.call(ev, 'data')) onChunk(ev);
        }
      }
      onDone();
    } catch (e) {
      onError(e);
    }
  };

  /** 解析 JWT 拿 exp(payload.base64url 解码)。失败返 null。 */
  function parseJwtExp(jwt) {
    try {
      var parts = jwt.split('.');
      if (parts.length !== 3) return null;
      var payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) payload += '=';
      var json = atob(payload);
      var obj = JSON.parse(json);
      return typeof obj.exp === 'number' ? obj.exp : null;
    } catch (e) {
      return null;
    }
  }

  return {
    init: function (opts) { return new AIAgent().init(opts); }
  };
}));
