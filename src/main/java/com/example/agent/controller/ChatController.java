package com.example.agent.controller;

import com.example.agent.audit.AuditService;
import com.example.agent.auth.AuthPrincipal;
import com.example.agent.session.SessionManager;
import io.agentscope.core.agent.Event;
import io.agentscope.core.message.Msg;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Two endpoints:
 *   POST /chat/{sessionId}         blocking, returns full response
 *   GET  /chat/{sessionId}/stream SSE stream of incremental deltas
 *
 * The sessionId in the URL is also the JsonSession key. It is sanitized
 * inside SessionManager (see session.md security note).
 *
 * Auth: JwtAuthFilter 已在校验前把 AuthPrincipal 挂到 exchange,这里只读。
 */
@RestController
@RequestMapping("/chat")
@Tag(name = "02 对话", description = "AI agent 流式 / 阻塞对话(需 Bearer JWT)")
@SecurityRequirement(name = "bearer-jwt")
public class ChatController {

    private final SessionManager sessions;
    private final AuditService audit;

    public ChatController(SessionManager sessions, AuditService audit) {
        this.sessions = sessions;
        this.audit = audit;
    }

    /** Blocking request/response. */
    @PostMapping("/{sessionId}")
    @Operation(summary = "阻塞对话",
        description = "一次性返回完整 reply(JSON)。sessionId 必须以 {clientId}: 开头。")
    public Mono<ChatResponse> chat(@PathVariable String sessionId,
                                   @RequestBody ChatRequest body,
                                   ServerWebExchange exchange) {
        if (body == null || body.message() == null || body.message().isBlank()) {
            return Mono.error(new IllegalArgumentException("message must not be blank"));
        }
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        audit.logChatStart(p.clientId(), p.jti(), sessionId, ip);
        return sessions.call(sessionId, body.message())
            .map(resp -> {
                audit.logChatDone(p.clientId(), p.jti(), sessionId, ip);
                return new ChatResponse(
                    sessionId,
                    resp.getTextContent() == null ? "" : resp.getTextContent());
            });
    }

    /**
     * SSE stream. Each frame is one Event from the agent — incremental
     * reasoning deltas by default. The last reasoning frame has isLast=true.
     *
     * Heartbeat every 15s so proxies do not close the connection while
     * the model is still working.
     */
    @PostMapping(value = "/{sessionId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "SSE 流式对话",
        description = "text/event-stream。sessionId 必须以 {clientId}: 开头。"
                   + "SDK 端按 SSE 帧解析,每帧是 AgentScope Event,最后一帧 id=last 表示流结束。")
    public Flux<ServerSentEvent<String>> stream(@PathVariable String sessionId,
                                                @RequestBody ChatRequest body,
                                                ServerWebExchange exchange) {
        // 消息必须在 body 里(HTTP header 是 ISO-8859-1,装不下中文/emoji)。
        if (body == null || body.message() == null || body.message().isBlank()) {
            return Flux.error(new IllegalArgumentException("message must not be blank"));
        }
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        audit.logChatStart(p.clientId(), p.jti(), sessionId, ip);

        return sessions.stream(sessionId, body.message())
            .map(ChatController::toSse)
            .doOnComplete(() -> audit.logChatDone(p.clientId(), p.jti(), sessionId, ip));
    }

    private static ServerSentEvent<String> toSse(Event event) {
        Msg msg = event.getMessage();
        String text = msg == null || msg.getTextContent() == null ? "" : msg.getTextContent();
        return ServerSentEvent.<String>builder()
            .event(event.getType().name().toLowerCase())
            .id(event.isLast() ? "last" : null)
            .data(text)
            .build();
    }

    private static AuthPrincipal principalOf(ServerWebExchange exchange) {
        AuthPrincipal p = exchange.getAttribute(AuthPrincipal.ATTR);
        // JwtAuthFilter 已经把无效请求挡掉了;走到这里 principal 一定存在。
        if (p == null) {
            throw new IllegalStateException("AuthPrincipal missing — JwtAuthFilter did not run?");
        }
        return p;
    }

    public record ChatRequest(String message) {}
    public record ChatResponse(String sessionId, String reply) {}

    /** 把 sanitize / 业务校验抛的 IAE 翻成 400(默认会 500)。 */
    @ExceptionHandler(IllegalArgumentException.class)
    public Mono<ResponseEntity<java.util.Map<String, String>>> handleBadInput(IllegalArgumentException e) {
        return Mono.just(ResponseEntity.badRequest()
            .body(java.util.Map.of("error", "bad_request", "message",
                e.getMessage() == null ? "" : e.getMessage())));
    }
}
