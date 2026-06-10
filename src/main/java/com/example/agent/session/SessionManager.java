package com.example.agent.session;

import com.example.agent.config.AgentProperties;
import com.example.agent.extract.RegisteredTool;
import com.example.agent.extract.NoPendingToolException;
import com.example.agent.extract.StreamBlockedException;
import com.example.agent.extract.ToolRegistry;
import com.example.agent.extract.ToolSchemaFactory;
import com.example.agent.extract.ToolUseIdMismatchException;
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
                //
                // **关键**:把 agent 放入 suspendedAgents 必须在 doOnNext 阶段完成,
                // 而**不是** doOnComplete。doOnNext 是 flatMap 的上游,其副作用一定
                // 先于该事件的 SSE 帧被 Spring 写入 response。SDK reader 一拿到
                // `event: tool_call` 帧就 fire-and-forget 触发 onCall;若 onCall 极快
                // (host-page demo 的同步 onCall 几 ms 就 return),POST /tools/result
                // 可能在后端 agent.stream() signal onComplete 之前到达 —— 此时
                // resume() 读 suspendedAgents 还是 null,误报 409 no_pending_tool_call。
                // putIfAbsent 幂等:多次扫到同一个 tool_use 不会覆盖。
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
                    if (suspendedAgents.putIfAbsent(safe, agent) == null) {
                        log.debug("Session {} suspended on tool {} ({}); awaiting /tools/result",
                            safe, tu.getName(), tu.getId());
                    }
                    suspended.set(true);
                    return;  // 只记第一个
                }
            })
            .doOnComplete(() -> {
                if (suspended.get()) {
                    // doOnNext 阶段已放 suspendedAgents,这里只确认 + 记日志
                    log.debug("Session {} stream complete (suspended on tool {} ({}))",
                        safe, pendingName.get(), pendingId.get());
                } else {
                    // 正常完成:无工具调用,持久化
                    agent.saveTo(session, safe);
                    log.debug("Session {} saved (stream complete)", safe);
                }
            })
            .doOnError(err -> {
                // LLM 5xx / 网络中断 / 中途异常。
                // 若已挂起(tool_use 已 emit 但 stream error),保留在 suspendedAgents
                // —— resume() 的 doOnError 仍会清;且 /tools/result 可能仍想尝试喂结果。
                // 若未挂起,evict 这个半成品 agent。
                if (suspended.get()) {
                    log.warn("Session {} stream error after suspend, agent stays suspended: {}",
                        safe, err.toString());
                } else {
                    agents.remove(safe);
                    log.warn("Session {} stream error, agent evicted: {}", safe, err.toString());
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

        // 让 resume() 这次活动刷 ToolRegistry lastUsedAt,避免 30 min TTL
        // 在 TOOL_SUSPENDED 期间把已挂起但用户停留很久的 session 误清。
        toolRegistry.touch(safe, List.of());

        // 校验 toolUseId 真在 memory 里。挂起中但 id 错配(SDK 用过期 id 重试、
        // sid 错配、stale SSE 帧)→ 报 409 mismatch,而不是塞 "external_tool"
        // 喂 LLM 让它收到一个"它没发出过"的 tool result 后乱回。
        boolean idMatches = agent.getMemory().getMessages().stream()
            .flatMap(m -> m.getContentBlocks(ToolUseBlock.class).stream())
            .anyMatch(u -> toolUseId.equals(u.getId()));
        if (!idMatches) {
            log.warn("Session {} resume failed: toolUseId {} not in suspended memory",
                safe, toolUseId);
            return Flux.error(new ToolUseIdMismatchException(safe, toolUseId));
        }

        // 校验通过 → 反查 toolName(必命中,不再 orElse("external_tool") 兜底)
        String toolName = agent.getMemory().getMessages().stream()
            .flatMap(m -> m.getContentBlocks(ToolUseBlock.class).stream())
            .filter(u -> toolUseId.equals(u.getId()))
            .map(ToolUseBlock::getName)
            .findFirst()
            .orElseThrow();   // 上面已校验存在,这里必不抛

        Msg toolResult = Msg.builder()
            .role(MsgRole.TOOL)
            .content(ToolResultBlock.of(toolUseId, toolName,
                TextBlock.builder().text(resultText).build()))
            .build();

        log.debug("Session {} resuming with tool result ({} bytes)", safe,
            resultText == null ? 0 : resultText.length());
        // 关键 race:SDK 同步 onCall 极快(host-page demo 就这场景),POST /tools/result
        // 可能在后端上一条 stream 的 doOnComplete 跑完后**立即**到达,而 AgentScope
        // 内部的 isRunning 标志由 Spring WebFlux 清理 subscriber 时**异步**清除,
        // 比 doOnComplete 晚几 ms 到几十 ms。此时 agent.stream() 抛
        // IllegalStateException("Agent is still running") → 500。
        // 用 Flux.defer + retryWhen 做短暂重试(3 × 50ms = 最多 150ms),
        // 避开这个窗口。其他错误照旧不重试。
        return Flux.<Event>defer(() -> {
                    try {
                        return agent.stream(List.of(toolResult), StreamOptions.defaults());
                    } catch (IllegalStateException e) {
                        // 把同步抛转成 Flux.error,让 retryWhen 接住
                        return Flux.error(e);
                    }
                })
                .retryWhen(reactor.util.retry.Retry.fixedDelay(3, java.time.Duration.ofMillis(50))
                    .filter(t -> t instanceof IllegalStateException
                        && t.getMessage() != null
                        && t.getMessage().contains("Agent is still running")))
            .doOnComplete(() -> {
                // 完成后移出挂起池 + saveTo(此时 memory 已含 tool result,完整)
                suspendedAgents.remove(safe);
                agent.saveTo(session, safe);
                log.debug("Session {} resumed and saved", safe);
            })
            .doOnError(err -> {
                // LLM 5xx / 中断:tool result 已喂入 memory 但 LLM 没消化,save 会留半配对。
                // 移出挂起池 + evict,让下次 stream 从干净状态开始。
                suspendedAgents.remove(safe);
                agents.remove(safe);
                log.warn("Session {} resume error, evicted: {}", safe, err.toString());
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

    /**
     * SDK 调 /tools/abort:释放挂起中的 agent(用户取消 / SDK 重试失败后放弃 /
     * 页面关闭)。不 saveTo —— memory 含半配对 ToolUseBlock,持久化反而会让下次
     * loadIfExists 触发 ReActAgent.doCall 的 IllegalStateException。
     *
     * @return 此前是否真在挂起池(false = idle,abort 是幂等 no-op)
     */
    public boolean abort(String sessionId) {
        String safe = sanitize(sessionId);
        ReActAgent suspended = suspendedAgents.remove(safe);
        if (suspended != null) {
            // 同步清 agents map 里那条引用,避免内存涨
            agents.remove(safe);
            log.debug("Session {} aborted (was suspended)", safe);
            return true;
        }
        return false;
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
