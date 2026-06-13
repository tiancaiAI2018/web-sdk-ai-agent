package com.example.agent.admin;

import com.example.agent.audit.AuditLog;
import com.example.agent.audit.AuditLogRepository;
import com.example.agent.auth.AppCredentials;
import com.example.agent.auth.AppCredentialsRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;

import java.time.Instant;
import java.util.*;

/**
 * 管理端 API。路径前缀 /admin/api/ 由 JwtAuthFilter 校验 admin scope。
 */
@RestController
@RequestMapping("/admin/api")
@Tag(name = "05 管理端", description = "第三方应用管理 + 审计日志(需 admin scope JWT)")
@SecurityRequirement(name = "bearer-jwt")
public class AdminController {

    private final AppCredentialsRepository appRepo;
    private final AuditLogRepository auditRepo;

    public AdminController(AppCredentialsRepository appRepo, AuditLogRepository auditRepo) {
        this.appRepo = appRepo;
        this.auditRepo = auditRepo;
    }

    // ====================================================================
    // 第三方应用管理
    // ====================================================================

    @GetMapping("/apps")
    @Operation(summary = "列出所有第三方应用")
    public List<Map<String, Object>> listApps() {
        return appRepo.findAll().stream().map(app -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("clientId", app.getId());
            m.put("name", app.getName());
            m.put("allowedOrigin", app.getAllowedOrigin());
            m.put("enabled", app.isEnabled());
            m.put("createdAt", app.getCreatedAt());
            return m;
        }).toList();
    }

    @PostMapping("/apps")
    @Operation(summary = "创建第三方应用", description = "生成 clientId + clientSecret,返回明文 secret(仅此一次)")
    public ResponseEntity<Map<String, Object>> createApp(@RequestBody CreateAppRequest body) {
        if (body == null || body.name() == null || body.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "name is required"));
        }
        String clientId = body.clientId() != null ? body.clientId() : "app-" + UUID.randomUUID().toString().substring(0, 8);
        if (appRepo.existsById(clientId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "clientId already exists"));
        }
        String rawSecret = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().substring(0, 8);

        AppCredentials app = new AppCredentials();
        app.setId(clientId);
        app.setName(body.name());
        app.setSecretHash(BCrypt.hashpw(rawSecret, BCrypt.gensalt(10)));
        app.setAllowedOrigin(body.allowedOrigin());
        app.setEnabled(true);
        app.setCreatedAt(Instant.now());
        appRepo.save(app);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("clientId", clientId);
        result.put("clientSecret", rawSecret); // 明文仅此一次返回
        result.put("name", app.getName());
        result.put("enabled", app.isEnabled());
        result.put("warning", "clientSecret 仅此一次返回,请妥善保存!");
        return ResponseEntity.ok(result);
    }

    @PutMapping("/apps/{clientId}")
    @Operation(summary = "更新第三方应用", description = "更新名称、启用状态、允许的来源")
    public ResponseEntity<Map<String, Object>> updateApp(
            @PathVariable String clientId,
            @RequestBody UpdateAppRequest body) {
        Optional<AppCredentials> opt = appRepo.findById(clientId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "app not found"));
        }
        AppCredentials app = opt.get();
        if (body.name() != null) app.setName(body.name());
        if (body.enabled() != null) app.setEnabled(body.enabled());
        if (body.allowedOrigin() != null) app.setAllowedOrigin(body.allowedOrigin());
        appRepo.save(app);
        return ResponseEntity.ok(Map.of("clientId", app.getId(), "name", app.getName(), "enabled", app.isEnabled()));
    }

    @DeleteMapping("/apps/{clientId}")
    @Operation(summary = "删除第三方应用")
    public ResponseEntity<Map<String, Object>> deleteApp(@PathVariable String clientId) {
        if (!appRepo.existsById(clientId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "app not found"));
        }
        appRepo.deleteById(clientId);
        return ResponseEntity.ok(Map.of("deleted", clientId));
    }

    @PostMapping("/apps/{clientId}/rotate-secret")
    @Operation(summary = "轮换 clientSecret", description = "生成新 secret,旧 secret 立即失效")
    public ResponseEntity<Map<String, Object>> rotateSecret(@PathVariable String clientId) {
        Optional<AppCredentials> opt = appRepo.findById(clientId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "app not found"));
        }
        AppCredentials app = opt.get();
        String rawSecret = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().substring(0, 8);
        app.setSecretHash(BCrypt.hashpw(rawSecret, BCrypt.gensalt(10)));
        appRepo.save(app);
        return ResponseEntity.ok(Map.of(
            "clientId", clientId,
            "clientSecret", rawSecret,
            "warning", "旧 secret 已失效,新 secret 仅此一次返回!"
        ));
    }

    // ====================================================================
    // 审计日志
    // ====================================================================

    @GetMapping("/audit")
    @Operation(summary = "最近 N 条审计记录")
    public List<AuditLog> recentAudit(
        @RequestParam(defaultValue = "20") int limit) {
        int capped = Math.max(1, Math.min(limit, 200));
        return auditRepo.findAll(PageRequest.of(0, capped, Sort.by(Sort.Direction.DESC, "id")))
            .getContent();
    }

    // ====================================================================
    // 请求 DTO
    // ====================================================================

    public record CreateAppRequest(
        String clientId,
        String name,
        String allowedOrigin
    ) {}

    public record UpdateAppRequest(
        String name,
        Boolean enabled,
        String allowedOrigin
    ) {}
}
