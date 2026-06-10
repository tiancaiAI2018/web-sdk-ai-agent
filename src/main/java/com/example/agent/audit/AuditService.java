package com.example.agent.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 极简审计:每条调用一条记录,直接写 H2。生产应改为异步队列。
 *
 * v2:把 IP 和 jti 提到列(不再塞 detail JSON),方便查询/分析。
 * v3:加 TOOL_REGISTER / TOOL_UNREGISTER;CHAT_START 加 activeTools 字段(塞 detail)。
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

    /**
     * v3:CHAT_START 带 activeTools。null/空 = 纯聊天(无 detail 字段)。
     */
    @Transactional
    public void logChatStart(String clientId, String jti, String sessionId,
                             List<String> activeTools, String ip) {
        String detail = null;
        if (activeTools != null && !activeTools.isEmpty()) {
            detail = "activeTools=" + String.join(",", activeTools);
        }
        repo.save(AuditLog.of("CHAT_START", clientId, sessionId, jti, ip, detail));
    }

    @Transactional
    public void logChatDone(String clientId, String jti, String sessionId, String ip) {
        repo.save(AuditLog.of("CHAT_DONE", clientId, sessionId, jti, ip, null));
    }

    @Transactional
    public void logCrossTenantAccess(String clientId, String jti, String sessionId, String ip) {
        repo.save(AuditLog.of("CROSS_TENANT_ACCESS", clientId, sessionId, jti, ip, null));
    }

    /**
     * v3:模型调用了外部工具(原 FORM_SUBMIT 现在通用化,任何 tool 都记)。
     * @param toolName   工具名(第三方注册的)
     * @param argsHash   工具参数 JSON 的 SHA-256 前 12 位(避免把订单原文持久化)
     */
    @Transactional
    public void logFormSubmit(String clientId, String jti, String sessionId, String toolName,
                              String argsHash, String ip) {
        String detail = "tool=" + toolName + " argsHash=" + argsHash;
        repo.save(AuditLog.of("TOOL_CALL", clientId, sessionId, jti, ip, detail));
    }

    /**
     * v3:SDK 调 /tools/register 写一条审计。记注册的工具名清单(逗号分隔)。
     */
    @Transactional
    public void logToolRegister(String clientId, String jti, String sessionId,
                                List<String> toolNames, String ip) {
        String detail = toolNames == null || toolNames.isEmpty()
            ? null
            : "tools=" + String.join(",", toolNames);
        repo.save(AuditLog.of("TOOL_REGISTER", clientId, sessionId, jti, ip, detail));
    }

    /**
     * v3:SDK 调 /tools/unregister 写一条审计。
     */
    @Transactional
    public void logToolUnregister(String clientId, String jti, String sessionId,
                                  List<String> removedNames, String ip) {
        String detail = removedNames == null || removedNames.isEmpty()
            ? "all"
            : "tools=" + String.join(",", removedNames);
        repo.save(AuditLog.of("TOOL_UNREGISTER", clientId, sessionId, jti, ip, detail));
    }

    /**
     * v3:SDK 调 /tools/result 提交工具执行结果,写一条审计(只记 toolUseId,原文不存)。
     */
    @Transactional
    public void logToolResult(String clientId, String jti, String sessionId,
                              String toolUseId, String ip) {
        String detail = "toolUseId=" + (toolUseId == null ? "" : toolUseId);
        repo.save(AuditLog.of("TOOL_RESULT", clientId, sessionId, jti, ip, detail));
    }

    /**
     * v3+:SDK 调 /tools/abort 释放挂起的 agent(用户取消 / 重试失败后放弃 / 页面关闭)。
     * @param wasSuspended 后端此前是否真在挂起池(false 表示 idle,abort 是幂等 no-op)
     */
    @Transactional
    public void logToolAbort(String clientId, String jti, String sessionId,
                             boolean wasSuspended, String ip) {
        String detail = "wasSuspended=" + wasSuspended;
        repo.save(AuditLog.of("TOOL_ABORT", clientId, sessionId, jti, ip, detail));
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
