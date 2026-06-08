package com.example.agent.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 一次性 refresh_token。id 本身就是 token(随机 32 字节 Base64URL),存明文(可比对)。
 * v2 简化:先用明文存;P2 改成 BCrypt 哈希(代价是 token 必须更长)。
 */
@Entity
@Table(
    name = "refresh_token",
    indexes = @Index(name = "idx_refresh_client", columnList = "client_id")
)
public class RefreshToken {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "client_id", length = 64, nullable = false)
    private String clientId;

    /** 对应 access_token 的 jti(用于 audit 关联)。 */
    @Column(nullable = false, length = 64)
    private String jti;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getJti() { return jti; }
    public void setJti(String jti) { this.jti = jti; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
}
