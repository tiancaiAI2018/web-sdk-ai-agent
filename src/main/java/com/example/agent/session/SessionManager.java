package com.example.agent.session;

import com.example.agent.config.AgentProperties;
import com.example.agent.extract.RegisteredTool;
import com.example.agent.extract.NoPendingToolException;
import com.example.agent.extract.StreamBlockedException;
import com.example.agent.extract.ToolRegistry;
import com.example.agent.extract.ToolSchemaFactory;
import com.example.agent.extract.ToolUseIdMismatchException;
import com.example.agent.tool.ServerTool;
import com.example.agent.tool.ServerAgentTool;
import com.example.agent.tool.ServerToolExecutor;
import com.example.agent.tool.ServerToolRegistry;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.agent.Event;
import io.agentscope.core.agent.StreamOptions;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import io.agentscope.core.message.TextBlock;
import io.agentscope.core.message.ToolResultBlock;
import io.agentscope.core.message.ToolUseBlock;
import io.agentscope.core.model.ChatModelBase;
import io.agentscope.core.model.ToolSchema;
import io.agentscope.core.session.Session;
import io.agentscope.core.tool.Toolkit;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;

/**
 * 每 sessionId 一个 ReActAgent。v3 重构后,**每次 stream 都新建 agent**,
 * 因为 AgentScope 1.0.12 的 toolkit 在 build() 后不可改(issue #1203)。
 * 多轮 LLM 记忆靠 JsonSession 持久化(每次 build loadIfExists 拉回)。
 *
 * <p>工具激活语义:stream 时传 {@code activeTools} 名字列表,从 {@link ToolRegistry}
 * 按 sid 查工具集,过滤后挂到新 Toolkit。
 *
 * <p>服务端工具:从 {@link ServerToolRegistry} 加载,自动注入到每个 session 的 Toolkit。
 * LLM 调用服务端工具时,由 {@link ServerToolExecutor} 在后端直接执行,
 * 不走 TOOL_SUSPENDED 流程,对 SDK 完全透明。
 */
@Component
public class SessionManager {

    private static final Logger log = LoggerFactory.getLogger(SessionManager.class);

