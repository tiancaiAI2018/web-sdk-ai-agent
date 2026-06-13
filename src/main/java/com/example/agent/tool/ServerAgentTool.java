package com.example.agent.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.agentscope.core.message.TextBlock;
import io.agentscope.core.message.ToolResultBlock;
import io.agentscope.core.message.ToolUseBlock;
import io.agentscope.core.tool.AgentTool;
import io.agentscope.core.tool.ToolCallParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * 服务端工具的 AgentTool 适配器。
 *
 * 将 ServerToolExecutor 的执行逻辑桥接到 AgentScope 的 AgentTool 接口,
 * 使 LLM 调用服务端工具时由 AgentScope 自动调用 callAsync 执行,
 * 不再走 TOOL_SUSPENDED 流程。
 *
 * 设计思路:
 * - 每个启用的 ServerTool 对应一个 ServerAgentTool 实例
 * - getName/getDescription/getParameters 从 ServerTool 元数据获取
 * - callAsync 委托给 ServerToolExecutor.execute() 执行
 * - 执行结果序列化为 JSON 文本,包装为 ToolResultBlock 返回
 */
public class ServerAgentTool implements AgentTool {

    private static final Logger log = LoggerFactory.getLogger(ServerAgentTool.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final ServerTool toolDef;
    private final ServerToolExecutor executor;

    public ServerAgentTool(ServerTool toolDef, ServerToolExecutor executor) {
        this.toolDef = toolDef;
        this.executor = executor;
    }

    @Override
    public String getName() {
        return toolDef.getName();
    }

    @Override
    public String getDescription() {
        return toolDef.getDescription();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> getParameters() {
        try {
            return MAPPER.readValue(toolDef.getParameters(), Map.class);
        } catch (Exception e) {
            log.warn("[ServerAgentTool] failed to parse parameters for {}: {}", toolDef.getName(), e.getMessage());
            return Map.of();
        }
    }

    /**
     * 异步执行服务端工具。
     *
     * 执行流程:
     * 1. 从 ToolCallParam 提取 LLM 传入的参数
     * 2. 委托 ServerToolExecutor.execute() 执行
     * 3. 将结果序列化为 JSON,包装为 ToolResultBlock
     */
    @Override
    public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
        return Mono.fromCallable(() -> {
            Map<String, Object> args = param.getInput();
            String toolUseId = param.getToolUseBlock().getId();
            String toolName = param.getToolUseBlock().getName();

            log.debug("[ServerAgentTool] executing {} with args={}", toolName, args);

            try {
                Object result = executor.execute(toolName, args != null ? args : Map.of());
                String resultJson = MAPPER.writeValueAsString(result);

                return ToolResultBlock.of(toolUseId, toolName,
                    TextBlock.builder().text(resultJson).build());
            } catch (Exception e) {
                log.warn("[ServerAgentTool] execution failed for {}: {}", toolName, e.getMessage());
                String errorJson = "{\"error\":\"execution_failed\",\"tool\":\"" + toolName + "\",\"message\":\"" + e.getMessage() + "\"}";
                return ToolResultBlock.of(toolUseId, toolName,
                    TextBlock.builder().text(errorJson).build());
            }
        });
    }
}
