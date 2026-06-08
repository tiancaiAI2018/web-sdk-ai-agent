package com.example.agent.auth;

/**
 * 从已验证的 JWT 提取出的调用方身份。挂在 ServerWebExchange attribute 上,
 * 供 controller 通过 @AuthPrincipal 参数解析器读取。
 */
public record AuthPrincipal(String clientId) {
    public static final String ATTR = "authPrincipal";
}
