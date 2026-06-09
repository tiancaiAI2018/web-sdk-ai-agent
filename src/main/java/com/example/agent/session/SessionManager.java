package com.example.agent.session;

import com.example.agent.config.AgentProperties;
import com.example.agent.extract.RegisteredTool;
import com.example.agent.extract.ToolRegistry;
import com.example.agent.extract.ToolSchemaFactory;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.agent.Event;
import io.agentscope.core.agent.StreamOptions;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import io.agentscope.core.message.TextBlock;
import io.agentscope.core.model.ChatModelBase;
import io.agentscope.core.session.Session;
import io.agentscope.core.tool.Toolkit;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * 每 sessionId 一个 ReActAgent。v3 重构后,**每次 stream 都新建 agent**,
 * 因为 AgentScope 1.0.12 的 toolkit 在 build() 后不可改(issue #1203)。
 * 多轮 LLM 记忆靠 JsonSession 持久化(每次 build loadIfExists 拉回)。
 *
 * <p>工具激活语义:stream 时传 {@code activeTools} 名字列表,从 {@link ToolRegistry}
 * 按 sid 查工具集,过滤后挂到新 Toolkit。
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
    private final ConcurrentHashMap<String, ReActAgent> agents = new ConcurrentHashMap<>();

    public SessionManager(ChatModelBase model, Session session, AgentProperties props,
                          ToolRegistry toolRegistry, ToolSchemaFactory toolSchemaFactory) {
        this.model = model;
        this.session = session;
        this.props = props;
        this.toolRegistry = toolRegistry;
        this.toolSchemaFactory = toolSchemaFactory;
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
        // 从 registry 拿工具(会刷 lastUsedAt;不存在的名字会抛 IllegalArgumentException)
        List<RegisteredTool> tools = toolRegistry.get(sessionId, activeTools);

        Toolkit toolkit = null;
        String sysPrompt = props.getAgent().getSysPrompt();
        if (!tools.isEmpty()) {
            toolkit = new Toolkit();
            for (RegisteredTool t : tools) {
                toolkit.registerSchema(toolSchemaFactory.toToolSchema(t));
            }
            String withTools = toolSchemaFactory.buildSysPromptWithTools(tools);
            if (withTools != null) sysPrompt = withTools;
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
        agents.put(sessionId, agent);  // 覆盖旧引用,旧对象 GC
        log.debug("Session {} built (loaded={}, tools={})", sessionId, loaded, activeTools);
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
     */
    public Flux<Event> stream(String sessionId, String text, List<String> activeTools) {
        ReActAgent agent = getOrCreate(sessionId, activeTools);
        Msg userMsg = userMessage(text);
        return agent
            .stream(List.of(userMsg), StreamOptions.defaults())
            .doOnComplete(() -> {
                agent.saveTo(session, sessionId);
                log.debug("Session {} saved (stream complete)", sessionId);
            });
    }

    /**
     * Cleaner 调:某 sid 的工具被 TTL 清掉时,同步清 agent(避免内存涨)。
     * 不做 saveTo —— Cleaner 调时该 sid 通常已长时间无活动,saveTo 收益不大。
     */
    public void evict(String sessionId) {
        ReActAgent old = agents.remove(sessionId);
        if (old != null) log.debug("Session {} evicted (TTL)", sessionId);
    }

    @PreDestroy
    void shutdown() {
        // Best-effort flush of every active session.
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
