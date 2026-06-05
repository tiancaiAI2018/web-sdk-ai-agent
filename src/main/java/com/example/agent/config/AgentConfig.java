package com.example.agent.config;

import io.agentscope.core.model.AnthropicChatModel;
import io.agentscope.core.model.ChatModelBase;
import io.agentscope.core.session.JsonSession;
import io.agentscope.core.session.Session;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class AgentConfig {

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
    public ChatModelBase chatModel() {
        String apiKey = resolveApiKey();
        return AnthropicChatModel.builder()
            .apiKey(apiKey)
            .modelName(props.getAnthropic().getModelName())
            .baseUrl(props.getAnthropic().getBaseUrl())
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

    @PostConstruct
    void logBanner() {
        System.out.printf(
            "[AgentConfig] provider=anthropic, model=%s, baseUrl=%s, sessionStorage=%s, agentName=%s%n",
            props.getAnthropic().getModelName(),
            props.getAnthropic().getBaseUrl(),
            props.getSession().getStorageDir(),
            props.getAgent().getName());
    }

    private String resolveApiKey() {
        String key = props.getAnthropic().getApiKey();
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
