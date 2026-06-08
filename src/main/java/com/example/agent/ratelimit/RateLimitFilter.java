package com.example.agent.ratelimit;

import com.example.agent.audit.AuditService;
import com.example.agent.auth.AuthPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * 限流 filter。必须在 JwtAuthFilter 之后跑(读 AuthPrincipal)以便按 clientId 限。
 *
 * - /chat/**  : 按 clientId(principal)限流。
 * - /auth/token: 已在 JwtAuthFilter 白名单(不带 token),改按 IP 限流(防暴力破解)。
 *   登录失败本身也会打 audit 留痕。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final TokenBucketRegistry registry;
    private final AuditService audit;

    public RateLimitFilter(TokenBucketRegistry registry, AuditService audit) {
        this.registry = registry;
        this.audit = audit;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        boolean isAuth = "/auth/token".equals(path);
        boolean isChat = path.startsWith("/chat/");
        if (!isAuth && !isChat) {
            return chain.filter(exchange);
        }

        String key;
        AuthPrincipal p = exchange.getAttribute(AuthPrincipal.ATTR);
        if (isChat && p != null) {
            key = "client:" + p.clientId();
        } else {
            // /auth/token 时还没 principal,用 IP
            key = "ip:" + (AuditService.extractIp(exchange.getRequest()) != null
                ? AuditService.extractIp(exchange.getRequest())
                : "unknown");
        }

        TokenBucket bucket = registry.forClient(key);
        if (bucket.tryConsume()) {
            return chain.filter(exchange);
        }
        long retry = bucket.retryAfterSeconds();
        String ip = AuditService.extractIp(exchange.getRequest());
        String clientId = p != null ? p.clientId() : null;
        audit.logAuthRateLimit(clientId, ip);
        log.warn("[RateLimit] {} blocked, retry after {}s", key, retry);
        return reject(exchange, retry);
    }

    private Mono<Void> reject(ServerWebExchange exchange, long retryAfter) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().add("Retry-After", String.valueOf(retryAfter));
        byte[] body = ("{\"error\":\"rate_limited\",\"retry_after_sec\":"
            + retryAfter + "}").getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
            .bufferFactory().wrap(body)));
    }
}
