package com.example.agent.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

/**
 * Refresh token 生命周期管理:签发(对应一次新 access_token 的 jti)、查/验/撤销。
 * 轮换策略由 AuthController 调用 issue/rotate 实现,不在本服务内强制。
 */
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;
    private final SecureRandom rng = new SecureRandom();

    /** refresh token 有效期。 */
    @Value("${agentscope.jwt.refresh-ttl-seconds:604800}") // 默认 7 天
    private long refreshTtlSeconds;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    /** 签发新 refresh token,关联到 clientId + 刚签出来的 access_token jti。 */
    @Transactional
    public RefreshToken issue(String clientId, String accessJti) {
        RefreshToken rt = new RefreshToken();
        rt.setId(generateToken());
        rt.setClientId(clientId);
        rt.setJti(accessJti);
        rt.setExpiresAt(Instant.now().plus(Duration.ofSeconds(refreshTtlSeconds)));
        return repo.save(rt);
    }

    /** 查找未过期未撤销的 token。返回 Optional 供调用方决定返 400/401。 */
    @Transactional(readOnly = true)
    public Optional<RefreshToken> findUsable(String tokenId) {
        return repo.findById(tokenId)
            .filter(rt -> !rt.isRevoked())
            .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()));
    }

    /** 标记撤销(轮换或主动吊销)。 */
    @Transactional
    public void revoke(String tokenId) {
        repo.findById(tokenId).ifPresent(rt -> {
            rt.setRevoked(true);
            repo.save(rt);
        });
    }

    /** 轮换的原子操作:旧 token 撤销,新 token 签发。 */
    @Transactional
    public RefreshToken rotate(RefreshToken oldRt, String newAccessJti) {
        oldRt.setRevoked(true);
        repo.save(oldRt);
        return issue(oldRt.getClientId(), newAccessJti);
    }

    public long refreshTtlSeconds() {
        return refreshTtlSeconds;
    }

    /** 32 字节随机 → Base64URL(43 字符)。 */
    private String generateToken() {
        byte[] buf = new byte[32];
        rng.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }
}
