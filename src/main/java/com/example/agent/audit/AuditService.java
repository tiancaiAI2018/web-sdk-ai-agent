package com.example.agent.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 极简审计:每条调用一条记录,直接写 H2。生产应改为异步队列。
 */
@Service
public class AuditService {

    private final AuditLogRepository repo;

    public AuditService(AuditLogRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void logAuthSuccess(String clientId, String remoteAddr) {
        repo.save(AuditLog.of("AUTH_OK", clientId, null, "ip=" + remoteAddr));
    }

    @Transactional
    public void logAuthFail(String path) {
        repo.save(AuditLog.of("AUTH_FAIL", null, null, "path=" + path));
    }

    @Transactional
    public void logChatStart(String clientId, String sessionId) {
        repo.save(AuditLog.of("CHAT_START", clientId, sessionId, null));
    }

    @Transactional
    public void logChatDone(String clientId, String sessionId) {
        repo.save(AuditLog.of("CHAT_DONE", clientId, sessionId, null));
    }
}
