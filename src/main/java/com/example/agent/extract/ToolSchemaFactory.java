package com.example.agent.extract;

import io.agentscope.core.model.ToolSchema;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 把 {@link RegisteredTool} 翻译成 AgentScope 的 {@link ToolSchema}。
 *
 * <p>v3 重构:跟旧 FormToolFactory 不同——**不再做 schema 形态翻译**,直接
 * 透传(parameters 是完整 JSON Schema,AgentScope 内部直接消费)。
 */
@Component
public class ToolSchemaFactory {

    /**
     * 给定 RegisteredTool → AgentScope ToolSchema。
     * parameters 是已校验过的完整 JSON Schema Map。
     */
    public ToolSchema toToolSchema(RegisteredTool tool) {
        Map<String, Object> parameters = tool.parameters();
        return ToolSchema.builder()
            .name(tool.name())
            .description(tool.description() == null || tool.description().isBlank()
                ? tool.name()  // description 空时用 name 兜底(应该不会到这里,DescriptionGuard 允许空)
                : tool.description())
            .parameters(parameters)
            .strict(tool.strict())
            .build();
    }

    /**
     * 给 LLM 的"工具模式"系统提示。我方写死前缀/后缀,中间列工具摘要(只含 name + 一句话
     * 描述),**不**展开 parameters(防 description 注入通过参数提示)。
     */
    public String buildSysPromptWithTools(List<RegisteredTool> tools) {
        if (tools.isEmpty()) {
            // 不挂任何工具的纯聊天模式,直接返默认 prompt
            return null;  // null 表示用 AgentProperties.agent.sysPrompt 默认值
        }

        StringBuilder toolsSection = new StringBuilder();
        for (RegisteredTool t : tools) {
            String desc = t.description() == null ? "" : t.description();
            if (desc.length() > 120) desc = desc.substring(0, 117) + "...";
            toolsSection.append("- ").append(t.name()).append(": ").append(desc).append('\n');
        }

        return """
            You are a helpful assistant. The user is on a third-party site using our SDK.

            The following tools are available for THIS message (registered by the 3rd-party app, not by you):

            %s
            Rules:
            1. Use a tool ONLY when the user has provided all the information it needs.
            2. If the user pastes a blob, extract what you can and ASK for missing info before calling a tool.
            3. When calling a tool, pass arguments matching the tool's declared schema. Do not invent fields.
            4. You may call a tool multiple times if the conversation requires it.
            5. If a tool is inappropriate, do not call it. If none of the tools fit, just respond in natural language.
            """.formatted(toolsSection);
    }
}
