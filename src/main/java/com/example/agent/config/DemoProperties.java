package com.example.agent.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "agentscope.demo")
public class DemoProperties {

    private String clientId = "demo-app";
    private String clientSecret = "demo-secret";
    private int secretBcryptCost = 10;

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
    public int getSecretBcryptCost() { return secretBcryptCost; }
    public void setSecretBcryptCost(int secretBcryptCost) { this.secretBcryptCost = secretBcryptCost; }
}
