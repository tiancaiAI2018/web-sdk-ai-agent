package com.example.agent.config;

import io.agentscope.core.model.AnthropicChatModel;
import io.agentscope.core.model.ChatModelBase;
import io.agentscope.core.model.OpenAIChatModel;
import io.agentscope.core.session.JsonSession;
import io.agentscope.core.session.Session;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class AgentConfig {
    private static final Logger LOGGER = LoggerFactory.getLogger(AgentConfig.class);

    private final AgentProperties props;

    public AgentConfig(AgentProperties props) {
        this.props = props;
    }

    /**
     * AnthropicChatModel pointed at an Anthropic-compatible gateway.
     * API key is resolved from agentscope.anthropic.api-key first, then
     * the ANTHROPIC_API_KEY env var as a fallback.
     */
    @Bean
    @ConditionalOnProperty(name = "agentscope.anthropic.enable", havingValue = "true")
    public ChatModelBase anthropicChatModel() {
        String apiKey = resolveApiKey(props.getAnthropic().getApiKey());
        LOGGER.info("[AgentConfig] AnthropicChatModel: apiKey={}, modelName={}, baseUrl={}",
            apiKey, props.getAnthropic().getModelName(), props.getAnthropic().getBaseUrl());
        return AnthropicChatModel.builder()
            .apiKey(apiKey)
            .modelName(props.getAnthropic().getModelName())
            .baseUrl(props.getAnthropic().getBaseUrl())
            // stream defaults to true on AnthropicChatModel — no need to set it
            .build();
    }

    @Bean
    @ConditionalOnProperty(name = "agentscope.openai.enable", havingValue = "true")
    public ChatModelBase openaiChatModel() {
        String apiKey = resolveApiKey(props.getOpenai().getApiKey());
        LOGGER.info("[AgentConfig] OpenAIChatModel: apiKey={}, modelName={}, baseUrl={}",
            apiKey, props.getOpenai().getModelName(), props.getOpenai().getBaseUrl());
        return OpenAIChatModel.builder()
                .apiKey(apiKey)
                .modelName(props.getOpenai().getModelName())
                .baseUrl(props.getOpenai().getBaseUrl())
                // stream defaults to true on AnthropicChatModel — no need to set it
                .build();
    }

    /**
     * Filesystem-backed Session. JsonSession stores one directory per sessionId
     * under {storage-dir}/{sessionId}/.
     */
    @Bean
    public Session jsonSession() {
        Path storage = Paths.get(props.getSession().getStorageDir());
        return new JsonSession(storage);
    }

    private String resolveApiKey(String key) {
        if (key != null && !key.isBlank()) {
            return key;
        }
        key = System.getenv("ANTHROPIC_API_KEY");
        if (key != null && !key.isBlank()) {
            return key;
        }
        throw new IllegalStateException(
            "agentscope.anthropic.api-key (or ANTHROPIC_API_KEY env var) is required");
    }
}
