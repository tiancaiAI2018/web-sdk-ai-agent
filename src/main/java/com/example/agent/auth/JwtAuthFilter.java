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
 * 鉴权 + session namespace 校验。
 *
 * 白名单精确路径:/auth/token(发 token)、/.well-known/jwks.json(取公钥)。
 * 前缀白名单:springdoc 资源(/swagger-ui、/v3/api-docs、/webjars)、
 *          静态文件(/sdk/、/examples/、/favicon.ico)。
 *
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
        "/dict/"          // 字典查询接口,AI 工具 onCall 从浏览器直接调用(无 JWT)
    };

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

        // /chat/** 强制 session namespace
        if (path.startsWith(CHAT_PREFIX)) {
            // 浏览器 fetch 会把 sessionId 用 encodeURIComponent 编一遍,
            // 所以 path 里是 %3A 而不是 :。先 URL-decode 再校验。
            String sessionId = URLDecoder.decode(path.substring(CHAT_PREFIX.length()), StandardCharsets.UTF_8);
            // 截到下一个 / 或末尾(忽略 /stream 后缀)
            int slash = sessionId.indexOf('/');
            if (slash > 0) sessionId = sessionId.substring(0, slash);
            String nsPrefix = verified.clientId() + ":";
            if (!sessionId.startsWith(nsPrefix)) {
                audit.logCrossTenantAccess(verified.clientId(), verified.jti(), sessionId, ip);
                return reject(exchange, "session_namespace_mismatch", HttpStatus.BAD_REQUEST);
            }
        }

        exchange.getAttributes().put(
            AuthPrincipal.ATTR,
            new AuthPrincipal(verified.clientId(), verified.jti(), verified.scope())
        );
        return chain.filter(exchange);
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
