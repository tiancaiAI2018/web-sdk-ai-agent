# 消息与事件


消息（Message）与事件（Event）是 AgentScope 中两种基础数据结构。


消息 — 智能体间通信与持久化的基本单元。每个 Msg 代表一个完整的对话轮次，存储在上下文中并在智能体之间传递。


事件 — 前端交互与流式传输的基本单元。事件携带增量进度更新（文本 token、工具调用片段、权限请求等），驱动实时界面和人工介入工作流。


单次 call 调用产生的事件序列最终汇聚成恰好一条 assistant Msg，这保证了完整的消息状态始终可以从事件流中还原。


## 消息


Msg（位于 io.agentscope.core.message）代表对话中的一个轮次——用户输入、智能体回复或系统指令，内容以有序的类型化块（ContentBlock）列表表示。


> 💡 **Tip**
>
> 一条 assistant 消息对应智能体一次完整的 call 周期（反复推理和执行，直到产出最终回复）。


### 结构


## Msg 类的核心字段（getter）如下：


| 方法 | 类型 | 说明 | getId() | String |
| --- | --- | --- | --- | --- |
| 唯一消息标识符 | getName() | String | 发送方名称（可空） | getRole() |
| MsgRole | USER / ASSISTANT / SYSTEM / TOOL | getContent() | List<ContentBlock> | 有序内容块列表（不可变） |
| getMetadata() | Map<String, Object> | 任意键值元数据 | getTimestamp() | String |
| 创建时间（yyyy-MM-dd HH:mm:ss.SSS） | getUsage() | ChatUsage | Token 用量（仅 assistant 消息） | getGenerateReason() |
| GenerateReason | 退出原因：MODEL_STOP / TOOL_SUSPENDED / REASONING_STOP_REQUESTED / ACTING_STOP_REQUESTED / INTERRUPTED / MAX_ITERATIONS | 内容块 | 消息内容由类型化的块组成，每种块代表一类独立信息。块类位于 io.agentscope.core.message： | 块类型 |
| 说明 | 允许出现在 | TextBlock | 纯文本内容 | USER、ASSISTANT、SYSTEM |
| DataBlock | 二进制数据（图片、音频、视频），通过 base64 或 URL；统一替代旧的 ImageBlock/AudioBlock/VideoBlock | USER、ASSISTANT | ImageBlock / AudioBlock / VideoBlock | 旧版具体多媒体块（仍兼容，新代码建议用 DataBlock） |
| USER | ThinkingBlock | 模型推理过程（思维链） | ASSISTANT | ToolUseBlock |
| 工具调用，包含 id / name / input / state（ToolCallState） | ASSISTANT | ToolResultBlock | 工具执行结果，包含 state（ToolResultState） | ASSISTANT |
| HintBlock | 以用户上下文形式注入循环的指令 | ASSISTANT |  |  |


> 📝 **Note**
>
> 角色约束在构造时强制执行：USER 消息只能包含 text/data/image/audio/video 块；SYSTEM 消息只能包含 TextBlock；ASSISTANT 消息可包含所有块类型。
> 
> 创建消息
> 
> 按 role 固定的子类提供便捷构造（io.agentscope.core.message.UserMessage / AssistantMessage / SystemMessage / ToolResultMessage）。当 content 是普通字符串时，会自动包装为 TextBlock。


```java
import io.agentscope.core.message.AssistantMessage;
import io.agentscope.core.message.Base64Source;
import io.agentscope.core.message.DataBlock;
import io.agentscope.core.message.SystemMessage;
import io.agentscope.core.message.TextBlock;
import io.agentscope.core.message.UserMessage;

// 用户消息 —— 文本
UserMessage userText = new UserMessage("user", "这张图片里有什么？");

// 多模态用户消息
UserMessage userMulti =
        new UserMessage(
                "user",
                TextBlock.builder().text("描述这张图片：").build(),
                DataBlock.builder()
                        .source(Base64Source.builder()
                                .data("...")
                                .mediaType("image/png")
                                .build())
                        .build());

// 系统消息 —— 仅文本
SystemMessage systemMsg = new SystemMessage("system", "你是一个有用的助手。");

// 助手消息 —— 允许所有块类型
AssistantMessage assistantMsg = new AssistantMessage("agent", "结果如下...");
```


## 需要更多可选字段（metadata、timestamp、usage、generateReason）时使用各子类的 builder()：


UserMessage msg =         UserMessage.builder()                 .name("user")                 .textContent("Hello")                 .build();


### 访问内容


## Msg 提供了一组辅助方法用于提取特定块类型：


| 方法 | 返回值 | getTextContent() |
| --- | --- | --- |
| 所有 TextBlock 的拼接文本（按 \n 连接），无文本块时返回空字符串 | getContentBlocks(Class<T>) | 按类型过滤后的块列表 |
| getFirstContentBlock(Class<T>) | 首个匹配类型的块，无则返回 null | hasContentBlocks(Class<T>) |
| 若存在指定类型的块则返回 true |  |  |


```java
import io.agentscope.core.message.ToolUseBlock;
import io.agentscope.core.message.ToolResultBlock;

// 获取所有文本内容
String text = msg.getTextContent();

// 获取所有工具调用
List<ToolUseBlock> toolCalls = msg.getContentBlocks(ToolUseBlock.class);

// 检查消息是否包含工具结果
if (msg.hasContentBlocks(ToolResultBlock.class)) {
    // ...
}
```


### 事件


