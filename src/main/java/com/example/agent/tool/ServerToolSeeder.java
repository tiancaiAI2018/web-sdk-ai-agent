package com.example.agent.tool;

import com.example.agent.datasource.DataSourceEntity;
import com.example.agent.datasource.DataSourceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * 启动时自动注册示例服务端工具和数据源。
 *
 * 注册内容:
 * 1. query_dict 工具(fuzzy_match 处理器) — 字典模糊查询
 * 2. query_inventory 工具(passthrough 处理器) — 库存查询(透传)
 * 3. 默认数据源(指向 localhost:7000 第三方 mock)
 */
@Component
public class ServerToolSeeder {

    private static final Logger log = LoggerFactory.getLogger(ServerToolSeeder.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final String MOCK_BASE_URL = "http://localhost:7000";

    private final ServerToolRepository toolRepo;
    private final DataSourceRepository dsRepo;

    public ServerToolSeeder(ServerToolRepository toolRepo, DataSourceRepository dsRepo) {
        this.toolRepo = toolRepo;
        this.dsRepo = dsRepo;
    }

    @PostConstruct
    void seed() {
        // 1. 确保默认数据源存在
        DataSourceEntity ds = ensureDataSource();

        // 2. 注册 query_dict 工具(fuzzy_match)
        ensureTool("query_dict", () -> buildDictTool(ds.getId()));

        // 3. 注册 query_inventory 工具(passthrough)
        ensureTool("query_inventory", () -> buildInventoryTool(ds.getId()));

        log.info("[ServerToolSeeder] seed completed");
    }

    /** 确保数据源存在 */
    private DataSourceEntity ensureDataSource() {
        // 查找是否已有指向 mock 的数据源
        var existing = dsRepo.findAll().stream()
            .filter(d -> MOCK_BASE_URL.equals(d.getUrl()))
            .findFirst();
        if (existing.isPresent()) {
            log.info("[ServerToolSeeder] data source already exists: id={}", existing.get().getId());
            return existing.get();
        }

        DataSourceEntity ds = new DataSourceEntity();
        ds.setId(UUID.randomUUID().toString());
        ds.setName("第三方Mock服务");
        ds.setType("rest");
        ds.setUrl(MOCK_BASE_URL);
        ds.setAuthType("none");
        ds.setOwnerId("demo-app");
        ds.setEnabled(true);
        ds.setHealthStatus("unknown");
        ds = dsRepo.save(ds);
        log.info("[ServerToolSeeder] created data source: id={}, url={}", ds.getId(), ds.getUrl());
        return ds;
    }

    /** 确保工具存在 */
    private void ensureTool(String name, java.util.function.Supplier<ServerTool> builder) {
        if (toolRepo.existsByName(name)) {
            log.info("[ServerToolSeeder] tool already exists: {}", name);
            return;
        }
        ServerTool tool = builder.get();
        toolRepo.save(tool);
        log.info("[ServerToolSeeder] registered tool: {} (processor={})", name, tool.getProcessorType());
    }

    /** 构建 query_dict 工具(fuzzy_match 处理器) */
    private ServerTool buildDictTool(String dataSourceId) {
        ServerTool tool = new ServerTool();
        tool.setId(UUID.randomUUID().toString());
        tool.setName("query_dict");
        tool.setDescription(
            "查询字典编码。根据关键词模糊匹配字典项,支持级联查询。" +
            "dict_type 为字典类型(如 city, product, device_model 等)。" +
            "keyword 为搜索关键词(支持编码、名称、别名模糊匹配)。" +
            "parent_code 用于级联字典的父级过滤(可选)。" +
            "limit 为返回条数上限(默认5,最大20)。"
        );
        tool.setParameters(buildDictParameters());
        tool.setProcessorType("fuzzy_match");
        tool.setProcessorConfig(buildDictProcessorConfig());
        tool.setDataSourceId(dataSourceId);
        tool.setPathTemplate("/api/dict/{dict_type}/list");
        tool.setResponseMapping(null);
        tool.setEnabled(true);
        tool.setOwnerId(null); // 平台内置
        return tool;
    }

    /** 构建 query_inventory 工具(passthrough 处理器) */
    private ServerTool buildInventoryTool(String dataSourceId) {
        ServerTool tool = new ServerTool();
        tool.setId(UUID.randomUUID().toString());
        tool.setName("query_inventory");
        tool.setDescription(
            "查询库存信息。根据产品编码或仓库编码查询库存数据。" +
            "product_code 为产品编码(可选)。" +
            "warehouse_code 为仓库编码(可选)。" +
            "返回第三方系统的原始库存数据。"
        );
        tool.setParameters(buildInventoryParameters());
        tool.setProcessorType("passthrough");
        tool.setProcessorConfig("{\"responsePath\":\"data\"}");
        tool.setDataSourceId(dataSourceId);
        tool.setPathTemplate("/api/inventory/query");
        tool.setResponseMapping(null);
        tool.setEnabled(true);
        tool.setOwnerId(null);
        return tool;
    }

    private String buildDictParameters() {
        try {
            var schema = java.util.Map.of(
                "type", "object",
                "properties", java.util.Map.of(
                    "dict_type", java.util.Map.of(
                        "type", "string",
                        "description", "字典类型(如 city, product, device_model 等)"
                    ),
                    "keyword", java.util.Map.of(
                        "type", "string",
                        "description", "搜索关键词"
                    ),
                    "parent_code", java.util.Map.of(
                        "type", "string",
                        "description", "父级编码(级联字典用,可选)"
                    ),
                    "limit", java.util.Map.of(
                        "type", "integer",
                        "description", "返回条数上限",
                        "default", 5
                    )
                ),
                "required", java.util.List.of("dict_type", "keyword")
            );
            return MAPPER.writeValueAsString(schema);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String buildDictProcessorConfig() {
        try {
            // fuzzy_match 处理器的配置
            var config = java.util.Map.of(
                "keywordArg", "keyword",
                "limitArg", "limit",
                "parentArg", "parent_code",
                "defaultLimit", 5,
                "maxLimit", 20,
                "codeField", "code",
                "nameField", "name",
                "aliasesField", "aliases",
                "parentField", "parent"
            );
            return MAPPER.writeValueAsString(config);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String buildInventoryParameters() {
        try {
            var schema = java.util.Map.of(
                "type", "object",
                "properties", java.util.Map.of(
                    "product_code", java.util.Map.of(
                        "type", "string",
                        "description", "产品编码(可选)"
                    ),
                    "warehouse_code", java.util.Map.of(
                        "type", "string",
                        "description", "仓库编码(可选)"
                    )
                ),
                "required", java.util.List.of()
            );
            return MAPPER.writeValueAsString(schema);
        } catch (Exception e) {
            return "{}";
        }
    }
}
