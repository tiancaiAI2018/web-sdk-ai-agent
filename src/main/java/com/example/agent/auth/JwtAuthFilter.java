package com.example.agent.auth;

import com.example.agent.audit.AuditService;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Set;

/**
 * 在所有进入 controller 的请求中校验 Bearer JWT。
 * 白名单:/auth/token(发 token)、/.well-known/jwks.json(取公钥)。
 * 校验通过后把 AuthPrincipal 挂到 exchange.attributes。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class JwtAuthFilter implements WebFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private static final Set<String> WHITELIST = Set.of(
        "/auth/token",
        "/.well-known/jwks.json"
    );

    private final TokenService tokens;
    private final AuditService audit;

    public JwtAuthFilter(TokenService tokens, AuditService audit) {
        this.tokens = tokens;
        this.audit = audit;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (WHITELIST.contains(path)) {
            return chain.filter(exchange);
        }

        String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return reject(exchange, "missing_bearer");
        }
        String token = auth.substring("Bearer ".length()).trim();
        try {
            String clientId = tokens.verify(token);
            exchange.getAttributes().put(AuthPrincipal.ATTR, new AuthPrincipal(clientId));
            return chain.filter(exchange);
        } catch (JwtException e) {
            log.debug("JWT verify failed: {}", e.getMessage());
            audit.logAuthFail(path);
            return reject(exchange, "invalid_token");
        }
    }

    private Mono<Void> reject(ServerWebExchange exchange, String code) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = ("{\"error\":\"" + code + "\"}").getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse()
            .bufferFactory().wrap(body)));
    }
}
