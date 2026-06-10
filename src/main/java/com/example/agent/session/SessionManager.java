package com.example.agent.session;

import com.example.agent.config.AgentProperties;
import com.example.agent.extract.RegisteredTool;
import com.example.agent.extract.NoPendingToolException;
import com.example.agent.extract.StreamBlockedException;
import com.example.agent.extract.ToolRegistry;
import com.example.agent.extract.ToolSchemaFactory;
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
    /**
     * Sessions whose last stream ended in TOOL_SUSPENDED. The ReActAgent
     * here is in suspended state (memory contains an unmatched ToolUseBlock)
     * and must be reused for the next /tools/result call — rebuilding would
     * trigger ReActAgent.doCall's "Pending tool calls exist without results"
     * check on the next stream.
     */
    private final ConcurrentHashMap<String, ReActAgent> suspendedAgents = new ConcurrentHashMap<>();

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
     *
     * <p>如果流末尾是 TOOL_SUSPENDED(schema-only 工具被 LLM 触发,等待外部
     * SDK 回传结果),agent 移入 {@code suspendedAgents},<b>不</b> saveTo —— 否则
     * JsonSession 会持久化未配对 ToolUseBlock,下次 loadIfExists 后
     * ReActAgent.doCall 会抛 IllegalStateException。
     */
    public Flux<Event> stream(String sessionId, String text, List<String> activeTools) {
        String safe = sanitize(sessionId);

        // 挂起期间拒绝新 stream(SDK 应该先 POST /tools/result)
        if (suspendedAgents.containsKey(safe)) {
            return Flux.error(new StreamBlockedException(safe));
        }

        ReActAgent agent = getOrCreate(safe, activeTools);
        Msg userMsg = userMessage(text);
        AtomicBoolean suspended = new AtomicBoolean(false);
        AtomicReference<String> pendingName = new AtomicReference<>();
        AtomicReference<String> pendingId = new AtomicReference<>();

        return agent
            .stream(List.of(userMsg), StreamOptions.defaults())
            .doOnNext(event -> {
                // AgentScope 触 TOOL_SUSPENDED 时,ToolUseBlock 可能在中间事件上,
                // 也可能在最后的 isLast 帧上 —— 扫**所有**事件,任何一条带
                // 非内部 ToolUseBlock 就标 suspended。
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
                    suspended.set(true);
                    log.debug("Session {} detected TOOL_SUSPENDED on tool {} ({})",
                        safe, tu.getName(), tu.getId());
                    return;  // 只记第一个
                }
            })
            .doOnComplete(() -> {
                if (suspended.get()) {
                    // 挂起:agent 留在内存,等 /tools/result 来喂结果;不 saveTo
                    suspendedAgents.put(safe, agent);
                    log.debug("Session {} suspended on tool {} ({}); awaiting /tools/result",
                        safe, pendingName.get(), pendingId.get());
                } else {
                    agent.saveTo(session, safe);
                    log.debug("Session {} saved (stream complete)", safe);
                }
            });
    }

    /**
     * SDK 调 onCall 完成后,POST /tools/result 触发恢复。
     * 必须用 <b>同一个</b> agent 实例(挂在 {@code suspendedAgents} 里),
     * 用官方模式喂入 {@code Msg.builder().role(TOOL).content(ToolResultBlock...)}。
     */
    public Flux<Event> resume(String sessionId, String toolUseId, String resultText) {
        String safe = sanitize(sessionId);
        ReActAgent agent = suspendedAgents.get(safe);
        if (agent == null) {
            // 没有挂起 → /tools/result 报 409,但文案要明确"无 pending tool call"
            log.warn("Session {} resume failed: no pending tool call (sid={}, toolUseId={})",
                safe, safe, toolUseId);
            return Flux.error(new NoPendingToolException(safe));
        }
        // 从 memory 里找对应的 tool name(用 id 反查)
        String toolName = agent.getMemory().getMessages().stream()
            .flatMap(m -> m.getContentBlocks(ToolUseBlock.class).stream())
            .filter(u -> toolUseId.equals(u.getId()))
            .map(ToolUseBlock::getName)
            .findFirst()
            .orElse("external_tool");

        Msg toolResult = Msg.builder()
            .role(MsgRole.TOOL)
            .content(ToolResultBlock.of(toolUseId, toolName,
                TextBlock.builder().text(resultText).build()))
            .build();

        log.debug("Session {} resuming with tool result ({} bytes)", safe,
            resultText == null ? 0 : resultText.length());
        return agent.stream(List.of(toolResult), StreamOptions.defaults())
            .doOnComplete(() -> {
                // 完成后移出挂起池 + saveTo(此时 memory 已含 tool result,完整)
                suspendedAgents.remove(safe);
                agent.saveTo(session, safe);
                log.debug("Session {} resumed and saved", safe);
            });
    }

    /**
     * Cleaner 调:某 sid 的工具被 TTL 清掉时,同步清 agent(避免内存涨)。
     * 不做 saveTo —— Cleaner 调时该 sid 通常已长时间无活动,saveTo 收益不大。
     */
    public void evict(String sessionId) {
        ReActAgent old = agents.remove(sessionId);
        if (old != null) log.debug("Session {} evicted (TTL)", sessionId);
        // 同步清挂起池(浏览器关掉、SDK 永远不会再调 /tools/result)
        ReActAgent suspended = suspendedAgents.remove(sessionId);
        if (suspended != null) log.debug("Session {} suspended agent evicted (TTL)", sessionId);
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
