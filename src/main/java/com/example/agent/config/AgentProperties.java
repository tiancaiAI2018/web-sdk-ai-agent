package com.example.agent.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "agentscope")
public class AgentProperties {

    private Anthropic anthropic = new Anthropic();
    private Session session = new Session();
    private Agent agent = new Agent();

    public Anthropic getAnthropic() { return anthropic; }
    public void setAnthropic(Anthropic anthropic) { this.anthropic = anthropic; }
    public Session getSession() { return session; }
    public void setSession(Session session) { this.session = session; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }

    public static class Anthropic {
        /** API key. Leave empty to read from ANTHROPIC_API_KEY env var. */
        private String apiKey;
        /** Model name passed to the Anthropic-compatible endpoint. */
        private String modelName = "MiniMax-M3";
        /**
         * Full base URL of the Anthropic-compatible gateway, including any
         * path prefix (e.g. https://api.minimaxi.com/anthropic).
         */
        private String baseUrl = "https://api.minimaxi.com/anthropic";

        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getModelName() { return modelName; }
        public void setModelName(String modelName) { this.modelName = modelName; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    }

    public static class Session {
        private String storageDir;
        public String getStorageDir() { return storageDir; }
        public void setStorageDir(String storageDir) { this.storageDir = storageDir; }
    }

    public static class Agent {
        private String name = "Assistant";
        private String sysPrompt = "You are a helpful assistant.";
        private int maxIters = 10;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSysPrompt() { return sysPrompt; }
        public void setSysPrompt(String sysPrompt) { this.sysPrompt = sysPrompt; }
        public int getMaxIters() { return maxIters; }
        public void setMaxIters(int maxIters) { this.maxIters = maxIters; }
    }
}
