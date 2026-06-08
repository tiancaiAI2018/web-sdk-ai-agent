package com.example.agent.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 第三方应用凭据。id 即 clientId,secret 永远以 BCrypt 哈希存储。
 */
@Entity
@Table(name = "third_party_app")
public class AppCredentials {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "secret_hash", nullable = false)
    private String secretHash;

    @Column(name = "allowed_origin", length = 500)
    private String allowedOrigin;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSecretHash() { return secretHash; }
    public void setSecretHash(String secretHash) { this.secretHash = secretHash; }
    public String getAllowedOrigin() { return allowedOrigin; }
    public void setAllowedOrigin(String allowedOrigin) { this.allowedOrigin = allowedOrigin; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