事件是消息的流式对应物。智能体执行过程中会持续产出一系列 AgentEvent 对象（位于 io.agentscope.core.event），表示增量进度——文本 token 到达、工具调用逐步构建、结果流式返回。每个事件都是轻量且自包含的。


### 事件生命周期


每个事件都携带 getReplyId()，将其关联到正在构建的消息。在一次回复中，getBlockId() 或 getToolCallId() 标识事件所属的内容块。事件遵循 start → delta → end 模式：


Agent Client Agent Client 推理阶段 TextBlock (blockId) DataBlock (blockId) ToolUseBlock (toolCallId) 执行阶段 ToolResultBlock (toolCallId) AgentStartEvent ModelCallStartEvent TextBlockStartEvent TextBlockDeltaEvent (×N) TextBlockEndEvent DataBlockStartEvent DataBlockDeltaEvent (×N) DataBlockEndEvent ToolCallStartEvent ToolCallDeltaEvent (×N) ToolCallEndEvent ModelCallEndEvent ToolResultStartEvent ToolResultTextDeltaEvent (×N) ToolResultDataDeltaEvent (×N) ToolResultEndEvent AgentEndEvent


同一次回复中的所有事件共享相同的 replyId。在回复内部，用 blockId 关联文本/思考/数据块事件，用 toolCallId 关联工具调用和工具结果事件。


### 事件类型


## 所有事件继承自 AgentEvent（位于 io.agentscope.core.event），提供以下公共方法：


| 方法 | 类型 | 说明 | getId() | String |
| --- | --- | --- | --- | --- |
| 唯一事件标识符 | getCreatedAt() | String | ISO 8601 时间戳 | getType() |
| AgentEventType | 事件类型枚举 | getSource() | String | 事件来源路径。顶层 Agent 为 null；子 Agent 事件为斜杠分隔的路径（如 "main/researcher"），用于区分父子 Agent 事件 |
| 事件按类别分组如下。除特别说明外，每个事件还携带 getReplyId()，关联到正在构建的消息。 |  |  |  |  |


## 生命周期事件

文本流式事件 思考流式事件 数据流式事件 工具调用流式事件 工具结果流式事件 模型调用事件 人工介入事件 子 Agent 事件 从事件流重建消息


事件与消息并非相互独立，而是同一数据的两种视图。streamEvents 产出的事件流可以按 replyId / blockId / toolCallId 聚合还原成完整的 AssistantMessage。这保证了最终消息状态可以仅凭事件流完整还原。


可以参考 agentscope-core 中的 agent/StreamingHook.java 与 agentscope-examples/documentation/.../streaming/AgentEventStreamExample.java，它们演示了用 Reactor 算子按 block 分组并累积内容的标准做法。


```java
import io.agentscope.core.event.AgentEvent;
import io.agentscope.core.event.AgentStartEvent;
import io.agentscope.core.event.AgentEndEvent;
import io.agentscope.core.event.TextBlockDeltaEvent;
import io.agentscope.core.event.ToolCallStartEvent;
import io.agentscope.core.event.ToolResultEndEvent;

StringBuilder accumulated = new StringBuilder();

agent.streamEvents(userMsg)
        .doOnNext(event -> {
            if (event instanceof AgentStartEvent start) {
                System.out.println("[start replyId=" + start.getReplyId() + "]");
            } else if (event instanceof TextBlockDeltaEvent delta) {
                accumulated.append(delta.getDelta());
            } else if (event instanceof ToolCallStartEvent tc) {
                System.out.println("[tool] " + tc.getToolCallName());
            } else if (event instanceof ToolResultEndEvent end) {
                System.out.println("[tool result state=" + end.getState() + "]");
            } else if (event instanceof AgentEndEvent end) {
                System.out.println("\n[end] full text:\n" + accumulated);
            }
        })
        .blockLast();
```


> 💡 **Tip**
>
> 这种设计让部署更加灵活：后端可以通过 SSE 把事件流推给前端，前端在客户端侧重建消息。即使连接中断，从任意检查点重放事件序列也能精确恢复消息状态。
> 
> 示例：流式界面
> 
> 构建流式界面的典型模式（Spring WebFlux SSE 形态可参考 streaming/StreamingWebExample.java）：


```java
import io.agentscope.core.event.AgentEndEvent;
import io.agentscope.core.event.AgentStartEvent;
import io.agentscope.core.event.TextBlockDeltaEvent;
import io.agentscope.core.event.ToolCallStartEvent;
import io.agentscope.core.event.ToolResultEndEvent;
import io.agentscope.core.message.UserMessage;

agent.streamEvents(new UserMessage("user", "帮我修复这个 bug"))
        .doOnNext(event -> {
            if (event instanceof AgentStartEvent start) {
                System.out.println("[start replyId=" + start.getReplyId() + "]");
            } else if (event instanceof TextBlockDeltaEvent delta) {
                System.out.print(delta.getDelta());
            } else if (event instanceof ToolCallStartEvent tc) {
                System.out.println("\n[正在调用 " + tc.getToolCallName() + "...]");
            } else if (event instanceof ToolResultEndEvent end) {
                System.out.println("[工具执行完成：" + end.getState() + "]");
            } else if (event instanceof AgentEndEvent end) {
                System.out.println("\n[完成]");
            }
        })
        .blockLast();
```


| 智能体如何在 ReAct 循环中产出事件和消息 | 上下文 |
| --- | --- |
| 消息如何存储与持久化 | context.html |