    /** 允许安全字符 + namespace 分隔符 ':'。 */
    private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9_\\-:]{1,128}");

    private final ChatModelBase model;
    private final Session session;
    private final AgentProperties props;
    private final ToolRegistry toolRegistry;
    private final ToolSchemaFactory toolSchemaFactory;
    private final ServerToolRegistry serverToolRegistry;
    private final ServerToolExecutor serverToolExecutor;
    private final ConcurrentHashMap<String, ReActAgent> agents = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ReActAgent> suspendedAgents = new ConcurrentHashMap<>();

    public SessionManager(ChatModelBase model, Session session, AgentProperties props,
                          ToolRegistry toolRegistry, ToolSchemaFactory toolSchemaFactory,
                          ServerToolRegistry serverToolRegistry, ServerToolExecutor serverToolExecutor) {
        this.model = model;
        this.session = session;
        this.props = props;
        this.toolRegistry = toolRegistry;
        this.toolSchemaFactory = toolSchemaFactory;
        this.serverToolRegistry = serverToolRegistry;
        this.serverToolExecutor = serverToolExecutor;
    }

    /**
     * 兼容旧调用:纯聊天,无工具。
     */
    public ReActAgent getOrCreate(String sessionId) {
        return getOrCreate(sessionId, List.of());
    }

    /**
     * 取/建 ReActAgent。**每次都新建**(compute 而非 computeIfAbsent)—— 允许
     * activeTools 在不同 stream 间变化。JsonSession 持久化保证多轮记忆不丢。
     *
     * @param sessionId   已 sanitize 的 sessionId
     * @param activeTools 此次激活的工具名;null/空 = 纯聊天
     */
    public ReActAgent getOrCreate(String sessionId, List<String> activeTools) {
        String safe = sanitize(sessionId);
        List<String> want = activeTools == null ? List.of() : activeTools;
        return build(safe, want);
    }

    /**
     * 每次 build 新 agent,绕开 AgentScope "toolkit 不可改" 限制。
     * 旧 agent 仍在 map 里(下一次 getOrCreate 直接覆盖,GC 自动收)。
     */
    private ReActAgent build(String sessionId, List<String> activeTools) {
        // 从 registry 拿 SDK 工具
        List<RegisteredTool> tools = toolRegistry.get(sessionId, activeTools);

        Toolkit toolkit = null;
        String sysPrompt = props.getAgent().getSysPrompt();

        // 注册 SDK 工具
        if (!tools.isEmpty()) {
            toolkit = new Toolkit();
            for (RegisteredTool t : tools) {
                toolkit.registerSchema(toolSchemaFactory.toToolSchema(t));
            }
            String withTools = toolSchemaFactory.buildSysPromptWithTools(tools);
            if (withTools != null) sysPrompt = withTools;
        }

        // 注册服务端工具(通过 AgentTool 接口,LLM 调用时自动执行)
        List<ServerTool> serverTools = serverToolRegistry.findAllEnabled();
        if (!serverTools.isEmpty()) {
            if (toolkit == null) toolkit = new Toolkit();
            for (ServerTool st : serverTools) {
                try {
                    // 用 registerAgentTool 注册,LLM 调用时自动走 callAsync
                    ServerAgentTool agentTool = new ServerAgentTool(st, serverToolExecutor);
                    toolkit.registerAgentTool(agentTool);
                } catch (Exception e) {
                    log.warn("[SessionManager] failed to register server tool {}: {}", st.getName(), e.getMessage());
                }
            }
        }

        ReActAgent.Builder b = ReActAgent.builder()
            .name(props.getAgent().getName())
            .sysPrompt(sysPrompt)
            .model(model)
            .memory(new InMemoryMemory())
            .maxIters(props.getAgent().getMaxIters());
        if (toolkit != null) b.toolkit(toolkit);
        ReActAgent agent = b.build();

        boolean loaded = agent.loadIfExists(session, sessionId);
        agents.put(sessionId, agent);
        log.debug("Session {} built (loaded={}, sdkTools={}, serverTools={})",
            sessionId, loaded, activeTools, serverTools.size());
        return agent;
    }

    /** Build the user message once at the call site. */
    public static Msg userMessage(String text) {
        return Msg.builder()
            .role(MsgRole.USER)
            .content(TextBlock.builder().text(text).build())
            .build();
    }

    /** Blocking call + persist. */
    public Mono<Msg> call(String sessionId, String text) {
        ReActAgent agent = getOrCreate(sessionId, List.of());
        Msg userMsg = userMessage(text);
        return Mono.fromFuture(agent.call(userMsg).toFuture())
            .doOnNext(resp -> {
                agent.saveTo(session, sessionId);
                log.debug("Session {} saved ({} chars)", sessionId,
                    resp.getTextContent() == null ? 0 : resp.getTextContent().length());
            });
    }

    /**
     * 流式 + 工具激活。tools 为空 = 纯聊天。
     *
     * <p>如果流末尾是 TOOL_SUSPENDED(schema-only 工具被 LLM 触发,等待外部
     * SDK 回传结果),agent 移入 {@code suspendedAgents},<b>不</b> saveTo。
     *
     * <p>服务端工具调用不会触发 TOOL_SUSPENDED,而是由 ServerToolExecutor 直接执行。
     */
    public Flux<Event> stream(String sessionId, String text, List<String> activeTools) {
        String safe = sanitize(sessionId);

        if (suspendedAgents.containsKey(safe)) {
            return Flux.error(new StreamBlockedException(safe));
        }

        ReActAgent agent = getOrCreate(safe, activeTools);
        Msg userMsg = userMessage(text);
        Flux<Event> eventFlux = agent.stream(List.of(userMsg), StreamOptions.defaults());
        return withSuspensionDetection(eventFlux, safe, agent, "stream");
    }

    /**
     * SDK 调 onCall 完成后,POST /tools/result 触发恢复。
     */
    public Flux<Event> resume(String sessionId, String toolUseId, String resultText) {
        String safe = sanitize(sessionId);
        ReActAgent agent = suspendedAgents.get(safe);
        if (agent == null) {
            log.warn("Session {} resume failed: no pending tool call (sid={}, toolUseId={})",
                safe, safe, toolUseId);
            return Flux.error(new NoPendingToolException(safe));
        }

        toolRegistry.touch(safe, List.of());

        boolean idMatches = agent.getMemory().getMessages().stream()
            .flatMap(m -> m.getContentBlocks(ToolUseBlock.class).stream())
            .anyMatch(u -> toolUseId.equals(u.getId()));
        if (!idMatches) {
            log.warn("Session {} resume failed: toolUseId {} not in suspended memory",
                safe, toolUseId);
            return Flux.error(new ToolUseIdMismatchException(safe, toolUseId));
        }

        String toolName = agent.getMemory().getMessages().stream()
            .flatMap(m -> m.getContentBlocks(ToolUseBlock.class).stream())
            .filter(u -> toolUseId.equals(u.getId()))
            .map(ToolUseBlock::getName)
            .findFirst()
            .orElseThrow();

        Msg toolResult = Msg.builder()
            .role(MsgRole.TOOL)
            .content(ToolResultBlock.of(toolUseId, toolName,
                TextBlock.builder().text(resultText).build()))
            .build();

        log.debug("Session {} resuming with tool result ({} bytes)", safe,
            resultText == null ? 0 : resultText.length());

        Flux<Event> eventFlux = Flux.<Event>defer(() -> {
                    try {
                        return agent.stream(List.of(toolResult), StreamOptions.defaults());
                    } catch (IllegalStateException e) {
                        return Flux.error(e);
                    }
                })
                .retryWhen(reactor.util.retry.Retry.fixedDelay(3, java.time.Duration.ofMillis(50))
                    .filter(t -> t instanceof IllegalStateException
                        && t.getMessage() != null
                        && t.getMessage().contains("Agent is still running")));

        return withSuspensionDetection(eventFlux, safe, agent, "resume");
    }

    /**
     * 挂起检测 —— stream 和 resume 共用。
     *
     * 服务端工具已通过 registerAgentTool 注册,LLM 调用时 AgentScope 自动执行 callAsync,
     * 不会触发 TOOL_SUSPENDED。只有 SDK 工具(仅注册了 schema)才走挂起流程。
     */
    private Flux<Event> withSuspensionDetection(Flux<Event> eventFlux,
                                                 String safe,
                                                 ReActAgent agent,
                                                 String label) {
        AtomicBoolean suspended = new AtomicBoolean(false);
        AtomicReference<String> pendingName = new AtomicReference<>();
        AtomicReference<String> pendingId = new AtomicReference<>();

        return eventFlux
            .doOnNext(event -> {
                Msg m = event.getMessage();
                if (m == null) return;
                List<ToolUseBlock> tus;
                try {
                    tus = m.getContentBlocks(ToolUseBlock.class);
                } catch (Exception e) {
                    return;
                }
                if (tus == null) return;
                for (ToolUseBlock tu : tus) {
                    if (tu.getName() == null || tu.getName().startsWith("__")) continue;
                    pendingId.set(tu.getId());
                    pendingName.set(tu.getName());

                    // SDK 工具:挂起等待 /tools/result
                    // 服务端工具不会走到这里,因为已通过 registerAgentTool 注册,AgentScope 自动执行
                    if (suspendedAgents.putIfAbsent(safe, agent) == null) {
                        log.debug("Session {} [{}] suspended on tool {} ({}); awaiting /tools/result",
                            safe, label, tu.getName(), tu.getId());
                    }
                    suspended.set(true);
                    return;
                }
            })
            .doOnComplete(() -> {
                if (suspended.get()) {
                    log.debug("Session {} [{}] complete (suspended on tool {} ({}))",
                        safe, label, pendingName.get(), pendingId.get());
                } else {
                    suspendedAgents.remove(safe);
                    agent.saveTo(session, safe);
                    log.debug("Session {} [{}] complete and saved", safe, label);
                }
            })
            .doOnError(err -> {
                if (suspended.get()) {
                    log.warn("Session {} [{}] error after suspend, agent stays suspended: {}",
                        safe, label, err.toString());
                } else {
                    suspendedAgents.remove(safe);
                    agents.remove(safe);
                    log.warn("Session {} [{}] error, evicted: {}", safe, label, err.toString());
                }
            });
    }

    public void evict(String sessionId) {
        ReActAgent old = agents.remove(sessionId);
        if (old != null) log.debug("Session {} evicted (TTL)", sessionId);
        ReActAgent suspended = suspendedAgents.remove(sessionId);
        if (suspended != null) log.debug("Session {} suspended agent evicted (TTL)", sessionId);
    }

    public boolean abort(String sessionId) {
        String safe = sanitize(sessionId);
        ReActAgent suspended = suspendedAgents.remove(safe);
        if (suspended != null) {
            agents.remove(safe);
            log.debug("Session {} aborted (was suspended)", safe);
            return true;
        }
        return false;
    }

    @PreDestroy
    void shutdown() {
        agents.forEach((id, agent) -> {
            try {
                agent.saveTo(session, id);
            } catch (Exception e) {
                log.warn("Failed to flush session {} on shutdown: {}", id, e.getMessage());
            }
        });
    }

    private static String sanitize(String sessionId) {
        if (sessionId == null || !SAFE_ID.matcher(sessionId).matches()) {
            throw new IllegalArgumentException(
                "Invalid sessionId. Use 1-128 chars of [A-Za-z0-9_-].");
        }
        return sessionId;
    }
}
