/**
 * 第三方后端 mock —— 模拟"第三方业务自管 token"的真实场景
 *
 * 浏览器发起 /api/ai-token,本服务用 hardcode 的 secret 调我方 AI-Agent 的
 * /auth/token (grant_type=client_credentials),把双 token 返给浏览器。
 *
 * secret 永远只在本进程和我方之间出现,绝不出现在浏览器。
 * 真实场景:secret 来自我方控制台,存到第三方自家后端的环境变量 / 配置中心。
 *
 * 用法: node examples/third-party-mock.js
 *      然后访问 http://localhost:5500/host-page.html(浏览器)
 */

const express = require('express');
const app = express();
app.use(express.json());

// demo 简化:允许任何 origin 跨域调本 mock(真实场景:第三方后端配 CORS 白名单,只放自己的前端域名)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const AI_AGENT = 'http://localhost:8080';
const PORT = 7000;

// 在第三方自家后端:secret 来自我方控制台 + 本地配置(不进浏览器)
const APP_ID = 'demo-app';
const APP_SECRET = 'demo-secret';

app.post('/api/ai-token', async (req, res) => {
  // 可选:第三方业务自己可以验证用户登录、限流、计费等
  // 这里只 mock 一下"已经登录的用户"
  try {
    const r = await fetch(`${AI_AGENT}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: APP_ID,
        client_secret: APP_SECRET
      })
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('[mock] upstream auth failed', r.status, t);
      return res.status(502).json({ error: 'upstream_auth_failed', detail: t });
    }
    const j = await r.json();
    console.log('[mock] issued access+jti=... expires_in=' + j.expires_in);
    // 直接把上游响应原样返给浏览器(包含 access_token + refresh_token)
    res.json({
      accessToken: j.access_token,
      refreshToken: j.refresh_token,
      expiresIn: j.expires_in
    });
  } catch (e) {
    console.error('[mock] error', e);
    res.status(500).json({ error: 'mock_error', message: e.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[mock third-party] listening on http://localhost:${PORT}`);
  console.log(`[mock third-party] 代理 secret = ${APP_SECRET} 永远不离开本进程`);
});
