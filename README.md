# simple-ai-agent

最小可用的 Spring Boot 3 + AgentScope Java AI agent 服务。

- `POST /chat/{sessionId}` — 阻塞式请求 / 响应
- `POST /chat/{sessionId}/stream` — Server-Sent Events 流式输出

会话短期记忆走 `InMemoryMemory`，长期持久化走 `JsonSession`（按 `sessionId` 分目录，根目录默认 `~/.agentscope/sessions/`）。

底层模型为 `AnthropicChatModel`，指向 Anthropic 兼容网关，默认 `https://api.minimaxi.com/anthropic` + 模型 `MiniMax-M3`。

## 环境要求

- JDK 17+
- Maven 3.9+
- 一个 Anthropic 兼容网关的 API key

## 启动

**一次性**设置 API key（Windows，写入用户级环境变量，重启后仍生效）：

```bash
setx ANTHROPIC_API_KEY "sk-xxxxxxxxxxxxxxxx"
```

或者只为当前 shell 临时设置（bash）：

```bash
export ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxxxxx
```

然后启动服务：

```bash
mvn spring-boot:run
```

服务监听 `http://localhost:8080`。

> `application.yml` 里只放 `${ANTHROPIC_API_KEY:}` 占位符，**真实 key 永远不入库**。
> `setx` 写的是 Windows 用户级注册表，已经在跑的进程看不到这个变量——**改完 key 必须重启** Spring Boot 才能生效。

## API

### 阻塞调用

```bash
curl -X POST http://localhost:8080/chat/demo \
     -H 'Content-Type: application/json' \
     -d '{"message":"你好，你是谁？"}'
```

返回：

```json
{ "sessionId": "demo", "reply": "我是 Assistant, ..." }
```

### 流式调用（SSE）

```bash
curl -N -X POST http://localhost:8080/chat/demo/stream \
     -H 'Content-Type: application/json' \
     -d '{"message":"讲个短笑话"}'
```

每个 `event:` 帧对应一个 reasoning 增量（默认 incremental deltas），最后一帧 `id: last` 标记结束。

### 多轮对话

同一个 `sessionId` 复用历史；换一个 `sessionId` 就是新会话。手工清空某个会话：

```bash
rm -rf ~/.agentscope/sessions/demo
```

跨进程持久化：`Ctrl+C` 停掉服务后再次 `mvn spring-boot:run`，用同一个 `sessionId` 再问，模型应能记得之前的对话。

## 配置项

`src/main/resources/application.yml`：

| 配置项                              | 默认值                                  | 说明                                            |
|-------------------------------------|----------------------------------------|-------------------------------------------------|
| `agentscope.anthropic.api-key`      | （env `ANTHROPIC_API_KEY`）             | 网关 API key                                    |
| `agentscope.anthropic.model-name`   | `MiniMax-M3`                           | 模型名                                          |
| `agentscope.anthropic.base-url`     | `https://api.minimaxi.com/anthropic`   | Anthropic 兼容网关的 baseUrl                    |
| `agentscope.session.storage-dir`    | `~/.agentscope/sessions`               | JsonSession 根目录                              |
| `agentscope.agent.name`             | `Assistant`                            | Agent 名字                                      |
| `agentscope.agent.sys-prompt`       | helpful assistant                      | 系统 prompt                                     |
| `agentscope.agent.max-iters`        | `10`                                   | 单轮最大 ReAct 迭代次数                         |

## 项目结构

```
src/main/java/com/example/agent
├── AgentApplication.java          Spring Boot 入口
├── config/
│   ├── AgentProperties.java       @ConfigurationProperties("agentscope")
│   └── AgentConfig.java           AnthropicChatModel + JsonSession Bean
├── session/
│   └── SessionManager.java        每 sessionId 一个 ReActAgent，save/load
└── controller/
    └── ChatController.java        /chat 和 /chat/{id}/stream 两个端点
```

## 本版本未涉及

按"最简"原则刻意省略：

- 工具 / 函数调用（`toolkit`、`@Tool`）
- MCP server、多 agent
- 长期记忆（Mem0 / ReMe）
- 鉴权 / 限流
- 完整的错误处理、重试、可观测性
