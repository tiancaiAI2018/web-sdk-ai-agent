package com.example.agent.auth;

import com.example.agent.audit.AuditService;
import com.example.agent.auth.dto.JwksResponse;
import com.example.agent.auth.dto.TokenRequest;
import com.example.agent.auth.dto.TokenResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@Tag(name = "01 鉴权", description = "OAuth 2.0 风格 token 签发 + JWKS")
public class AuthController {

    private final TokenService tokens;
    private final AppCredentialsRepository repo;
    private final RefreshTokenService refreshSvc;
    private final AuditService audit;

    public AuthController(TokenService tokens, AppCredentialsRepository repo,
                          RefreshTokenService refreshSvc, AuditService audit) {
        this.tokens = tokens;
        this.repo = repo;
        this.refreshSvc = refreshSvc;
        this.audit = audit;
    }

    /**
     * OAuth 2.0 双 grant:
     *   - client_credentials: 第三方后端用 clientId + clientSecret 首次换
     *   - refresh_token:      第三方后端用 refresh_token 静默续期
     */
    @PostMapping("/auth/token")
    @Operation(
        summary = "用 client_credentials / refresh_token 换 access_token",
        description = "成功后返 access_token (5 分钟) + refresh_token (7 天)。"
                   + "grant_type=refresh_token 成功会撤销旧 refresh_token(轮换)。"
    )
    @ApiResponse(responseCode = "200", description = "签发成功",
        content = @Content(schema = @Schema(implementation = TokenResponse.class)))
    @ApiResponse(responseCode = "400", description = "grant_type 未知 / 字段缺失")
    @ApiResponse(responseCode = "401", description = "凭据错 / refresh_token 无效/过期/已撤销")
    public Mono<ResponseEntity<TokenResponse>> token(@RequestBody TokenRequest req,
                                                    ServerHttpRequest httpReq) {
        String ip = AuditService.extractIp(httpReq);
        if (req == null || req.grantType() == null) {
            return Mono.just(badRequest("invalid_request", ip));
        }
        return switch (req.grantType()) {
            case TokenRequest.CLIENT_CREDENTIALS -> handleClientCredentials(req, ip);
            case TokenRequest.REFRESH_TOKEN      -> handleRefreshToken(req, ip);
            default                              -> Mono.just(badRequest("unsupported_grant_type", ip));
        };
    }

    private Mono<ResponseEntity<TokenResponse>> handleClientCredentials(TokenRequest req, String ip) {
        if (req.clientId() == null || req.clientSecret() == null) {
            return Mono.just(badRequest("invalid_request", ip));
        }
        return Mono.justOrEmpty(repo.findById(req.clientId()))
            .filter(AppCredentials::isEnabled)
            .filter(row -> BCrypt.checkpw(req.clientSecret(), row.getSecretHash()))
            .<ResponseEntity<TokenResponse>>map(row -> {
                TokenService.Issued issued = tokens.issue(row.getId());
                RefreshToken rt = refreshSvc.issue(row.getId(), issued.jti());
                audit.logAuthSuccess(row.getId(), issued.jti(), ip);
                return ResponseEntity.ok(TokenResponse.ok(
                    issued.jwt(),
                    tokens.ttlSeconds(),
                    rt.getId(),
                    TokenService.DEFAULT_SCOPE
                ));
            })
            .defaultIfEmpty(unauthorized("invalid_client", req.clientId(), ip));
    }

    private Mono<ResponseEntity<TokenResponse>> handleRefreshToken(TokenRequest req, String ip) {
        if (req.refreshToken() == null) {
            return Mono.just(badRequest("invalid_request", ip));
        }
        return Mono.justOrEmpty(refreshSvc.findUsable(req.refreshToken()))
            .<ResponseEntity<TokenResponse>>map(rt -> {
                TokenService.Issued issued = tokens.issue(rt.getClientId());
                RefreshToken newRt = refreshSvc.rotate(rt, issued.jti());
                audit.logAuthSuccess(rt.getClientId(), issued.jti(), ip);
                return ResponseEntity.ok(TokenResponse.ok(
                    issued.jwt(),
                    tokens.ttlSeconds(),
                    newRt.getId(),
                    TokenService.DEFAULT_SCOPE
                ));
            })
            .defaultIfEmpty(unauthorized("invalid_grant", null, ip));
    }

    /**
     * 暴露公钥 JWK。SDK 不强制验签(信任 HTTPS),保留以便后续开启 SDK 端验签。
     */
    @GetMapping("/.well-known/jwks.json")
    @Operation(summary = "JWKS 公钥端点", description = "返回用于验签 RS256 token 的公钥 JWK 列表。")
    public JwksResponse jwks() {
        return new JwksResponse(List.of(tokens.publicJwk()));
    }

    private static ResponseEntity<TokenResponse> badRequest(String code, String ip) {
        // 简单记一行,便于排查 bad_request 攻击
        return ResponseEntity.badRequest().body(TokenResponse.error(code));
    }

    private static ResponseEntity<TokenResponse> unauthorized(String code, String clientId, String ip) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(TokenResponse.error(code));
    }
}
