# 07 认证与 Token

---

## getAccessToken 钩子

SDK 不管理登录逻辑,由第三方自行实现 Token 获取。SDK 通过 `getAccessToken` 钩子获取 JWT:

```js
AIAgent.init({
  getAccessToken: async () => {
    // 第三方自己的鉴权逻辑
    const r = await fetch('https://your-api.com/ai-token', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + yourLoginToken }
    });
    return await r.json();
    // 返回格式: { accessToken: 'xxx', refreshToken: 'xxx' }
  }
});
```

### 返回格式

```ts
{
  accessToken: string;    // 必填:JWT access token
  refreshToken?: string;  // 可选:refresh token
}
```

### 调用时机

SDK 在以下场景调用 `getAccessToken`:

| 场景 | 说明 |
|------|------|
| 工具注册 | `registerRemote` / `appendRemote` / `unregisterRemote` |
| 发送消息 | `_postStream` |
| 提交工具结果 | `postToolResult` |
| 查询工具 | `listRemote` |

---

## Token 缓存与刷新

### TokenCache 内部机制

SDK 内部使用 `TokenCache` 缓存 Token:

```ts
class TokenCache {
  private _token: string | null = null;
  private _exp: number = 0;  // JWT 过期时间戳

  async get(getAccessToken: () => Promise<{accessToken, refreshToken?}>): Promise<string> {
    // 1. 缓存未过期 → 直接返回
    // 2. 缓存过期/不存在 → 调用 getAccessToken 获取新 token
    // 3. 解析 JWT exp,设置缓存过期时间
  }
}
```

### 缓存策略

- 解析 `accessToken` 的 JWT `exp` 字段作为过期时间
- 过期前不会重复调用 `getAccessToken`
- 过期后自动重新获取

### 401 重试

当后端返回 401 时:
1. SDK 自动清除缓存的 Token
2. 重新调用 `getAccessToken` 获取新 Token
3. 用新 Token 重试原请求

---

## 安全注意事项

### Token 传输

所有 SDK → 后端请求都通过 `Authorization: Bearer <token>` 头传输,不通过 URL 参数。

### Token 存储

SDK 不持久化 Token,仅在内存中缓存。页面刷新后缓存丢失,需要重新调用 `getAccessToken`。

### HTTPS

生产环境务必使用 HTTPS,防止 Token 被中间人截获。

---

[← 上一章: 工具实战示例](06-smart-extract.md) | [返回目录](index.md) | [下一章: 事件与回调 →](08-events-callbacks.md)
