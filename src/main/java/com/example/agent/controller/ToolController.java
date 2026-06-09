package com.example.agent.controller;

import com.example.agent.audit.AuditService;
import com.example.agent.auth.AuthPrincipal;
import com.example.agent.extract.RegisteredTool;
import com.example.agent.extract.ToolRegistry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * 工具注册管理 — v3 新增。
 *
 * <p>三个端点,都挂在 /chat/{sid}/tools/** 下,自动走 JwtAuthFilter + RateLimitFilter。
 *
 * <ul>
 *   <li>POST /chat/{sid}/tools/register    全量替换该 sid 的工具集</li>
 *   <li>POST /chat/{sid}/tools/unregister  删指定 name;空 = 全清</li>
 *   <li>GET  /chat/{sid}/tools             返元信息(不返 parameters)</li>
 * </ul>
 */
@RestController
@RequestMapping("/chat/{sessionId}/tools")
@Tag(name = "03 工具注册", description = "SDK 端工具 schema 注册/注销/查询(需 Bearer JWT)")
@SecurityRequirement(name = "bearer-jwt")
public class ToolController {

    private final ToolRegistry registry;
    private final AuditService audit;

    public ToolController(ToolRegistry registry, AuditService audit) {
        this.registry = registry;
        this.audit = audit;
    }

    @PostMapping("/register")
    @Operation(summary = "注册一组工具",
        description = "全量替换该 sessionId 下的工具集。每个工具需 name/description/parameters(JSON Schema)/strict;"
                   + "name 白名单 [a-z0-9_]{1,32};description ≤ 500 字符且过滤 prompt injection 特征;"
                   + "parameters 顶层 type=object。")
    public Mono<ResponseEntity<Map<String, Object>>> register(
            @PathVariable String sessionId,
            @RequestBody RegisterRequest body,
            ServerWebExchange exchange) {
        if (body == null || body.tools() == null || body.tools().isEmpty()) {
            return Mono.error(new IllegalArgumentException("tools must not be empty"));
        }
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        // registry.register 内部会调 DescriptionGuard + 字段名校验,失败抛 IAE
        List<String> registered = registry.register(sessionId, body.tools());
        audit.logToolRegister(p.clientId(), p.jti(), sessionId, registered, ip);
        return Mono.just(ResponseEntity.ok(Map.of("registered", registered)));
    }

    @PostMapping("/unregister")
    @Operation(summary = "注销工具",
        description = "names 留空 = 全清该 sid 下所有工具。返实际被删的名字列表。")
    public Mono<ResponseEntity<Map<String, Object>>> unregister(
            @PathVariable String sessionId,
            @RequestBody(required = false) UnregisterRequest body,
            ServerWebExchange exchange) {
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        List<String> names = body == null ? null : body.names();
        List<String> removed = registry.unregister(sessionId, names);
        audit.logToolUnregister(p.clientId(), p.jti(), sessionId, removed, ip);
        return Mono.just(ResponseEntity.ok(Map.of("unregistered", removed)));
    }

    @GetMapping
    @Operation(summary = "列出已注册工具",
        description = "返元信息(name/description/时间戳),**不**返 parameters(防 SDK 反复拉大块 schema)。")
    public Mono<ResponseEntity<Map<String, Object>>> list(@PathVariable String sessionId) {
        return Mono.just(ResponseEntity.ok(Map.of("tools", registry.list(sessionId))));
    }

    private static AuthPrincipal principalOf(ServerWebExchange exchange) {
        AuthPrincipal p = exchange.getAttribute(AuthPrincipal.ATTR);
        if (p == null) {
            throw new IllegalStateException("AuthPrincipal missing — JwtAuthFilter did not run?");
        }
        return p;
    }

    public record RegisterRequest(List<RegisteredTool.Draft> tools) {}
    public record UnregisterRequest(List<String> names) {}
}
