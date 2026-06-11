/**
 * JWT 解析 —— 1:1 平移原 SDK 的 parseJwtExp(原文件 1273-1283 行)
 *
 * 提取 JWT payload 的 exp 字段(秒级 epoch)。失败返 null。
 */
export function parseJwtExp(jwt: string | null | undefined): number | null {
  if (!jwt) return null;
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    const json = atob(payload);
    const obj = JSON.parse(json);
    return typeof obj.exp === 'number' ? obj.exp : null;
  } catch (e) {
    return null;
  }
}

/**
 * Token 缓存 —— 平移自原 SDK 的 _ensureToken(原文件 559-570 行)
 *
 * 语义保持完全一致:
 *   - 若 token 还有效(> 30s 缓冲),直接返
 *   - 否则调 getAccessToken() 拉新,缓存并返 accessToken
 *   - getAccessToken() 必须返 { accessToken } 形状
 *   - exp 字段缺失时用 now+300(5 分钟默认)
 *
 * 使用方:
 *   const cache = new TokenCache();
 *   const token = await cache.get(this.getAccessToken);
 */
export class TokenCache {
  private _accessToken: string | null = null;
  private _expEpoch = 0;

  async get(
    getAccessToken: () => Promise<{ accessToken: string; refreshToken?: string }>
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this._accessToken && this._expEpoch > now + 30) {
      return this._accessToken;
    }
    console.log('[AIAgent SDK] token missing/near-expiry, calling getAccessToken()...');
    const got = await getAccessToken();
    if (!got || !got.accessToken) {
      throw new Error('getAccessToken() must return { accessToken }');
    }
    this._accessToken = got.accessToken;
    this._expEpoch = parseJwtExp(got.accessToken) || now + 300;
    return this._accessToken;
  }
}
