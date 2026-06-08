package com.example.agent.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "agentscope.jwt")
public class JwtProperties {

    /** PEM 私钥路径。启动时若不存在则自动生成 2048-bit RSA 密钥对。 */
    private String privateKeyPath;
    /** PEM 公钥路径(同时供 JWKS 端点消费)。 */
    private String publicKeyPath;
    /** JWT iss 声明。 */
    private String issuer = "simple-ai-agent";
    /** token 有效期(秒)。 */
    private long ttlSeconds = 300;

    public String getPrivateKeyPath() { return privateKeyPath; }
    public void setPrivateKeyPath(String privateKeyPath) { this.privateKeyPath = privateKeyPath; }
    public String getPublicKeyPath() { return publicKeyPath; }
    public void setPublicKeyPath(String publicKeyPath) { this.publicKeyPath = publicKeyPath; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public long getTtlSeconds() { return ttlSeconds; }
    public void setTtlSeconds(long ttlSeconds) { this.ttlSeconds = ttlSeconds; }
}
