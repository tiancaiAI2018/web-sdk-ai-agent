package com.example.agent.auth;

/**
 * 从已验证的 JWT 提取出的调用方身份。挂在 ServerWebExchange attribute 上,
 * 供 controller 直接读取。jti 用于 audit 关联(每条 CHAT_* 都能溯源到具体 token)。
 */
public record AuthPrincipal(String clientId, String jti, String scope) {
    public static final String ATTR = "authPrincipal";
}
