package com.example.agent.admin;

import com.example.agent.audit.AuditLog;
import com.example.agent.audit.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin")
@Tag(name = "03 审计", description = "查看登录 / 对话审计记录(需 Bearer JWT)")
@SecurityRequirement(name = "bearer-jwt")
public class AdminController {

    private final AuditLogRepository repo;

    public AdminController(AuditLogRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/audit")
    @Operation(summary = "最近 N 条审计记录",
        description = "按 id 倒序。需先在右上角 Authorize 一次拿到合法 token 即可访问。")
    public List<AuditLog> recent(
        @Parameter(description = "返回条数,默认 20,最大 200")
        @RequestParam(defaultValue = "20") int limit
    ) {
        int capped = Math.max(1, Math.min(limit, 200));
        return repo.findAll(PageRequest.of(0, capped, Sort.by(Sort.Direction.DESC, "id")))
            .getContent();
    }
}
