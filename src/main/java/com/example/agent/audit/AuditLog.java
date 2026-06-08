package com.example.agent.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(
    name = "audit_log",
    indexes = {
        @Index(name = "idx_audit_client", columnList = "client_id"),
        @Index(name = "idx_audit_event",  columnList = "event_type")
    }
)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", length = 64)
    private String clientId;

    @Column(name = "session_id", length = 128)
    private String sessionId;

    @Column(name = "event_type", nullable = false, length = 32)
    private String eventType;

    /** 对应签发出去的 access_token 的 jti(若有)。 */
    @Column(length = 64)
    private String jti;

    /** 调用方 IP,优先 X-Forwarded-For,否则 remoteAddress。 */
    @Column(length = 64)
    private String ip;

    @Column(length = 1000)
    private String detail;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public static AuditLog of(String eventType, String clientId, String sessionId,
                              String jti, String ip, String detail) {
        AuditLog a = new AuditLog();
        a.eventType = eventType;
        a.clientId = clientId;
        a.sessionId = sessionId;
        a.jti = jti;
        a.ip = ip;
        a.detail = detail;
        return a;
    }

    public Long getId() { return id; }
    public String getClientId() { return clientId; }
    public String getSessionId() { return sessionId; }
    public String getEventType() { return eventType; }
    public String getJti() { return jti; }
    public String getIp() { return ip; }
    public String getDetail() { return detail; }
    public Instant getCreatedAt() { return createdAt; }
}
