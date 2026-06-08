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

## 架构

三层依赖，每层只关心一件事：

```
config/AgentConfig       → 构建并暴露 AnthropicChatModel + JsonSession 两个 Bean
        ↓ 注入
session/SessionManager   → ConcurrentHashMap<sessionId, ReActAgent>，负责 save/load 生命周期
        ↓ 注入
controller/ChatController → 两个 HTTP 端点，不含业务逻辑
```

边界约束：

- **`AgentConfig` 是模型唯一的构造点。** 单例 `ChatModelBase` Bean 被所有 per-session 的 `ReActAgent` 复用。
- **`SessionManager` 是 `ReActAgent` 唯一的构造点。** 每个 `sessionId` 一个 agent，首次请求时懒加载。短期记忆 `InMemoryMemory`，持久化 `JsonSession`（路径 `agentscope.session.storage-dir/{sessionId}/`）。
- **`ChatController` 故意写薄。** 只做入参校验、调用 manager、把结果映射成 DTO/SSE。一旦业务逻辑开始渗到这里，就该往上挪到 `SessionManager`。

**并发不变量（不要破坏）：** `ReActAgent` 默认 `checkRunning=true`，所以同一个 session 拒绝并发调用——这是预期的安全行为。需要并发请在调用方加锁或队列，**不要**悄悄把 `checkRunning` 关掉。

**持久化生命周期：**
- 首次请求某个 sessionId → `loadIfExists(session, sessionId)`（同时创建并缓存 agent）
- 每次阻塞响应后 / 每次流正常完成后 → `saveTo(session, sessionId)`
- `@PreDestroy` 时 best-effort flush 所有缓存的 agent

## 开发命令

Maven 路径：`D:/dev-tools/apache-maven-3.9.14/bin/mvn`（Git Bash 默认不在 PATH 里，要么用全路径，要么 `export PATH=...:$PATH`）。

```bash
# 编译打 jar（首次冷启动需要下依赖，~5 min）
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B -DskipTests package

# 启动服务（spring-boot-devtools 未引入，改完代码需手动重启）
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B spring-boot:run

# 跑全部测试
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B test

# 跑单个测试类
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B -Dtest=ClassName test

# 调试：看 agentscope JAR 里的真实类名
jar tf ~/.m2/repository/io/agentscope/agentscope/1.0.12/agentscope-1.0.12.jar | grep -E "ChatModel|Event|StreamOptions"

# 调试：看某个类的方法签名（先 jar xf 抽出来）
cd /tmp && jar xf ~/.m2/repository/io/agentscope/agentscope/1.0.12/agentscope-1.0.12.jar io/agentscope/core/ReActAgent.class
javap -public io/agentscope/core/ReActAgent.class
```

API key 设置（一次性，写入 Windows 用户级注册表）：

```bash
setx ANTHROPIC_API_KEY "sk-xxxxxxxxxxxxxxxx"
```

注意 `setx` 只影响**新**进程——已经跑着的 `mvn spring-boot:run` 看不到，必须重启 Spring Boot 才生效。

## 踩过的坑（非显而易见）

AgentScope 官方文档没明说、但代码里已经验证过的事实：

1. **基类叫 `ChatModelBase`，不是 `ChatModel`。** 文档里 `*ChatModel.builder()` 那种参数声明用了 `ChatModel model` 形参，容易让人照 Spring AI 的命名去 import 错的类。真实类在 `io.agentscope.core.model.ChatModelBase`。
2. **`Event` 和 `StreamOptions` 在 `io.agentscope.core.agent.*` 子包，不在根 `io.agentscope.core`。** 文档用裸名引用，没给 import。写错包路径 IDE 缓存可能不报，编译时才炸。
3. **`com.anthropic:anthropic-java` 不被 Spring Boot BOM 管理。** 不能省略 `<version>`，当前钉在 `2.26.0`（`<properties>` 里）。升版本时用 `dependency:get` 在 `/tmp` 目录里查 latest。
4. **`JsonSession` 把 `sessionId` 直接当目录名用。** `SessionManager` 用 `[A-Za-z0-9_-]{1,128}` 正则做白名单，违规直接 `IllegalArgumentException`。不要为了"灵活"放掉这层——`task/session.md` "Security Note" 明确警告过路径穿越（cookie / query string 里塞 `..`）。
5. **每个 session 的第一次请求很慢（10–60s）。** 懒构造 ReActAgent + 第一次调远端 model 都按需发生。不要加启动期"预热"，除非用户明确要。
6. **流式端点是 `POST` 不是 `GET`。** body 传 `{ "message": "..." }`，也支持 `X-User-Message` header 兜底。GET 带 body 在某些客户端是坑。
7. **API key 只能从 `ANTHROPIC_API_KEY` 环境变量来。** yml 里是 `${ANTHROPIC_API_KEY:}` 空默认。要是看到 yml 里出现硬编码 key，那是一次安全事故——立刻回滚到 env var 并轮换泄露的 key。

## 会话存储布局

```
~/.agentscope/sessions/
└── {sessionId}/
    ├── memory_messages.jsonl    # 一行一个 Msg，JSONL 格式
    └── ...                       # 其它组件 state 文件按 key 分
```

`JsonSession` 第一次 save 时自动建目录。手工清空：`rm -rf ~/.agentscope/sessions/{sessionId}`。注意：内存里的 agent 缓存**不会**因为磁盘改动而失效，要让两者重新同步得重启服务。

## 参考文档

`agentscope-java-docs/` 是 `https://java.agentscope.io/` 的本地镜像，已在 `.gitignore` 里（不随项目入库）。需要时直接打开：

- `功能使用手册/en/quickstart/agent.md` — `ReActAgent.builder()` 形态、`toolkit`、hooks
- `功能使用手册/en/quickstart/installation.md` — 必须 / 可选依赖矩阵
- `功能使用手册/en/task/model.md` — 各 `*ChatModel` builder，`baseUrl` 用法
- `功能使用手册/en/task/memory.md` — `InMemoryMemory` vs `AutoContextMemory`
- `功能使用手册/en/task/session.md` — `JsonSession` / `InMemorySession` / 数据迁移
- `功能使用手册/en/task/streaming.md` — `Flux<Event>`、`StreamOptions`、SSE 模板
- `BEST-PRACTICES.md` — 提炼过的 24 章综合指南，迷路时第一站

类路径或方法签名不确定时，`jar tf` + `javap -public` 比再编一遍快得多。

