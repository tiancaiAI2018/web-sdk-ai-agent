package com.example.agent.auth;

import com.example.agent.config.JwtProperties;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Jwts.SIG;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

/**
 * 持有 RSA 密钥对(启动时从 PEM 文件读,缺失则生成并落盘),
 * 签发 + 验签 RS256 JWT,以及把公钥转成 JWK 格式供 JWKS 端点。
 */
@Service
public class TokenService {

    private static final Logger log = LoggerFactory.getLogger(TokenService.class);

    private final JwtProperties props;
    private PrivateKey privateKey;
    private PublicKey publicKey;

    public TokenService(JwtProperties props) {
        this.props = props;
    }

    @PostConstruct
    void init() throws Exception {
        Path priv = Path.of(props.getPrivateKeyPath());
        Path pub = Path.of(props.getPublicKeyPath());
        if (Files.exists(priv) && Files.exists(pub)) {
            this.privateKey = readPrivate(priv);
            this.publicKey = readPublic(pub);
            log.info("[TokenService] loaded RSA keypair from {}", priv);
        } else {
            Files.createDirectories(priv.getParent());
            KeyPair kp = generate();
            writePem(priv, "PRIVATE KEY", kp.getPrivate().getEncoded());
            writePem(pub, "PUBLIC KEY", kp.getPublic().getEncoded());
            this.privateKey = kp.getPrivate();
            this.publicKey = kp.getPublic();
            log.info("[TokenService] generated new RSA-2048 keypair at {}", priv);
        }
    }

    /** 签发结果,包含 JWT 本身 + 唯一标识 jti(供 audit 关联)。 */
    public record Issued(String jwt, String jti) {}

    /** 默认 scope。新接入应用若无显式声明,先按 chat:read 起步。 */
    public static final String DEFAULT_SCOPE = "chat:read";

    /** 签发 token。subject = clientId,jti = UUID,scope = DEFAULT_SCOPE。 */
    public Issued issue(String clientId) {
        return issue(clientId, DEFAULT_SCOPE);
    }

    /** 带 scope 的签发(留口子给后续 admin 接口用)。 */
    public Issued issue(String clientId, String scope) {
        Instant now = Instant.now();
        String jti = java.util.UUID.randomUUID().toString();
        String jwt = Jwts.builder()
            .subject(clientId)
            .id(jti)
            .issuer(props.getIssuer())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(props.getTtlSeconds())))
            .claim("scope", scope)
            .signWith(privateKey, SIG.RS256)
            .compact();
        return new Issued(jwt, jti);
    }

    /** 验签结果,返回 clientId + jti + scope,供 filter 写 audit 用。 */
    public record Verified(String clientId, String jti, String scope) {}

    /** 验签并返回三元组。失败抛 JwtException。 */
    public Verified verify(String token) throws JwtException {
        var claims = Jwts.parser()
            .verifyWith(publicKey)
            .requireIssuer(props.getIssuer())
            .build()
            .parseSignedClaims(token)
            .getPayload();
        String scope = claims.get("scope", String.class);
        return new Verified(claims.getSubject(), claims.getId(), scope == null ? DEFAULT_SCOPE : scope);
    }

    /** 把公钥转成 JWK 字符串(供 JWKS 端点嵌入)。 */
    public Map<String, Object> publicJwk() {
        RSAPublicKey rsa = (RSAPublicKey) publicKey;
        Base64.Encoder b64 = Base64.getUrlEncoder().withoutPadding();
        return Map.of(
            "kty", "RSA",
            "use", "sig",
            "alg", "RS256",
            "n", b64.encodeToString(rsa.getModulus().toByteArray()),
            "e", b64.encodeToString(rsa.getPublicExponent().toByteArray())
        );
    }

    public long ttlSeconds() {
        return props.getTtlSeconds();
    }

    // ---- helpers ----

    private static KeyPair generate() throws NoSuchAlgorithmException {
        KeyPairGenerator g = KeyPairGenerator.getInstance("RSA");
        g.initialize(2048);
        return g.generateKeyPair();
    }

    private static void writePem(Path path, String label, byte[] der) throws IOException {
        String b64 = Base64.getMimeEncoder(64, "\n".getBytes()).encodeToString(der);
        Files.writeString(path, "-----BEGIN " + label + "-----\n" + b64 + "\n-----END " + label + "-----\n");
    }

    private static PrivateKey readPrivate(Path path) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] der = Base64.getDecoder().decode(stripPem(Files.readString(path)));
        return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
    }

    private static PublicKey readPublic(Path path) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] der = Base64.getDecoder().decode(stripPem(Files.readString(path)));
        return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(der));
    }

    private static String stripPem(String pem) {
        return pem.replaceAll("-----[A-Z ]+-----", "").replaceAll("\\s+", "");
    }
}
