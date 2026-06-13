package com.example.agent.tool;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * 服务端工具配置。
 *
 * 与 SDK 工具不同,服务端工具的 onCall 在 AI 后端执行,
 * 不走 TOOL_SUSPENDED 流程,对 SDK 完全透明。
 *
 * 核心字段:
 * - processorType: 处理器类型,决定如何加工第三方原始数据
 *   - fuzzy_match: 模糊搜索+精排(字典场景)
 *   - passthrough: 原样透传第三方响应
 * - processorConfig: 处理器配置(JSON),不同处理器有不同配置项
 * - dataSourceId: 关联的数据源ID,工具通过此数据源拉取原始数据
 */
@Entity
@Table(name = "server_tool")
public class ServerTool {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(nullable = false, unique = true, length = 64)
    private String name;

    /** 工具描述(发给 LLM) */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** JSON Schema 参数定义(发给 LLM) */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String parameters;

    /** 处理器类型: fuzzy_match | passthrough | filter | transform */
    @Column(name = "processor_type", nullable = false, length = 32)
    private String processorType;

    /** 处理器配置(JSON),不同处理器有不同配置项 */
    @Column(name = "processor_config", columnDefinition = "TEXT")
    private String processorConfig;

    /** 关联数据源ID(工具通过此数据源拉取原始数据) */
    @Column(name = "data_source_id", length = 64)
    private String dataSourceId;

    /** API 路径模板(如 /api/dict/{type}/list),覆盖数据源默认路径 */
    @Column(name = "path_template", length = 500)
    private String pathTemplate;

    /** 响应字段映射(JSON: {codeField, nameField, aliasesField, parentField}) */
    @Column(name = "response_mapping", columnDefinition = "TEXT")
    private String responseMapping;

    @Column(nullable = false)
    private boolean enabled = true;

    /** 所属第三方 clientId(空=平台内置) */
    @Column(length = 64)
    private String ownerId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // ==================== Getters & Setters ====================

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }
    public String getProcessorType() { return processorType; }
    public void setProcessorType(String processorType) { this.processorType = processorType; }
    public String getProcessorConfig() { return processorConfig; }
    public void setProcessorConfig(String processorConfig) { this.processorConfig = processorConfig; }
    public String getDataSourceId() { return dataSourceId; }
    public void setDataSourceId(String dataSourceId) { this.dataSourceId = dataSourceId; }
    public String getPathTemplate() { return pathTemplate; }
    public void setPathTemplate(String pathTemplate) { this.pathTemplate = pathTemplate; }
    public String getResponseMapping() { return responseMapping; }
    public void setResponseMapping(String responseMapping) { this.responseMapping = responseMapping; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
