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
import io.agentscope.core.agent.EventType;
import io.agentscope.core.message.ContentBlock;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.ThinkingBlock;
import io.agentscope.core.message.ToolResultBlock;
import io.agentscope.core.message.ToolUseBlock;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

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

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final SessionManager sessions;
    private final AuditService audit;
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * 追踪一个正在进行中的工具调用(从 tool_call_start 到 tool_call_end)。
     * 支持多工具并发:LLM 可能在一次回复中调用多个工具,每个工具独立追踪。
     */
    static class PendingToolCall {
        final String id;
        final String name;
        // 流式增量参数(AgentTool 模式下 ToolUseBlock.input 为空,参数通过 content 增量推送)
        final StringBuilder content = new StringBuilder();
        // isLast=true 帧提供的完整 args(优先级高于 content 累积)
        String completeArgs;

        PendingToolCall(String id, String name) {
            this.id = id;
            this.name = name;
        }

        /** 获取最终 args JSON:completeArgs 优先,否则从累积 content 解析 */
        String getArgsJson(ObjectMapper mapper) {
            if (completeArgs != null) return completeArgs;
            String accumulated = content.toString().trim();
            if (!accumulated.isEmpty()) {
                try {
                    Object parsed = mapper.readTree(accumulated);
                    return mapper.writeValueAsString(parsed);
                } catch (Exception e) {
                    return accumulated;
                }
            }
            return "{}";
        }
    }

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

        // 追踪所有进行中的工具调用,支持多工具并发(LLM 可能一次调用多个工具)
        // key = toolUseId, value = PendingToolCall
        final ConcurrentHashMap<String, PendingToolCall> pendingTools = new ConcurrentHashMap<>();

        return sessions.stream(sessionId, body.message(), active)
            .flatMap(event -> toSse(event, p, sessionId, ip, pendingTools))
            // 流结束后:1)为剩余的前端工具(TOOL_SUSPENDED)补发 tool_call_end + tool_call
            //          2)追加 id:last 哨兵帧,前端以此判断流结束
            .concatWith(Flux.defer(() -> {
                List<ServerSentEvent<String>> finalFrames = new ArrayList<>();
                for (PendingToolCall ptc : pendingTools.values()) {
                    // 前端工具:agent 已 TOOL_SUSPENDED,需 SDK 执行 onCall + POST /tools/result
                    String argsJson = ptc.getArgsJson(mapper);
                    finalFrames.add(ServerSentEvent.<String>builder()
                        .event("tool_call_end")
                        .data("{\"id\":\"" + ptc.id + "\",\"name\":\"" + ptc.name + "\"}")
                        .build());
                    finalFrames.add(ServerSentEvent.<String>builder()
                        .event("tool_call")
                        .data("{\"id\":\"" + ptc.id + "\",\"tool\":\"" + ptc.name
                            + "\",\"args\":" + argsJson + "}")
                        .build());
                    // audit
                    String argsHash = sha256Short(argsJson);
                    try { audit.logFormSubmit(p.clientId(), p.jti(), sessionId, ptc.name, argsHash, ip); }
                    catch (Exception ignored) {}
                }
                pendingTools.clear();
                // 哨兵帧:前端 SSE 解析器通过 id:last 判断流结束
                finalFrames.add(ServerSentEvent.<String>builder().id("last").data("").build());
                return Flux.fromIterable(finalFrames);
            }))
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
        final ConcurrentHashMap<String, PendingToolCall> pendingTools = new ConcurrentHashMap<>();
        return sessions.resume(sessionId, body.toolUseId(), body.result())
            .flatMap(event -> toSse(event, p, sessionId, ip, pendingTools))
            .concatWith(Flux.defer(() -> {
                List<ServerSentEvent<String>> finalFrames = new ArrayList<>();
                for (PendingToolCall ptc : pendingTools.values()) {
                    String argsJson = ptc.getArgsJson(mapper);
                    finalFrames.add(ServerSentEvent.<String>builder()
                        .event("tool_call_end")
                        .data("{\"id\":\"" + ptc.id + "\",\"name\":\"" + ptc.name + "\"}")
                        .build());
                    finalFrames.add(ServerSentEvent.<String>builder()
                        .event("tool_call")
                        .data("{\"id\":\"" + ptc.id + "\",\"tool\":\"" + ptc.name
                            + "\",\"args\":" + argsJson + "}")
                        .build());
                }
                pendingTools.clear();
                finalFrames.add(ServerSentEvent.<String>builder().id("last").data("").build());
                return Flux.fromIterable(finalFrames);
            }));
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
     * 把单个 AgentScope Event 翻译成 1~N 个 SSE 帧。
     *
     * <p>核心设计:ReAct 模式下,一个 stream 包含多轮 LLM 调用:
     * <pre>
     *   REASONING(isLast=false) → ToolUseBlock 增量推送(tool_call_start / tool_call_delta)
     *   REASONING(isLast=true)  → 当前 LLM 调用结束,ToolUseBlock 参数完整
     *   TOOL_RESULT             → 服务端工具(AgentTool)执行完毕,ToolResultBlock 出现
     *   REASONING(isLast=false) → 下一轮 LLM 推理开始
     *   ...
     *   REASONING(isLast=true)  → 最终回复
     * </pre>
     *
     * <p>关键规则:
     * <ul>
     *   <li>REASONING 帧中的 ToolUseBlock:只发 tool_call_start / tool_call_delta,不发 tool_call_end + tool_call</li>
     *   <li>TOOL_RESULT 帧中的 ToolResultBlock:发 tool_call_end + tool_call(server_executed=true)</li>
     *   <li>流结束时,remaining pendingTools 是前端工具(TOOL_SUSPENDED),由调用方补发 tool_call_end + tool_call</li>
     *   <li>id:last 只在哨兵帧设置,不在中间帧设置,避免前端误判流结束</li>
     * </ul>
     */
    private Flux<ServerSentEvent<String>> toSse(Event event, AuthPrincipal p,
                                                String sessionId, String ip,
                                                ConcurrentHashMap<String, PendingToolCall> pendingTools) {

        Msg msg = event.getMessage();
        log.info("[toSse] type={} isLast={} msg={} reason={}", event.getType(), event.isLast(),
            msg == null ? "null" : msg.getContent(),msg == null ? null :msg.getGenerateReason());

        List<ServerSentEvent<String>> frames = new ArrayList<>();

        // 1) ThinkingBlock → thinking 帧
        // 跳过 isLast=true 帧的 ThinkingBlock:AgentScope 在 isLast=true 帧中会包含
        // 完整的思考文本(与前面 isLast=false 增量帧的内容完全重复),前端已累积了增量内容,
        // 再发完整文本会导致重复显示
        if (msg != null && !event.isLast()) {
            try {
                List<ThinkingBlock> thinkBlocks = msg.getContentBlocks(ThinkingBlock.class);
                if (thinkBlocks != null) {
                    for (ThinkingBlock tb : thinkBlocks) {
                        String t = tb.getThinking();
                        if (t == null) t = "";
                        frames.add(ServerSentEvent.<String>builder()
                            .event("thinking")
                            .data(t.replace("\n", "\\n").replace("\r", ""))
                            .build());
                    }
                }
            } catch (Exception ignored) {}
        }

        // 2) TextBlock → reasoning / tool_result 帧(有内容才推)
        if (msg != null && !event.isLast()) {
            String text = msg.getTextContent();
            if (text != null && !text.isEmpty()) {
                frames.add(ServerSentEvent.<String>builder()
                        .event("text")
                        .data(text.replace("\n", "\\n").replace("\r", ""))
                        .build());
            }
        }

        // 3) ToolResultBlock → 服务端工具(AgentTool)执行完毕
        // 发 tool_call_end + tool_call(server_executed=true),并从 pendingTools 中移除
        if (msg != null) {
            try {
                List<ToolResultBlock> toolResults = msg.getContentBlocks(ToolResultBlock.class);
                if (toolResults != null) {
                    for (ToolResultBlock tr : toolResults) {
                        String resultToolId = tr.getId();
                        String resultToolName = tr.getName();

                        // 从 pendingTools 中查找对应的工具调用
                        PendingToolCall ptc = resultToolId != null
                            ? pendingTools.remove(resultToolId) : null;

                        // 兜底:如果 id 匹配不到,尝试取第一个 pending
                        if (ptc == null && !pendingTools.isEmpty()) {
                            String firstKey = pendingTools.keys().nextElement();
                            ptc = pendingTools.remove(firstKey);
                        }

                        String toolId = ptc != null ? ptc.id : (resultToolId != null ? resultToolId : "");
                        String toolName = ptc != null ? ptc.name : (resultToolName != null ? resultToolName : "");
                        String argsJson = ptc != null ? ptc.getArgsJson(mapper) : "{}";

                        // tool_call_end:流式参数传输结束
                        frames.add(ServerSentEvent.<String>builder()
                                .event("tool_call_end")
                                .data("{\"id\":\"" + toolId + "\",\"name\":\"" + toolName + "\"}")
                                .build());
                        // tool_call(server_executed=true):服务端已执行,前端只展示
                        String data = "{\"id\":\"" + toolId
                            + "\",\"tool\":\"" + toolName
                            + "\",\"args\":" + argsJson
                            + ",\"server_executed\":true}";
                        String argsHash = sha256Short(argsJson);
                        try { audit.logFormSubmit(p.clientId(), p.jti(), sessionId, toolName, argsHash, ip); }
                        catch (Exception ignored) {}
                        frames.add(ServerSentEvent.<String>builder()
                            .event("tool_call")
                            .data(data)
                            .build());
                    }
                }
            } catch (Exception ignored) {}
        }

        // 4) ToolUseBlock → 流式增量推送 + 累积参数
        // 只发 tool_call_start / tool_call_delta,不发 tool_call_end + tool_call
        // (服务端工具的 tool_call_end + tool_call 由 ToolResultBlock 触发,
        //  前端工具的由流结束时的 concatWith 补发)
        if (msg != null) {
            try {
                List<ToolUseBlock> toolUses = msg.getContentBlocks(ToolUseBlock.class);
                if (toolUses != null) {
                    for (ToolUseBlock tu : toolUses) {
                        String toolId = tu.getId() == null ? "" : tu.getId();
                        String toolName = tu.getName() == null ? "" : tu.getName();

                        // 查找或创建 PendingToolCall
                        PendingToolCall ptc = pendingTools.get(toolId);

                        if (ptc == null) {
                            // 新工具调用:创建 pending 记录 + 发 tool_call_start
                            // 过滤 __fragment__ 等占位名(AgentScope delta 帧可能带此名)
                            String realName = "__fragment__".equals(toolName) ? "" : toolName;
                            ptc = new PendingToolCall(toolId, realName);
                            pendingTools.put(toolId, ptc);

                            if (!realName.isEmpty()) {
                                frames.add(ServerSentEvent.<String>builder()
                                        .event("tool_call_start")
                                        .data("{\"id\":\"" + toolId + "\",\"name\":\"" + realName + "\"}")
                                        .build());
                            }
                        }

                        // 处理内容:增量 or 完整
                        String content = tu.getContent() == null ? "" : tu.getContent();
                        if (event.isLast()) {
                            // isLast=true:当前 LLM 调用最后一帧,ToolUseBlock 参数完整
                            // 保存完整 args(优先用 input,其次用 content),不发 tool_call_end + tool_call
                            if (tu.getInput() != null && !tu.getInput().isEmpty()) {
                                try { ptc.completeArgs = mapper.writeValueAsString(tu.getInput()); }
                                catch (JsonProcessingException e) { ptc.completeArgs = "{}"; }
                            } else if (!content.isEmpty()) {
                                try {
                                    Object parsed = mapper.readTree(content);
                                    ptc.completeArgs = mapper.writeValueAsString(parsed);
                                } catch (Exception e) {
                                    ptc.completeArgs = content;
                                }
                            }
                            // 如果 toolName 在 start 时是 __fragment__,现在用真实名称更新
                            if ("__fragment__".equals(ptc.name) && !"__fragment__".equals(toolName) && !toolName.isEmpty()) {
                                // name 不可变,但 completeArgs 已记录;实际场景中 start 帧应该有真实 name
                            }
                        } else if (!content.isEmpty()) {
                            // 中间帧:累积增量 content + 发 tool_call_delta
                            ptc.content.append(content);
                            // delta 中使用 pending 中记录的真实工具名,而非 ToolUseBlock 中可能的 __fragment__
                            String deltaName = ptc.name.isEmpty() ? toolName : ptc.name;
                            String frag = "{\"id\":\"" + toolId + "\",\"name\":\"" + deltaName
                                + "\",\"delta\":\"" + jsonEscape(content) + "\"}";
                            frames.add(ServerSentEvent.<String>builder()
                                .event("tool_call_delta")
                                .data(frag)
                                .build());
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        // 5) REASONING 类型 + isLast=true 时发 round_end
        // 仅 REASONING 事件代表一轮 LLM 调用结束,TOOL_RESULT 事件不代表新轮次
        // 如果 TOOL_RESULT 也发 round_end,会导致前端在工具结果之间创建多余的 typing 占位
        if (event.isLast() && event.getType() == EventType.REASONING) {
            boolean hasToolCalls = !pendingTools.isEmpty();
            frames.add(ServerSentEvent.<String>builder()
                .event("round_end")
                .data("{\"hasToolCalls\":" + hasToolCalls + "}")
                .build());
        }

        return frames.isEmpty() ? Flux.empty() : Flux.fromIterable(frames);
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
