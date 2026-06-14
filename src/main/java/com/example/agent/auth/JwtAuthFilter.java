package com.example.agent.auth;

import com.example.agent.audit.AuditService;
import io.jsonwebtoken.JwtException;
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
import java.net.URLDecoder;
import java.util.Set;

/**
 * 鉴权 + session namespace 校验 + 管理端 scope 校验。
 *
 * 白名单精确路径:/auth/token(发 token)、/.well-known/jwks.json(取公钥)。
 * 前缀白名单:springdoc 资源、静态文件(/sdk/、/examples/、/admin/ 页面自身)。
 *
 * /admin/** 需要 scope 以 "admin:" 开头。
 * /chat/** 额外校验 sessionId 必须以 `clientId:` 开头,防止跨 tenant 访问会话。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class JwtAuthFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private static final Set<String> WHITELIST = Set.of(
        "/auth/token",
        "/.well-known/jwks.json"
    );

    private static final String[] WHITELIST_PREFIXES = {
        "/swagger-ui",
        "/v3/api-docs",
        "/webjars",
        "/sdk/",
        "/examples/",
        "/favicon.ico",
        "/dict/",          // 字典查询接口(服务端工具后端调用,不走浏览器)
        "/admin/"          // 管理端静态页面(HTML/CSS/JS),API 接口在下面单独校验 scope
    };

    /** 管理端 API 路径前缀(需要 admin scope) */
    private static final String ADMIN_API_PREFIX = "/admin/api/";

    private static final String CHAT_PREFIX = "/chat/";

    private final TokenService tokens;
    private final AuditService audit;

    public JwtAuthFilter(TokenService tokens, AuditService audit) {
        this.tokens = tokens;
        this.audit = audit;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        // CORS 预检 OPTIONS 不带 Authorization,不能在这里拦截,交给 CorsWebFilter 处理。
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }
        if (isWhitelisted(path)) {
            return chain.filter(exchange);
        }

        String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
        String ip = AuditService.extractIp(exchange.getRequest());
        if (auth == null || !auth.startsWith("Bearer ")) {
            audit.logAuthFail(path, ip);
            return reject(exchange, "missing_bearer", HttpStatus.UNAUTHORIZED);
        }
        String token = auth.substring("Bearer ".length()).trim();
        TokenService.Verified verified;
        try {
            verified = tokens.verify(token);
        } catch (JwtException e) {
            log.debug("JWT verify failed: {}", e.getMessage());
            audit.logAuthFail(path, ip);
            return reject(exchange, "invalid_token", HttpStatus.UNAUTHORIZED);
        }

        // /admin/api/** 需要 admin scope
        if (path.startsWith(ADMIN_API_PREFIX)) {
            if (verified.scope() == null || !verified.scope().startsWith("admin:")) {
                audit.logAuthFail(path, ip);
                return reject(exchange, "insufficient_scope", HttpStatus.FORBIDDEN);
            }
        }

        // /chat/** 强制 session namespace
        if (path.startsWith(CHAT_PREFIX)) {
            String sessionId = URLDecoder.decode(path.substring(CHAT_PREFIX.length()), StandardCharsets.UTF_8);
            int slash = sessionId.indexOf('/');
            if (slash > 0) sessionId = sessionId.substring(0, slash);
            String nsPrefix = verified.clientId() + ":";
            if (!sessionId.startsWith(nsPrefix)) {
                audit.logCrossTenantAccess(verified.clientId(), verified.jti(), sessionId, ip);
                return reject(exchange, "session_namespace_mismatch", HttpStatus.BAD_REQUEST);
            }
        }

        AuthPrincipal principal = new AuthPrincipal(verified.clientId(), verified.jti(), verified.scope());

        // 写入 exchange.attributes:Controller 层可通过 principalOf(exchange) 获取
        exchange.getAttributes().put(AuthPrincipal.ATTR, principal);

        // 写入 Reactor Context:Service 层可通过 SecurityContext.clientId(ctx) 获取
        // 两种方式并存,确保任何层级都能拿到认证信息
        return chain.filter(exchange)
            .contextWrite(ctx -> SecurityContext.withPrincipal(ctx, principal));
    }

    private Mono<Void> reject(ServerWebExchange exchange, String code, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = ("{\"error\":\"" + code + "\"}").getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
            .bufferFactory().wrap(body)));
    }

    private static boolean isWhitelisted(String path) {
        if (WHITELIST.contains(path)) return true;
        for (String prefix : WHITELIST_PREFIXES) {
            if (path.startsWith(prefix)) return true;
        }
        return false;
    }
}
