package com.example.agent.extract;

/**
 * Controller 内部使用:从 SSE Event 流里捕获到的"模型即将调用 submit_form 工具"事件。
 *
 * <p>AgentScope 在 TOOL_SUSPENDED 时,会返回的 Msg 包含 ToolUseBlock(工具名 + 参数 Map),
 * Controller 从 Event.getMessage().getContentBlocks(ToolUseBlock.class) 抓取后,转成
 * 浏览器可解析的 JSON 推 SSE(event: tool_call)。
 */
public record ToolCallEvent(String toolName, String argsJson) {}
