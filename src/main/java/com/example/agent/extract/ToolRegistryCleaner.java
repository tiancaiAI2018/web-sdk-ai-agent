package com.example.agent.extract;

import com.example.agent.session.SessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * 每 5 分钟跑一次,把超过 {@link ToolRegistry#TTL} 没活动的 sessionId 整条清掉。
 *
 * <p>同时清掉 {@link SessionManager} 里对应 sid 的 ReActAgent,避免 agent 内存涨。
 *
 * <p>@EnableScheduling 已在 Application 类加(待确认),或这里改 @EnableScheduling 也行。
 */
@Component
public class ToolRegistryCleaner {

    private static final Logger log = LoggerFactory.getLogger(ToolRegistryCleaner.class);

    private final ToolRegistry registry;
    private final SessionManager sessions;

    public ToolRegistryCleaner(ToolRegistry registry, SessionManager sessions) {
        this.registry = registry;
        this.sessions = sessions;
    }

    /** 每 5 分钟跑一次,fixedRate = 300_000 ms。 */
    @Scheduled(fixedRate = 5 * 60 * 1000L, initialDelay = 5 * 60 * 1000L)
    public void clean() {
        Instant cutoff = Instant.now().minus(ToolRegistry.TTL);
        List<String> evicted;
        try {
            evicted = registry.evictExpired(cutoff);
        } catch (Exception e) {
            log.warn("ToolRegistry evict failed: {}", e.getMessage());
            return;
        }
        for (String sid : evicted) {
            try { sessions.evict(sid); }
            catch (Exception e) { log.warn("SessionManager.evict({}) failed: {}", sid, e.getMessage()); }
        }
        if (!evicted.isEmpty()) {
            log.info("ToolRegistry cleaned {} stale sessions: {}", evicted.size(), evicted);
        }
    }
}
