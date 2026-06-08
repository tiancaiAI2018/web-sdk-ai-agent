package com.example.agent.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "audit_log")
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

    @Column(length = 1000)
    private String detail;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public static AuditLog of(String eventType, String clientId, String sessionId, String detail) {
        AuditLog a = new AuditLog();
        a.eventType = eventType;
        a.clientId = clientId;
        a.sessionId = sessionId;
        a.detail = detail;
        return a;
    }

    public Long getId() { return id; }
    public String getClientId() { return clientId; }
    public String getSessionId() { return sessionId; }
    public String getEventType() { return eventType; }
    public String getDetail() { return detail; }
    public Instant getCreatedAt() { return createdAt; }
}
