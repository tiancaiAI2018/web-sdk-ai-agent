package com.example.agent.session;

import com.example.agent.config.AgentProperties;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.agent.Event;
import io.agentscope.core.agent.StreamOptions;
import io.agentscope.core.memory.InMemoryMemory;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import io.agentscope.core.message.TextBlock;
import io.agentscope.core.model.ChatModelBase;
import io.agentscope.core.session.Session;
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
 * One ReActAgent per sessionId, hydrated from JsonSession on first use and
 * persisted after every turn. ReActAgent defaults checkRunning=true, so a
 * single session will not accept concurrent calls — that is the intended
 * safety behavior for the simplest possible implementation.
 */
@Component
public class SessionManager {

    private static final Logger log = LoggerFactory.getLogger(SessionManager.class);

    /** 允许安全字符 + namespace 分隔符 ':'(v2 起,sessionId 形如 {clientId}:{userPart})。
     *  ':' 是 RFC 3986 sub-delim,在 URL path 里合法;JsonSession 落盘也安全(无 '/',无 '..')。 */
    private static final Pattern SAFE_ID = Pattern.compile("[A-Za-z0-9_\\-:]{1,128}");

    private final ChatModelBase model;
    private final Session session;
    private final AgentProperties props;
    private final ConcurrentHashMap<String, ReActAgent> agents = new ConcurrentHashMap<>();

    public SessionManager(ChatModelBase model, Session session, AgentProperties props) {
        this.model = model;
        this.session = session;
        this.props = props;
    }

    /**
     * Build or reuse the agent for a given sessionId.
     * On first call for an id, attempts to load existing state from Session.
     */
    public ReActAgent getOrCreate(String sessionId) {
        String safe = sanitize(sessionId);
        return agents.computeIfAbsent(safe, this::build);
    }

    private ReActAgent build(String sessionId) {
        ReActAgent agent = ReActAgent.builder()
            .name(props.getAgent().getName())
            .sysPrompt(props.getAgent().getSysPrompt())
            .model(model)
            .memory(new InMemoryMemory())
            .maxIters(props.getAgent().getMaxIters())
            .build();

        boolean loaded = agent.loadIfExists(session, sessionId);
        log.info("Session {} (loaded={})", sessionId, loaded);
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
        ReActAgent agent = getOrCreate(sessionId);
        Msg userMsg = userMessage(text);
        return Mono.fromFuture(agent.call(userMsg).toFuture())
            .doOnNext(resp -> {
                agent.saveTo(session, sessionId);
                log.debug("Session {} saved ({} chars)", sessionId,
                    resp.getTextContent() == null ? 0 : resp.getTextContent().length());
            });
    }

    /**
     * Streaming call. Returns a Flux<Event> bridged to the SSE endpoint, and
     * persists session state once the stream completes successfully.
     */
    public Flux<Event> stream(String sessionId, String text) {
        ReActAgent agent = getOrCreate(sessionId);
        Msg userMsg = userMessage(text);
        return agent
            .stream(List.of(userMsg), StreamOptions.defaults())
            .doOnComplete(() -> {
                agent.saveTo(session, sessionId);
                log.debug("Session {} saved (stream complete)", sessionId);
            });
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
