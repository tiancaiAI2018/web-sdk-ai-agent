package com.example.agent.admin;

import com.example.agent.datasource.DataSourceRepository;
import com.example.agent.tool.ServerTool;
import com.example.agent.tool.ServerToolRepository;
import com.example.agent.tool.processor.ProcessorFactory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * 服务端工具管理 API —— 完整 CRUD + 处理器类型查询。
 */
@RestController
@RequestMapping("/admin/api")
@Tag(name = "07 服务端工具", description = "服务端工具管理(需 admin scope JWT)")
@SecurityRequirement(name = "bearer-jwt")
public class ServerToolController {

    private final ServerToolRepository repo;
    private final DataSourceRepository dsRepo;
    private final ProcessorFactory processorFactory;

    public ServerToolController(ServerToolRepository repo,
                                DataSourceRepository dsRepo,
                                ProcessorFactory processorFactory) {
        this.repo = repo;
        this.dsRepo = dsRepo;
        this.processorFactory = processorFactory;
    }

    @GetMapping("/server-tools")
    @Operation(summary = "列出所有服务端工具")
    public List<ServerTool> listTools() {
        return repo.findAll();
    }

    @GetMapping("/server-tools/{id}")
    @Operation(summary = "获取单个服务端工具详情")
    public ResponseEntity<ServerTool> getTool(@PathVariable String id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/server-tools")
    @Operation(summary = "创建服务端工具")
    public ResponseEntity<?> createTool(@RequestBody CreateToolRequest body) {
        // 参数校验
        if (body.name() == null || body.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "name is required"));
        }
        if (body.processorType() == null || body.processorType().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "processorType is required"));
        }
        if (body.description() == null || body.description().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "description is required"));
        }
        if (repo.existsByName(body.name())) {
            return ResponseEntity.badRequest().body(Map.of("error", "tool name already exists"));
        }

        // 数据源校验
        if (body.dataSourceId() != null && !body.dataSourceId().isBlank()) {
            if (!dsRepo.existsById(body.dataSourceId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "data source not found"));
            }
        }

        ServerTool tool = new ServerTool();
        tool.setId(UUID.randomUUID().toString());
        tool.setName(body.name());
        tool.setDescription(body.description());
        tool.setParameters(body.parameters() != null ? body.parameters() : "{}");
        tool.setProcessorType(body.processorType());
        tool.setProcessorConfig(body.processorConfig());
        tool.setDataSourceId(body.dataSourceId());
        tool.setPathTemplate(body.pathTemplate());
        tool.setResponseMapping(body.responseMapping());
        tool.setEnabled(true);
        tool.setOwnerId(body.ownerId());
        return ResponseEntity.ok(repo.save(tool));
    }

    @PutMapping("/server-tools/{id}")
    @Operation(summary = "更新服务端工具")
    public ResponseEntity<ServerTool> updateTool(@PathVariable String id, @RequestBody CreateToolRequest body) {
        Optional<ServerTool> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        ServerTool tool = opt.get();
        if (body.name() != null) tool.setName(body.name());
        if (body.description() != null) tool.setDescription(body.description());
        if (body.parameters() != null) tool.setParameters(body.parameters());
        if (body.processorType() != null) tool.setProcessorType(body.processorType());
        if (body.processorConfig() != null) tool.setProcessorConfig(body.processorConfig());
        if (body.dataSourceId() != null) tool.setDataSourceId(body.dataSourceId());
        if (body.pathTemplate() != null) tool.setPathTemplate(body.pathTemplate());
        if (body.responseMapping() != null) tool.setResponseMapping(body.responseMapping());
        if (body.enabled() != null) tool.setEnabled(body.enabled());
        if (body.ownerId() != null) tool.setOwnerId(body.ownerId());
        tool.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(repo.save(tool));
    }

    @DeleteMapping("/server-tools/{id}")
    @Operation(summary = "删除服务端工具")
    public ResponseEntity<Map<String, String>> deleteTool(@PathVariable String id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    @GetMapping("/processor-types")
    @Operation(summary = "获取所有可用的处理器类型")
    public List<Map<String, String>> listProcessorTypes() {
        return processorFactory.availableTypes().stream()
            .map(type -> Map.of("type", type, "description", describeProcessor(type)))
            .toList();
    }

    private String describeProcessor(String type) {
        return switch (type) {
            case "fuzzy_match" -> "模糊搜索+精排,适用于字典查询等需要模糊匹配的场景";
            case "passthrough" -> "原样透传,适用于库存查询、订单状态等不需要后处理的场景";
            default -> type;
        };
    }

    /** 创建/更新工具的请求体 */
    public record CreateToolRequest(
        String name,
        String description,
        String parameters,
        String processorType,
        String processorConfig,
        String dataSourceId,
        String pathTemplate,
        String responseMapping,
        Boolean enabled,
        String ownerId
    ) {}
}
