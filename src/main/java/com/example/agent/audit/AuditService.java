package com.example.agent.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.server.reactive.ServerHttpRequest;

/**
 * 极简审计:每条调用一条记录,直接写 H2。生产应改为异步队列。
 *
 * v2:把 IP 和 jti 提到列(不再塞 detail JSON),方便查询/分析。
 */
@Service
public class AuditService {

    private final AuditLogRepository repo;

    public AuditService(AuditLogRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void logAuthSuccess(String clientId, String jti, String ip) {
        repo.save(AuditLog.of("AUTH_OK", clientId, null, jti, ip, null));
    }

    @Transactional
    public void logAuthFail(String path, String ip) {
        repo.save(AuditLog.of("AUTH_FAIL", null, null, null, ip, "path=" + path));
    }

    @Transactional
    public void logAuthRateLimit(String clientId, String ip) {
        repo.save(AuditLog.of("AUTH_RATE_LIMIT", clientId, null, null, ip, null));
    }

    @Transactional
    public void logChatStart(String clientId, String jti, String sessionId, String ip) {
        repo.save(AuditLog.of("CHAT_START", clientId, sessionId, jti, ip, null));
    }

    @Transactional
    public void logChatDone(String clientId, String jti, String sessionId, String ip) {
        repo.save(AuditLog.of("CHAT_DONE", clientId, sessionId, jti, ip, null));
    }

    @Transactional
    public void logCrossTenantAccess(String clientId, String jti, String sessionId, String ip) {
        repo.save(AuditLog.of("CROSS_TENANT_ACCESS", clientId, sessionId, jti, ip, null));
    }

    /** 从 WebFlux ServerHttpRequest 提 IP(优先 X-Forwarded-For,再退回 remoteAddress)。 */
    public static String extractIp(ServerHttpRequest req) {
        if (req == null) return null;
        String fwd = req.getHeaders().getFirst("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) {
            int comma = fwd.indexOf(',');
            return (comma > 0 ? fwd.substring(0, comma) : fwd).trim();
        }
        if (req.getRemoteAddress() == null) return null;
        return req.getRemoteAddress().getAddress() == null
            ? req.getRemoteAddress().getHostString()
            : req.getRemoteAddress().getAddress().getHostAddress();
    }
}
