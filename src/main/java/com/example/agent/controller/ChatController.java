package com.example.agent.controller;

import com.example.agent.audit.AuditService;
import com.example.agent.auth.AuthPrincipal;
import com.example.agent.extract.NoPendingToolException;
import com.example.agent.extract.SessionBusyException;
import com.example.agent.extract.StreamBlockedException;
import com.example.agent.session.SessionManager;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentscope.core.agent.Event;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.ToolUseBlock;
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

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

/**
 * Two endpoints:
 *   POST /chat/{sessionId}         blocking, returns full response
 *   POST /chat/{sessionId}/stream  SSE stream of incremental deltas
 *
 * v3 重构:body 不再带 schema,改带 {@code activeTools: ["name1", "name2"]}。
 * 工具 schema 在 SDK 端用 POST /chat/{sid}/tools/register 单独注入,绑定到 sid。
 * activeTools 为空/null = 纯聊天(不挂任何 tool)。
 */
@RestController
@RequestMapping("/chat")
@Tag(name = "02 对话", description = "AI agent 流式 / 阻塞对话(需 Bearer JWT)")
@SecurityRequirement(name = "bearer-jwt")
public class ChatController {

    private final SessionManager sessions;
    private final AuditService audit;
    private final ObjectMapper mapper = new ObjectMapper();

    public ChatController(SessionManager sessions, AuditService audit) {
        this.sessions = sessions;
        this.audit = audit;
    }

    /** Blocking request/response. */
    @PostMapping("/{sessionId}")
    @Operation(summary = "阻塞对话",
        description = "一次性返回完整 reply(JSON)。sessionId 必须以 {clientId}: 开头。"
                   + "v3:body 可选传 activeTools 激活已注册的工具。")
    public Mono<ChatResponse> chat(@PathVariable String sessionId,
                                   @RequestBody ChatRequest body,
                                   ServerWebExchange exchange) {
        if (body == null || body.message() == null || body.message().isBlank()) {
            return Mono.error(new IllegalArgumentException("message must not be blank"));
        }
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        List<String> active = body.activeTools() == null ? List.of() : body.activeTools();
        audit.logChatStart(p.clientId(), p.jti(), sessionId, active, ip);
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
     * <p>v3:当 body.activeTools 非空且模型调用了已注册工具时,会多发一个
     * {@code event: tool_call} 帧,data 是 {@code {"tool":"name","args":{...}}},
     * 浏览器 SDK 解析后调 onCall 回调。
     */
    @PostMapping(value = "/{sessionId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "SSE 流式对话 / 激活工具",
        description = "text/event-stream。sessionId 必须以 {clientId}: 开头。"
                   + "body.activeTools 列出本次想激活的工具名(必须已通过 /tools/register 注册);"
                   + "不传或空 = 纯聊天。")
    public Flux<ServerSentEvent<String>> stream(@PathVariable String sessionId,
                                                @RequestBody ChatRequest body,
                                                ServerWebExchange exchange) {
        if (body == null || body.message() == null || body.message().isBlank()) {
            return Flux.error(new IllegalArgumentException("message must not be blank"));
        }
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        List<String> active = body.activeTools() == null ? List.of() : body.activeTools();
        audit.logChatStart(p.clientId(), p.jti(), sessionId, active, ip);

        // AgentScope 1.0.12 在流末尾会推多个 isLast=true 的 Event。last 帧只推一次。
        java.util.concurrent.atomic.AtomicBoolean lastEmitted = new java.util.concurrent.atomic.AtomicBoolean(false);

        return sessions.stream(sessionId, body.message(), active)
            .flatMap(event -> toSse(event, p, sessionId, ip, lastEmitted))
            .doOnComplete(() -> audit.logChatDone(p.clientId(), p.jti(), sessionId, ip));
    }

    /**
     * SDK 调 onCall 完成后,POST 工具执行结果,后端用官方模式
     * {@code agent.call(toolResultMsg)} 恢复被 TOOL_SUSPENDED 的 agent,
     * 把 LLM 的确认回复以 SSE 流式推回。
     *
     * <p>409 session_busy_with_tool:该 sid 当前没有挂起的工具调用(可能是
     * SDK 重复发,或 sid 错配)。
     */
    @PostMapping(value = "/{sessionId}/tools/result", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "提交工具执行结果 / 恢复被挂起的 agent",
        description = "SSE 流式返回 LLM 在看到 tool_result 后的确认回复。"
                   + "需要 session 当前处于 TOOL_SUSPENDED 状态,否则 409。")
    public Flux<ServerSentEvent<String>> toolResult(@PathVariable String sessionId,
                                                   @RequestBody ToolResultRequest body,
                                                   ServerWebExchange exchange) {
        if (body == null || body.toolUseId() == null || body.toolUseId().isBlank()
                || body.result() == null) {
            return Flux.error(new IllegalArgumentException(
                "toolUseId and result required"));
        }
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        audit.logToolResult(p.clientId(), p.jti(), sessionId, body.toolUseId(), ip);
        // 新的 stream 一次"last" 帧只推一次
        java.util.concurrent.atomic.AtomicBoolean lastEmitted =
            new java.util.concurrent.atomic.AtomicBoolean(false);
        return sessions.resume(sessionId, body.toolUseId(), body.result())
            .flatMap(event -> toSse(event, p, sessionId, ip, lastEmitted));
    }

    /**
     * 把单个 AgentScope Event 翻译成 1~N 个 SSE 帧。工具调用时**额外**推一个
     * event: tool_call 帧,data 含 tool 名 + args(JSON)。
     *
     * @param lastEmitted 整个流里 id:last 帧只能推一次
     */
    private Flux<ServerSentEvent<String>> toSse(Event event, AuthPrincipal p,
                                                String sessionId, String ip,
                                                java.util.concurrent.atomic.AtomicBoolean lastEmitted) {
        Msg msg = event.getMessage();
        String text = msg == null || msg.getTextContent() == null ? "" : msg.getTextContent();

        // isLast 帧去重:AgentScope 1.0.12 会在流末尾推多个 isLast=true,只让第一个推 id:last
        boolean isLastForReal = event.isLast() && lastEmitted.compareAndSet(false, true);
        if (event.isLast() && !isLastForReal) {
            return Flux.empty();
        }

        String type = event.getType().name().toLowerCase();
        ServerSentEvent<String> main = ServerSentEvent.<String>builder()
            .event(type)
            .id(isLastForReal ? "last" : null)
            // 把 data 内的换行转义成 \\n(字符串),避免 Spring WebFlux 把多行 data
            // 拆成多个 data: 字段,前端 SSE 解析更简单可靠。前端拿到后用 .replace(/\\n/g, '\n') 还原
            .data(text == null ? "" : text.replace("\n", "\\n").replace("\r", ""))
            .build();

        if (msg == null) return Flux.just(main);
        List<ToolUseBlock> toolUses;
        try {
            toolUses = msg.getContentBlocks(ToolUseBlock.class);
        } catch (Exception e) {
            return Flux.just(main);
        }
        if (toolUses == null || toolUses.isEmpty()) return Flux.just(main);

        // 一次只取第一个(录单场景模型一次只调一个工具)
        ToolUseBlock tu = toolUses.get(0);
        // 过滤 AgentScope 内部工具(以 __ 开头,流式 JSON 分片用)
        if (tu.getName() != null && tu.getName().startsWith("__")) {
            return Flux.just(main);
        }
        String argsJson;
        try {
            argsJson = mapper.writeValueAsString(tu.getInput());
        } catch (JsonProcessingException e) {
            argsJson = "{}";
        }
        String data = "{\"id\":\"" + (tu.getId() == null ? "" : tu.getId())
            + "\",\"tool\":\"" + tu.getName() + "\",\"args\":" + argsJson + "}";

        // audit(只存 hash,不存原文)
        String argsHash = sha256Short(argsJson);
        try {
            audit.logFormSubmit(p.clientId(), p.jti(), sessionId, tu.getName(), argsHash, ip);
        } catch (Exception ignored) {}

        ServerSentEvent<String> toolCall = ServerSentEvent.<String>builder()
            .event("tool_call")
            .data(data)
            .build();
        return Flux.just(main, toolCall);
    }

    private static String sha256Short(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] d = md.digest(s.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(d, 0, 6);
        } catch (NoSuchAlgorithmException e) {
            return "0";
        }
    }

