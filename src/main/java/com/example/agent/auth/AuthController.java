package com.example.agent.auth;

import com.example.agent.audit.AuditService;
import com.example.agent.auth.dto.AuthRequest;
import com.example.agent.auth.dto.AuthResponse;
import com.example.agent.auth.dto.JwksResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
public class AuthController {

    private final TokenService tokens;
    private final AppCredentialsRepository repo;
    private final AuditService audit;

    public AuthController(TokenService tokens, AppCredentialsRepository repo, AuditService audit) {
        this.tokens = tokens;
        this.repo = repo;
        this.audit = audit;
    }

    /**
     * 用 clientId + clientSecret 换取短期 access_token。
     */
    @PostMapping("/auth/token")
    public Mono<ResponseEntity<?>> token(@Valid @RequestBody AuthRequest req) {
        ResponseEntity<?> denied = ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("invalid_client"));
        return Mono.justOrEmpty(repo.findById(req.clientId()))
            .filter(AppCredentials::isEnabled)
            .filter(row -> BCrypt.checkpw(req.clientSecret(), row.getSecretHash()))
            .<ResponseEntity<?>>map(row -> {
                String jwt = tokens.issue(row.getId());
                audit.logAuthSuccess(row.getId(), "n/a");
                return ResponseEntity.ok(new AuthResponse(jwt, "Bearer", tokens.ttlSeconds()));
            })
            .defaultIfEmpty(denied);
    }

    /**
     * 暴露公钥 JWK。SDK 不强制验签(信任 HTTPS),保留以便后续开启 SDK 端验签。
     */
    @GetMapping("/.well-known/jwks.json")
    public JwksResponse jwks() {
        return new JwksResponse(List.of(tokens.publicJwk()));
    }

    public record ErrorResponse(String error) {}
}
