/**
 * AIAgent SDK — 浏览器 UMD bundle
 *
 * 用法:
 *   <script src="https://your-host/sdk/ai-agent-sdk.js"></script>
 *   <script>
 *     const agent = AIAgent.init({
 *       endpoint: 'https://your-host',
 *       clientId: 'demo-app',
 *       // 真实场景:secret 应由第三方自家后端持有,前端从自家后端换取;
 *          // demo 直接给明文便于跑通。
 *       getSecret: async () => 'demo-secret'
 *     });
 *     agent.stream({
 *       sessionId: 'u-123',
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
    if (!opts.clientId) throw new Error('clientId required');
    if (typeof opts.getSecret !== 'function') throw new Error('getSecret() required');
    this.endpoint = String(opts.endpoint).replace(/\/+$/, '');
    this.clientId = opts.clientId;
    this.getSecret = opts.getSecret;
    this._token = null;
    this._exp = 0;
    return this;
  };

  /** 取一个未过期的 token;无则拉新的。提前 30s 续期。 */
  AIAgent.prototype.getToken = async function () {
    var now = Math.floor(Date.now() / 1000);
    if (this._token && this._exp > now + 30) {
      console.log('[AIAgent SDK] reusing cached token');
      return this._token;
    }
    console.log('[AIAgent SDK] fetching new token from', this.endpoint + '/auth/token');
    var secret = await this.getSecret();
    var r = await fetch(this.endpoint + '/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: this.clientId, clientSecret: secret })
    });
    console.log('[AIAgent SDK] token response', r.status);
    if (!r.ok) {
      var t = '';
      try { t = await r.text(); } catch (_) {}
      throw new Error('auth failed: ' + r.status + ' ' + t);
    }
    var j = await r.json();
    this._token = j.accessToken;
    this._exp = now + j.expiresIn;
    return this._token;
  };

  /**
   * 流式调用。读 SSE 帧,逐个 onChunk;收到 id=last 帧触发 onDone。
   * 错误统一走 onError。不做断线续传。
   */
  AIAgent.prototype.stream = async function (opts) {
    var sessionId = opts.sessionId;
    var message = opts.message;
    var onChunk = opts.onChunk || function () {};
    var onDone = opts.onDone || function () {};
    var onError = opts.onError || function (e) { console.error(e); };

    if (!sessionId) { onError(new Error('sessionId required')); return; }
    if (!message)   { onError(new Error('message required'));   return; }

    var token;
    try { token = await this.getToken(); }
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
      onError(e); return;
    }

    console.log('[AIAgent SDK] stream response', r.status, 'content-type=', r.headers.get('content-type'));
    if (!r.ok || !r.body) {
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

  return {
    init: function (opts) { return new AIAgent().init(opts); }
  };
}));
