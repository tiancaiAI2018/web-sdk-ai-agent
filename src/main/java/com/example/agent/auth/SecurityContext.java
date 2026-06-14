package com.example.agent.auth;

import reactor.util.context.Context;
import reactor.util.context.ContextView;

/**
 * 认证上下文工具类,类似 Spring Security 的 SecurityContextHolder。
 *
 * <p>JwtAuthFilter 验证 JWT 后,将 AuthPrincipal 同时写入:
 * <ul>
 *   <li>ServerWebExchange.attributes —— Controller 层可通过 principalOf(exchange) 获取</li>
 *   <li>Reactor Context —— Service 层可通过 {@link #current()} / {@link #clientId()} 获取</li>
 * </ul>
 *
 * <p>Service 层用法(在响应式链内):
 * <pre>
 *   Mono.deferContextual(ctx -> {
 *       String cid = SecurityContext.clientId(ctx);
 *       // ... 按 clientId 过滤工具等
 *   });
 * </pre>
 */
public final class SecurityContext {

    /** Reactor Context 中的 key */
    private static final String CONTEXT_KEY = "auth.principal";

    private SecurityContext() {}

    /** 将 AuthPrincipal 写入 Reactor Context */
    public static Context withPrincipal(Context ctx, AuthPrincipal principal) {
        return ctx.put(CONTEXT_KEY, principal);
    }

    /** 从 Reactor Context 读取 AuthPrincipal,不存在则返回 null */
    public static AuthPrincipal getPrincipal(ContextView ctx) {
        return ctx.getOrDefault(CONTEXT_KEY, null);
    }

    /** 从 Reactor Context 读取 clientId,不存在则返回 null */
    public static String clientId(ContextView ctx) {
        AuthPrincipal p = getPrincipal(ctx);
        return p != null ? p.clientId() : null;
    }
}
