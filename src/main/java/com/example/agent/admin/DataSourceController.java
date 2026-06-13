package com.example.agent.admin;

import com.example.agent.datasource.DataSourceEntity;
import com.example.agent.datasource.DataSourceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * 数据源管理 API。路径前缀 /admin/api/ 由 JwtAuthFilter 校验 admin scope。
 *
 * 字典绑定管理已移除,因为 ServerTool 实体现在直接包含 dataSourceId、pathTemplate、
 * responseMapping 等字段,不再需要单独的 DictSourceBinding 表。
 */
@RestController
@RequestMapping("/admin/api")
@Tag(name = "06 数据源管理", description = "第三方数据源(需 admin scope JWT)")
@SecurityRequirement(name = "bearer-jwt")
public class DataSourceController {

    private final DataSourceRepository dsRepo;

    public DataSourceController(DataSourceRepository dsRepo) {
        this.dsRepo = dsRepo;
    }

    @GetMapping("/datasources")
    @Operation(summary = "列出所有数据源")
    public List<DataSourceEntity> listDataSources() {
        return dsRepo.findAll();
    }

    @PostMapping("/datasources")
    @Operation(summary = "创建数据源")
    public ResponseEntity<DataSourceEntity> createDataSource(@RequestBody CreateDataSourceRequest body) {
        if (body.name() == null || body.url() == null || body.ownerId() == null) {
            return ResponseEntity.badRequest().build();
        }
        DataSourceEntity ds = new DataSourceEntity();
        ds.setId(UUID.randomUUID().toString());
        ds.setName(body.name());
        ds.setType(body.type() != null ? body.type() : "rest");
        ds.setUrl(body.url());
        ds.setAuthType(body.authType());
        ds.setAuthConfig(body.authConfig());
        ds.setHeaders(body.headers());
        ds.setOwnerId(body.ownerId());
        ds.setEnabled(true);
        ds = dsRepo.save(ds);
        return ResponseEntity.ok(ds);
    }

    @PutMapping("/datasources/{id}")
    @Operation(summary = "更新数据源")
    public ResponseEntity<DataSourceEntity> updateDataSource(@PathVariable String id, @RequestBody CreateDataSourceRequest body) {
        Optional<DataSourceEntity> opt = dsRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        DataSourceEntity ds = opt.get();
        if (body.name() != null) ds.setName(body.name());
        if (body.type() != null) ds.setType(body.type());
        if (body.url() != null) ds.setUrl(body.url());
        if (body.authType() != null) ds.setAuthType(body.authType());
        if (body.authConfig() != null) ds.setAuthConfig(body.authConfig());
        if (body.headers() != null) ds.setHeaders(body.headers());
        if (body.ownerId() != null) ds.setOwnerId(body.ownerId());
        if (body.enabled() != null) ds.setEnabled(body.enabled());
        ds.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(dsRepo.save(ds));
    }

    @DeleteMapping("/datasources/{id}")
    @Operation(summary = "删除数据源")
    public ResponseEntity<Map<String, String>> deleteDataSource(@PathVariable String id) {
        if (!dsRepo.existsById(id)) return ResponseEntity.notFound().build();
        dsRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    @PostMapping("/datasources/{id}/health-check")
    @Operation(summary = "健康检查数据源")
    public ResponseEntity<Map<String, Object>> healthCheck(@PathVariable String id) {
        Optional<DataSourceEntity> opt = dsRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        DataSourceEntity ds = opt.get();

        String status = "ok";
        try {
            var client = java.net.http.HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(5))
                .build();
            var request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(ds.getUrl() + "/health"))
                .timeout(java.time.Duration.ofSeconds(5))
                .GET()
                .build();
            var response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            status = response.statusCode() < 500 ? "ok" : "fail";
        } catch (Exception e) {
            status = "fail";
        }

        ds.setHealthStatus(status);
        ds.setLastCheckAt(Instant.now());
        dsRepo.save(ds);

        return ResponseEntity.ok(Map.of("id", id, "status", status));
    }

    public record CreateDataSourceRequest(
        String name, String type, String url,
        String authType, String authConfig, String headers,
        String ownerId, Boolean enabled
    ) {}
}
