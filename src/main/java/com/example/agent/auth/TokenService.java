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

    /** 签发 token。subject = clientId。 */
    public String issue(String clientId) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(clientId)
            .issuer(props.getIssuer())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(props.getTtlSeconds())))
            .signWith(privateKey, SIG.RS256)
            .compact();
    }

    /** 验签并返回 subject(clientId)。失败抛 JwtException。 */
    public String verify(String token) throws JwtException {
        return Jwts.parser()
            .verifyWith(publicKey)
            .requireIssuer(props.getIssuer())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
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
