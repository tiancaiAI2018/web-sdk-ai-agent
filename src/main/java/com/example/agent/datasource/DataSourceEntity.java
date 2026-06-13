package com.example.agent.datasource;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 第三方数据源配置。不直接暴露给 LLM,是服务端工具的数据提供方。
 * 支持 REST API 调用,认证方式可配置。
 */
@Entity
@Table(name = "data_source")
public class DataSourceEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(nullable = false, length = 128)
    private String name;

    /** 数据源类型: rest | jdbc(v2) */
    @Column(nullable = false, length = 32)
    private String type;

    /** 第三方 API 地址 */
    @Column(nullable = false, length = 500)
    private String url;

    /** 认证方式: none | api_key | bearer | basic */
    @Column(length = 32)
    private String authType;

    /** 认证配置(JSON,含密钥等敏感信息) */
    @Column(columnDefinition = "TEXT")
    private String authConfig;

    /** 额外请求头(JSON) */
    @Column(columnDefinition = "TEXT")
    private String headers;

    /** 所属第三方 clientId */
    @Column(name = "owner_id", nullable = false, length = 64)
    private String ownerId;

    /** 健康状态: ok | fail | unknown */
    @Column(name = "health_status", length = 16)
    private String healthStatus = "unknown";

    @Column(name = "last_check_at")
    private Instant lastCheckAt;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getAuthType() { return authType; }
    public void setAuthType(String authType) { this.authType = authType; }
    public String getAuthConfig() { return authConfig; }
    public void setAuthConfig(String authConfig) { this.authConfig = authConfig; }
    public String getHeaders() { return headers; }
    public void setHeaders(String headers) { this.headers = headers; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }
    public Instant getLastCheckAt() { return lastCheckAt; }
    public void setLastCheckAt(Instant lastCheckAt) { this.lastCheckAt = lastCheckAt; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