    private static AuthPrincipal principalOf(ServerWebExchange exchange) {
        AuthPrincipal p = exchange.getAttribute(AuthPrincipal.ATTR);
        if (p == null) {
            throw new IllegalStateException("AuthPrincipal missing — JwtAuthFilter did not run?");
        }
        return p;
    }

    /**
     * v3:body 可选带 activeTools(已通过 /tools/register 注册的工具名列表)。
     * null/空 = 纯聊天。
     */
    public record ChatRequest(String message, List<String> activeTools) {
        public ChatRequest {
            if (activeTools == null) activeTools = List.of();
        }
    }
    public record ChatResponse(String sessionId, String reply) {}

    /** /chat/{sid}/tools/result 请求体。 */
    public record ToolResultRequest(String toolUseId, String result) {}

    @ExceptionHandler(IllegalArgumentException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleBadInput(IllegalArgumentException e) {
        String msg = e.getMessage() == null ? "" : e.getMessage();
        String err = "bad_request";
        if (msg.startsWith("tool_not_registered")) err = "tool_not_registered";
        else if (msg.startsWith("description rejected")) err = "description_rejected";
        else if (msg.startsWith("description too long")) err = "description_too_long";
        return Mono.just(ResponseEntity.badRequest()
            .body(Map.of("error", err, "message", msg)));
    }

    /**
     * /stream 时 sid 处于 TOOL_SUSPENDED → SDK 应该走 /tools/result,409 + 明确文案。
     */
    @ExceptionHandler(StreamBlockedException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleStreamBlocked(StreamBlockedException e) {
        return Mono.just(ResponseEntity.status(409)
            .body(Map.of("error", "stream_blocked_by_pending_tool", "message", e.getMessage())));
    }

    /**
     * /tools/result 时 sid 没有挂起 → 重复调 /tools/result,或 TTL 过期,或 sid 错。
     * 用不同 error code 让 SDK 端能区分"等"还是"放弃"。
     */
    @ExceptionHandler(NoPendingToolException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleNoPendingTool(NoPendingToolException e) {
        return Mono.just(ResponseEntity.status(409)
            .body(Map.of("error", "no_pending_tool_call", "message", e.getMessage())));
    }
}
