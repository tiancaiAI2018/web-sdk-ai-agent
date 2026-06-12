package com.example.agent.controller;

import com.example.agent.audit.AuditService;
import com.example.agent.auth.AuthPrincipal;
import com.example.agent.extract.NoPendingToolException;
import com.example.agent.extract.SessionBusyException;
import com.example.agent.extract.StreamBlockedException;
import com.example.agent.extract.ToolUseIdMismatchException;
import com.example.agent.session.SessionManager;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentscope.core.agent.Event;
import io.agentscope.core.message.ContentBlock;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.ThinkingBlock;
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
import java.util.Objects;

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
     * v3+:SDK 在 /tools/result 失败后,或用户主动放弃工具调用时调用。
     * 同步从 suspendedAgents 移除,下次 /stream 不再 409。不持久化半配对 memory。
     */
    @PostMapping("/{sessionId}/tools/abort")
    @Operation(summary = "释放挂起的 agent",
        description = "SDK 在 /tools/result 失败重试耗尽 / 用户主动取消 / 页面关闭时调用。"
                   + "幂等:无挂起时也返回 200,aborted=false。")
    public Mono<ResponseEntity<Map<String, String>>> abort(@PathVariable String sessionId,
                                                          ServerWebExchange exchange) {
        AuthPrincipal p = principalOf(exchange);
        String ip = AuditService.extractIp(exchange.getRequest());
        boolean removed = sessions.abort(sessionId);
        audit.logToolAbort(p.clientId(), p.jti(), sessionId, removed, ip);
        return Mono.just(ResponseEntity.ok(Map.of("aborted", String.valueOf(removed))));
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

        // isLast 帧去重:AgentScope 1.0.12 会在流末尾推多个 isLast=true,只让第一个推 id:last
        boolean isLastForReal = event.isLast() && lastEmitted.compareAndSet(false, true);
        if (event.isLast() && !isLastForReal) {
            return Flux.empty();
        }

        // === 关键修复:遍历 msg 里的所有 block 一起推 ===
        // last 帧可能同时含 ThinkingBlock + TextBlock + ToolUseBlock(全在一 msg.content 里),
        // 老逻辑"看到 thinking 就 return"会丢掉 tool_call → SDK onCall 永不触发。
        // 现在:把每种 block 各自构造一帧,统一进 List 一起返回。
        java.util.List<ServerSentEvent<String>> frames = new java.util.ArrayList<>();

        // 1) ThinkingBlock → thinking 帧(可能多个,每个都推)
        if (msg != null) {
            try {
                List<ThinkingBlock> thinkBlocks = msg.getContentBlocks(ThinkingBlock.class);
                if (thinkBlocks != null) {
                    for (ThinkingBlock tb : thinkBlocks) {
                        String t = tb.getThinking();
                        if (t == null) t = "";
                        frames.add(ServerSentEvent.<String>builder()
                            .event("thinking")
                            .id(isLastForReal ? "last" : null)
                            .data(t.replace("\n", "\\n").replace("\r", ""))
                            .build());
                    }
                }
            } catch (Exception ignored) {}
        }

        // 2) TextBlock → main 帧(有内容才推,避免空字符串干扰前端)
        String text = msg == null ? null : msg.getTextContent();
        if (text != null && !text.isEmpty()) {
            String type = event.getType().name().toLowerCase();
            ServerSentEvent<String> main = ServerSentEvent.<String>builder()
                    .event(type)
                    .id(isLastForReal ? "last" : null)
                    .data(text.replace("\n", "\\n").replace("\r", ""))
                    .build();
            frames.add(main);
        }


        // 3) ToolUseBlock → 推 tool_call(中间帧→ delta; last 帧→ 完整)
        List<ToolUseBlock> toolUses = null;
        if (msg != null) {
            try {
                toolUses = msg.getContentBlocks(ToolUseBlock.class);
            } catch (Exception ignored) {}
        }
        if (toolUses != null && !toolUses.isEmpty()) {
            // 一次只取第一个(录单场景模型一次只调一个工具)
            ToolUseBlock tu = toolUses.get(0);
            String toolId = tu.getId() == null ? "" : tu.getId();
            String toolName = tu.getName() == null ? "" : tu.getName();

            if (!event.isLast()) {
                // 中间帧:content 非空就推 tool_call_delta
                String content = tu.getContent() == null ? "" : tu.getContent();
                if (!content.isEmpty()) {
                    String frag = "{\"id\":\"" + toolId + "\",\"name\":\"" + toolName
                        + "\",\"delta\":\"" + jsonEscape(content) + "\"}";
                    frames.add(ServerSentEvent.<String>builder()
                        .event("tool_call_delta")
                        .data(frag)
                        .build());
                }else{
                    String frag = "{\"id\":\"" + toolId + "\",\"name\":\"" + toolName+ "\"}";
                    frames.add(ServerSentEvent.<String>builder()
                            .event("tool_call_start")
                            .data(frag)
                            .build());
                }
            } else {
                frames.add(ServerSentEvent.<String>builder()
                        .event("tool_call_end")
                        .data(null)
                        .build());
                // last 帧:推完整 tool_call(args 三级兜底)
                String argsJson;
                if (tu.getInput() != null && !tu.getInput().isEmpty()) {
                    try { argsJson = mapper.writeValueAsString(tu.getInput()); }
                    catch (JsonProcessingException e) { argsJson = "{}"; }
                } else if (tu.getContent() != null && !tu.getContent().isEmpty()) {
                    String raw = tu.getContent();
                    try {
                        Object parsed = mapper.readTree(raw);
                        argsJson = mapper.writeValueAsString(parsed);
                    } catch (Exception e) {
                        argsJson = raw;
                    }
                } else {
                    argsJson = "{}";
                }
                String data = "{\"id\":\"" + toolId
                    + "\",\"tool\":\"" + toolName
                    + "\",\"args\":" + argsJson + "}";
                // audit
                String argsHash = sha256Short(argsJson);
                try {
                    audit.logFormSubmit(p.clientId(), p.jti(), sessionId, toolName, argsHash, ip);
                } catch (Exception ignored) {}
                // id:last 挂在 tool_call 帧上(纯 tool 场景,main 不存在,tool_call 自带)
                frames.add(ServerSentEvent.<String>builder()
                    .event("tool_call")
                    .id(isLastForReal ? "last" : null)
                    .data(data)
                    .build());
            }
        }
        // 全部推完;没东西就返空
        if (frames.isEmpty()) return Flux.empty();
        return Flux.fromIterable(frames);
    }

    /**
     * 把字符串里需要在 JSON 字符串字面量里转义的字符做最小集转义:
     * {@code \} → {@code \\}、{@code "} → {@code \"}、换行 → {@code \n}。
     * 专门给 tool_call_delta 的 delta 字段用 —— content 本身是 JSON 片段,
     * 嵌进 SSE 帧的 data 时要保证不会让前端 JSON.parse 失败。
     */
    private static String jsonEscape(String s) {
        if (s == null) return "";
        StringBuilder b = new StringBuilder(s.length() + 8);
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '\\': b.append("\\\\"); break;
                case '"':  b.append("\\\""); break;
                case '\n': b.append("\\n");  break;
                case '\r': /* 丢掉,避免前端拿到 \r\n */ break;
                case '\t': b.append("\\t");  break;
                default:   b.append(c);
            }
        }
        return b.toString();
    }

    /**
     * 从 Msg 中提取 ThinkingBlock 的思考文本。
     * @return 思考文本(可能为空串);无 ThinkingBlock 时返回 null
     */
    private static String extractThinking(Msg msg) {
        try {
            List<ThinkingBlock> blocks =
                msg.getContentBlocks(ThinkingBlock.class);
            if (blocks != null && !blocks.isEmpty()) {
                return blocks.stream()
                    .map(ThinkingBlock::getThinking)
                    .filter(Objects::nonNull)  // 只过滤 null getThinking(),保留空串和空格
                    .collect(java.util.stream.Collectors.joining("\n"));
            }
        } catch (Exception ignored) {
            // ThinkingBlock 不在 classpath 或提取失败
        }
        return null;
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

    /**
     * /tools/result 传入的 toolUseId 与 suspendedAgents 中实际等待的 id 不一致
     * (SDK 用过期 id 重试 / sid 错配 / stale SSE 帧)。区分于 no_pending_tool_call
     * —— 那是"没挂起",这是"挂起了但 id 错"。
     */
    @ExceptionHandler(ToolUseIdMismatchException.class)
    public Mono<ResponseEntity<Map<String, String>>> handleMismatch(ToolUseIdMismatchException e) {
        return Mono.just(ResponseEntity.status(409)
            .body(Map.of("error", "tool_use_id_mismatch", "message", e.getMessage())));
    }
}
