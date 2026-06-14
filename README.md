# simple-ai-agent

最小可用的 Spring Boot 3 + AgentScope Java AI agent 服务,带第三方前端 SDK 接入能力。

---

## AGENTS.md

This file provides guidance to the AI agent when working with code in this repository.

### 工作准则

1. **先想后写**:动手前明确假设;有多种解读时列出来,不要默默挑一种。
2. **最简优先**:只解决当前问题,不加未要求的功能、抽象、容错。200 行能用 50 行写就重写。
3. **精准改动**:只改必须改的;不动相邻代码/注释/格式;匹配已有风格;自己造成的孤立引用要清理,已有的死代码不动。
4. **目标驱动**:把任务转化为可验证目标,多步任务先列 `1. [步骤] → 验证: [检查]` 再执行。

### 架构不变量(不要破坏)

`ChatModelBase`(单例) + `SessionManager`(每 sid 一个 ReActAgent,基于 Toolkit + JsonSession) + `JwtAuthFilter`(唯一鉴权入口 + namespace 强制) + `ToolRegistry`(v3:第三方注册工具,30 分钟 TTL)。

1. **sessionId 必须以 `{clientId}:` 开头**。`JwtAuthFilter` 强制,违规 400 + 审计 `CROSS_TENANT_ACCESS`。
2. **API key 永远从 `ANTHROPIC_API_KEY` 环境变量来**。yml 是 `${ANTHROPIC_API_KEY:}` 空默认,写死即事故。
3. **`ReActAgent` 不能跨 stream 复用**。AgentScope 1.0.12 `Toolkit` build() 后不可改,**每次 stream 都 new 一个**。记忆靠 `JsonSession` 持久化保留。
4. **`JwtAuthFilter` 是唯一鉴权入口**。新增需鉴权端点必须经过它,只扩展白名单前缀数组;不要绕开。
5. **`description` 走 `DescriptionGuard` 黑名单**。工具 description 直接进 sysPrompt,任一注入特征即拒。

### 关键入口

| 想找 | 入口 |
|---|---|
| 路由总表 | `controller/ChatController.java` + `controller/ToolController.java` + `auth/AuthController.java` + `admin/AdminController.java`(都有 `@Tag`) |
| namespace 强制 | `auth/JwtAuthFilter.java:88-100` |
| stream 帧格式 | `controller/ChatController.java:120-175`(`toSse`) |
| 工具 schema 校验 | `extract/RegisteredTool.java` + `extract/DescriptionGuard.java` |
| ReActAgent 构造 | `session/SessionManager.java:84-112`(`build`) |
| AgentScope 真实类名 | `jar tf ~/.m2/repository/io/agentscope/agentscope/1.0.12/agentscope-1.0.12.jar \| grep -E "ChatModel\|Event\|StreamOptions"` |

### 关键 Bean

| 单例 | 出处 | 谁注入它 |
|---|---|---|
| `ChatModelBase` (Anthropic 或 OpenAI) | `AgentConfig`(`@ConditionalOnProperty enable`) | `SessionManager` |
| `Session`(`JsonSession`) | `AgentConfig` | `SessionManager` |
| `ToolRegistry`(按 sid 索引) | `extract/`(直接 `@Component`) | `SessionManager`, `ToolController`, `ToolRegistryCleaner` |
| `ToolSchemaFactory` | `extract/` | `SessionManager`(每次 build 新 Toolkit 时用) |

`SessionManager.build` 是唯一造 `ReActAgent` 的地方。`ChatController` 写薄,只做参数校验 + SSE 翻译。

### 构建与运行

Maven 路径(Windows Git Bash 不在 PATH):`D:/dev-tools/apache-maven-3.9.14/bin/mvn`

```bash
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B -DskipTests package   # 编译打 jar
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B spring-boot:run        # 启动(改完代码需手动重启)
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B test                   # 跑全部测试
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B -Dtest=ClassName test  # 跑单个测试类
rm -rf data/ ~/.agentscope/                                           # 重置 demo 数据
```

- API key 设置:`setx ANTHROPIC_API_KEY "sk-xxx"`(只影响新进程,改完必须重启 Spring Boot)
- 本地覆盖用 `application-local.yml`(gitignored),不要改 `application.yml` 里的 key 占位符
- AgentScope 文档不全,类签名不确定时 `jar tf` + `javap -public` 比猜快

### 代码风格与约定

- 中文注释、中文 commit message
- `ChatController` 写薄,只做参数校验 + SSE 翻译;业务逻辑往上挪到 `SessionManager`
- WebFlux 项目,不要用 Servlet API(`HttpServletRequest` 不可用,用 `ServerHttpRequest`)
- `ReActAgent` 默认 `checkRunning=true` 拒绝并发,这是预期的,不要关掉
- `@EnableScheduling` + `ToolRegistryCleaner` 每 5 分钟清 30 分钟无活动的 sid

### 非显而易见的坑

- 基类叫 `ChatModelBase`,不是 `ChatModel`;`Event` / `StreamOptions` 在 `io.agentscope.core.agent.*` 子包
- `com.anthropic:anthropic-java` 不被 Spring Boot BOM 管理,`<version>` 不能省
- `JsonSession` 把 `sessionId` 当目录名,白名单 `[A-Za-z0-9_\-:]{1,128}`
- 流式端点是 `POST` 不是 `GET`,body 传消息;HTTP header 是 ISO-8859-1 不能放中文
- `sessionId` 经 `encodeURIComponent` 后 `:` → `%3A`,filter 必须 `URLDecoder.decode` 再做 namespace 比对
- 第一次请求某个 session 很慢(10-60s),懒构造,不要加"预热"
- 跨域 POST + 自定义 header 必触发 OPTIONS 预检,鉴权 filter 必须放行 OPTIONS

---

## 能力一览

**AI 对话**
- `POST /chat/{sessionId}` — 阻塞式请求 / 响应
- `POST /chat/{sessionId}/stream` — Server-Sent Events 流式输出(`body.activeTools` 可选,激活已注册工具,模型调用时多发 `event: tool_call` 帧)
- 会话短期记忆走 `InMemoryMemory`,长期持久化走 `JsonSession`(按 `sessionId` 分目录,根目录默认 `~/.agentscope/sessions/`)
- 底层模型为 `AnthropicChatModel` / `OpenAIChatModel`,独立开关,默认 `https://api.minimaxi.com/anthropic` + 模型 `MiniMax-M3`

**第三方工具注册(v3)**
- `POST /chat/{sid}/tools/register` — 全量替换该 sid 的工具集(JSON Schema)
- `POST /chat/{sid}/tools/unregister` — 删指定 name,空 = 全清
- `GET  /chat/{sid}/tools` — 列表元信息(不返 parameters,防 schema 反复拉)
- 内存版 `ToolRegistry`,按 `sid` 索引;30 分钟无活动自动清理,定时器同步清 `SessionManager` 里对应 agent
- description 走 `DescriptionGuard` 黑名单(prompt injection 拦截)

**第三方接入(v2)**
- JWT RS256 鉴权(`/auth/token` 双 grant: `client_credentials` + `refresh_token`)
- Session 强制命名空间:`sessionId` 必须以 `{clientId}:` 开头,跨租户 400 + 审计
- 内存 token-bucket 限流(每 clientId 60 容量 / 0.2 token/秒,超限 429)
- H2 持久化第三方应用凭据 + 审计日志
- 浏览器 SDK(`static/sdk/ai-agent-sdk.js`,UMD bundle)
- Swagger UI:`http://localhost:8080/swagger-ui.html`
- 审计查询:`GET /admin/audit`(需 Bearer JWT)

## 环境要求

- JDK 17+
- Maven 3.9+
- 一个 Anthropic 兼容网关的 API key
- (可选)Node 18+,仅当跑第三方 mock 后端时需要

## 启动

**一次性**设置 API key(Windows,写入用户级环境变量,重启后仍生效):

```bash
setx ANTHROPIC_API_KEY "sk-xxxxxxxxxxxxxxxx"
```

或者只为当前 shell 临时设置(bash):

```bash
export ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxxxxx
```

然后启动服务:

```bash
mvn spring-boot:run
```

服务监听 `http://localhost:8080`。

> `application.yml` 里只放 `${ANTHROPIC_API_KEY:}` 占位符,**真实 key 永远不入库**。
> `setx` 写的是 Windows 用户级注册表,已经在跑的进程看不到这个变量——**改完 key 必须重启** Spring Boot 才能生效。

## 三进程联调(v2 demo)

跑通完整链路需要三个进程并行:

| 端口 | 谁 | 启动 |
|---|---|---|
| 8080 | 我方后端(Spring Boot) | `mvn spring-boot:run` |
| 7000 | 第三方后端 mock(Node,持 secret) | `cd examples && npm install && node third-party-mock.js` |
| 5500 | 静态 demo 页(Python) | `cd src/main/resources/static/examples && python -m http.server 5500` |

或者用 JetBrains IDEA 63342 等 live server 起 `static/examples/host-page.html`,跳过 5500。

---

## AI 对话 API

### 阻塞调用

```bash
curl -X POST http://localhost:8080/chat/demo-app:demo-session \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer <token>' \
     -d '{"message":"你好,你是谁?"}'
```

> **v2 起 sessionId 必须以 `{clientId}:` 开头**(`demo-app:` 是预置 clientId),否则 400。

返回:

```json
{ "sessionId": "demo-app:demo-session", "reply": "我是 Assistant, ..." }
```

### 流式调用(SSE)

```bash
curl -N -X POST http://localhost:8080/chat/demo-app:demo-session/stream \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer <token>' \
     -d '{"message":"讲个短笑话"}'
```

每个 `event:` 帧对应一个 reasoning 增量(默认 incremental deltas),最后一帧 `id: last` 标记结束。

### 多轮对话

同一个 `sessionId` 复用历史;换一个 `sessionId` 就是新会话。手工清空某个会话:

```bash
rm -rf ~/.agentscope/sessions/demo-app:demo-session
```

跨进程持久化:`Ctrl+C` 停掉服务后再次 `mvn spring-boot:run`,用同一个 `sessionId` 再问,模型应能记得之前的对话。

---

## 鉴权 API

### 1. 换 access_token(首次)

```bash
curl -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "demo-app",
    "client_secret": "demo-secret"
  }'
```

返回:

```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 300,
  "refresh_token": "XymSesze-LP9R9HNktNPKLJY7CMWhFDt7zW1Z5xIpkM",
  "scope": "chat:read"
}
```

### 2. 静默续期(refresh_token)

```bash
curl -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "XymSesze-..."
  }'
```

> 每次成功续期,**旧 refresh_token 立即撤销并签发新的**(轮换)。
> 第二次用同一个旧 refresh_token 调,返 401 `invalid_grant`。

### 3. JWKS 公钥

```bash
curl http://localhost:8080/.well-known/jwks.json
```

### 4. 审计查询(需 Bearer)

```bash
curl "http://localhost:8080/admin/audit?limit=20" \
  -H "Authorization: Bearer <token>"
```

返回最近 N 条审计(`AUTH_OK` / `AUTH_FAIL` / `AUTH_RATE_LIMIT` / `CHAT_START` / `CHAT_DONE` / `CROSS_TENANT_ACCESS`)。

---

## 浏览器 SDK 用法

```html
<script src="http://your-host/sdk/ai-agent-sdk.js"></script>
<script>
  // SDK 不持 secret,只接受一个换 token 的钩子
  const agent = AIAgent.init({
    endpoint: 'https://your-host',
    getAccessToken: async () => {
      // 调第三方自家后端换 token(secret 在第三方后端 ↔ 我方之间)
      const r = await fetch('https://third-party.com/api/ai-token', { method: 'POST' });
      const j = await r.json();
      return { accessToken: j.accessToken, refreshToken: j.refreshToken };
    }
  });

  agent.stream({
    sessionId: 'demo-app:user-123',  // 必须以 {clientId}: 开头
    message: '你好',
    onChunk: ev => console.log(ev.data),
    onDone:  () => console.log('done'),
    onError: e => console.error(e)
  });
</script>
```

**关键不变量**:`clientSecret` 永远在第三方后端 ↔ 我方后端 之间,**绝不出现在浏览器**。SDK 内部自动续期(自动解析 JWT 的 `exp` claim,提前 30s 重调 `getAccessToken`)。

详见 `static/sdk/ai-agent-sdk.js` 顶部 JSDoc。

---

## 端到端验证(curl 完整流程)

```bash
# 1) 拿 token
RESP=$(curl -s -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"grant_type":"client_credentials","client_id":"demo-app","client_secret":"demo-secret"}')
TOK=$(echo "$RESP" | python -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
RT=$(echo "$RESP"  | python -c "import sys,json;print(json.load(sys.stdin)['refresh_token'])")

# 2) 流式调用
curl -N -X POST "http://localhost:8080/chat/demo-app:user-1/stream" \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"message":"hi"}' --max-time 30

# 3) Session 跨租户(应 400)
curl -i -X POST "http://localhost:8080/chat/other-app:user-1/stream" \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"message":"hi"}'

# 4) Refresh 续期
curl -s -X POST http://localhost:8080/auth/token \
  -H 'Content-Type: application/json' \
  -d "{\"grant_type\":\"refresh_token\",\"refresh_token\":\"$RT\"}" | head -c 200
```

---

## 配置项

`src/main/resources/application.yml`:

| 配置项 | 默认值 | 说明 |
|---|---|---|
| `agentscope.anthropic.api-key` | (env `ANTHROPIC_API_KEY`) | 网关 API key |
| `agentscope.anthropic.model-name` | `MiniMax-M3` | 模型名 |
| `agentscope.anthropic.base-url` | `https://api.minimaxi.com/anthropic` | Anthropic 兼容网关的 baseUrl |
| `agentscope.session.storage-dir` | `~/.agentscope/sessions` | JsonSession 根目录 |
| `agentscope.agent.name` | `Assistant` | Agent 名字 |
| `agentscope.agent.sys-prompt` | helpful assistant | 系统 prompt |
| `agentscope.agent.max-iters` | `10` | 单轮最大 ReAct 迭代次数 |
| `agentscope.jwt.private-key-path` | `~/.agentscope/jwt-private.pem` | RSA 私钥(启动时若不存在自动生成 2048 位) |
| `agentscope.jwt.public-key-path` | `~/.agentscope/jwt-public.pem` | RSA 公钥 |
| `agentscope.jwt.issuer` | `simple-ai-agent` | JWT iss 声明 |
| `agentscope.jwt.ttl-seconds` | `300` | access_token 有效期(5 分钟) |
| `agentscope.jwt.refresh-ttl-seconds` | `604800` | refresh_token 有效期(7 天) |
| `agentscope.cors.allowed-origins` | `localhost:5500`, `127.0.0.1:5500`, `localhost:63342` | 跨域白名单 |
| `agentscope.demo.client-id` | `demo-app` | 启动时预置的第三方应用 id(便于 demo) |
| `agentscope.demo.client-secret` | `demo-secret` | 启动时预置的 secret(**生产必须改**,启动会强 WARN) |
| `agentscope.ratelimit.capacity` | `60` | 每 clientId 桶容量(瞬时 burst 上限) |
| `agentscope.ratelimit.refill-per-sec` | `0.2` | 每秒补充的 token 数(0.2 = 12/分钟) |

---

## 项目结构

```
src/main/java/com/example/agent/
├── AgentApplication.java          Spring Boot 入口(@EnableScheduling:v3 ToolRegistryCleaner)
├── config/                        配置与基础 Bean
│   ├── AgentProperties.java       agentscope.* 段(anthropic + openai + session + agent)
│   ├── AgentConfig.java           ChatModelBase(anthropic/openai 各自 @ConditionalOnProperty) + JsonSession Bean
│   ├── JwtProperties.java         agentscope.jwt 段
│   ├── CorsProperties.java        agentscope.cors 段
│   ├── DemoProperties.java        agentscope.demo 段(预置凭据)
│   ├── WebConfig.java             CORS WebFilter
│   └── OpenApiConfig.java         Swagger / springdoc 配置
├── auth/                          鉴权(新增 v1,v2 加深)
│   ├── AuthController.java        POST /auth/token(OAuth 双 grant)+ JWKS
│   ├── TokenService.java          RSA 密钥加载 + JWT 签发 / 验签(jti + scope)
│   ├── JwtAuthFilter.java         WebFilter 鉴权 + session namespace 校验
│   ├── AppCredentials.java        JPA 实体(third_party_app 表)
│   ├── AppCredentialsRepository.java
│   ├── RefreshToken.java          JPA 实体(refresh_token 表,v2 新增)
│   ├── RefreshTokenRepository.java
│   ├── RefreshTokenService.java   签发 / 轮换 / 撤销(v2 新增)
│   ├── DemoAppSeeder.java         启动时预置 demo-app + 默认 secret 警告
│   ├── AuthPrincipal.java         从 JWT 提取的 principal(clientId, jti, scope)
│   └── dto/                       TokenRequest, TokenResponse, JwksResponse
├── ratelimit/                     限流(v2 新增)
│   ├── TokenBucket.java           单桶(capacity + refillPerSec)
│   ├── TokenBucketRegistry.java   按 clientId / IP 维护桶
│   └── RateLimitFilter.java       WebFilter,超限 429 + Retry-After
├── audit/                         审计
│   ├── AuditLog.java              JPA 实体(audit_log 表,带 jti/ip 列)
│   ├── AuditLogRepository.java
│   └── AuditService.java          logAuthSuccess/Fail/RateLimit, logChatStart/Done, logCrossTenantAccess,
│                                  logToolRegister/Unregister, logFormSubmit(args 只存 hash)
├── admin/                         审计查询(v1 新增)
│   └── AdminController.java       GET /admin/audit
├── extract/                       v3 第三方工具注册
│   ├── RegisteredTool.java        record + Draft;name 白名单 + 浅层 JSON Schema 校验
│   ├── DescriptionGuard.java      prompt injection 6 条黑名单正则(MVP,接真实第三方前必须升级)
│   ├── ToolSchemaFactory.java     RegisteredTool → AgentScope ToolSchema
│   ├── ToolRegistry.java          按 sid 索引,30 分钟 TTL,get 触发 lastUsedAt
│   └── ToolRegistryCleaner.java   @Scheduled 5 分钟跑一次,过期 sid 整条清,同步 SessionManager.evict
├── session/
│   └── SessionManager.java        每 sessionId 一次 build(因 AgentScope 1.0.12 toolkit 不可改)
└── controller/
    ├── ChatController.java        /chat 和 /chat/{id}/stream(需鉴权;支持 activeTools 激活)
    └── ToolController.java        /chat/{sid}/tools/{register,unregister,list}(v3 新增)

src/main/resources/
├── application.yml
├── static/
│   ├── sdk/ai-agent-sdk.js        浏览器 UMD SDK
│   └── examples/host-page.html    第三方接入 demo 页
└── agentscope-java-docs/          (gitignore)AgentScope 官方文档本地镜像

examples/                          第三方后端 mock
├── third-party-mock.js            Node Express,7000 端口,持 secret
├── package.json
└── package-lock.json
```

---

## 架构

### 一次"第三方网页发消息"的端到端流

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐         ┌─────────────┐
│ 3rd-party   │  (1)    │  第三方自家后端   │  (2)    │   AI Agent   │  (3)    │ Anthropic 兼容│
│  浏览器      │ ──────► │  (持有 secret)   │ ──────► │   服务        │ ──────► │   网关       │
│  (无 secret) │         │  (代理 /auth)    │ ◄────── │              │ ◄────── │              │
└──────┬──────┘         └──────────────────┘         └────────┬────┘         └─────────────┘
       │                                                       │
       │  (4) Authorization: Bearer <access_token>            │
       │ ─────────────────────────────────────────────────────►
       │ ◄───── SSE 帧流 ─────────────────────────────────────
```

### 后端分层

```
config/AgentConfig       → 构建并暴露 AnthropicChatModel + JsonSession 两个 Bean
        ↓ 注入
session/SessionManager   → ConcurrentHashMap<sessionId, ReActAgent>,负责 save/load 生命周期
        ↓ 注入
controller/ChatController → 两个 HTTP 端点,不含业务逻辑

auth/TokenService        → 持 RSA 密钥对,签发 / 验签 JWT
auth/RefreshTokenService → refresh_token 签发 / 轮换 / 撤销
auth/JwtAuthFilter       → 最高优先级 WebFilter:OPTIONS / 静态 / swagger 白名单,
                           Bearer JWT 验签,session namespace 校验,挂 principal
ratelimit/RateLimitFilter → 次高优先级:按 clientId(/chat/**)或 IP(/auth/token)限流
audit/AuditService       → 所有鉴权 / 对话事件统一入库
```

### 边界约束

- **`AgentConfig` 是模型唯一的构造点。** 单例 `ChatModelBase` Bean 被所有 per-session 的 `ReActAgent` 复用。
- **`SessionManager` 是 `ReActAgent` 唯一的构造点。** 每个 `sessionId` 一个 agent,首次请求时懒加载。短期记忆 `InMemoryMemory`,持久化 `JsonSession`(路径 `agentscope.session.storage-dir/{sessionId}/`)。
- **`ChatController` 故意写薄。** 只做入参校验、调用 manager、把结果映射成 DTO/SSE。一旦业务逻辑开始渗到这里,就该往上挪到 `SessionManager`。
- **`JwtAuthFilter` 是唯一鉴权入口。** 所有要鉴权的端点必须经过它(`/auth/token` 和 `/.well-known/jwks.json` 白名单)。新增需要鉴权的端点时,把路径加进白名单前缀数组,不要绕过。
- **跨 tenant 访问 session 必 400。** sessionId 必须以 `{clientId}:` 开头,这是 namespace 不变量,由 filter 强制。

### 并发不变量(不要破坏)

`ReActAgent` 默认 `checkRunning=true`,所以同一个 session 拒绝并发调用——这是预期的安全行为。需要并发请在调用方加锁或队列,**不要**悄悄把 `checkRunning` 关掉。

### 持久化生命周期

- 首次请求某个 sessionId → `loadIfExists(session, sessionId)`(同时创建并缓存 agent)
- 每次阻塞响应后 / 每次流正常完成后 → `saveTo(session, sessionId)`
- `@PreDestroy` 时 best-effort flush 所有缓存的 agent

### Refresh token 轮换

`grant_type=refresh_token` 成功时,旧 token 立即 `revoked=true`,新 token 入库。这样:
- 旧 token 泄露后无法再用(轮换把它废掉)
- 数据库被读走时,旧 token 已被覆盖(只有一个有效)

---

## 开发命令

Maven 路径:`D:/dev-tools/apache-maven-3.9.14/bin/mvn`(Git Bash 默认不在 PATH 里,要么用全路径,要么 `export PATH=...:$PATH`)。

```bash
# 编译打 jar(首次冷启动需要下依赖,~5 min)
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B -DskipTests package

# 启动服务(spring-boot-devtools 未引入,改完代码需手动重启)
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B spring-boot:run

# 跑全部测试
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B test

# 跑单个测试类
"D:/dev-tools/apache-maven-3.9.14/bin/mvn" -B -Dtest=ClassName test

# 调试:看 agentscope JAR 里的真实类名
jar tf ~/.m2/repository/io/agentscope/agentscope/1.0.12/agentscope-1.0.12.jar | grep -E "ChatModel|Event|StreamOptions"

# 调试:看某个类的方法签名(先 jar xf 抽出来)
cd /tmp && jar xf ~/.m2/repository/io/agentscope/agentscope/1.0.12/agentscope-1.0.12.jar io/agentscope/core/ReActAgent.class
javap -public io/agentscope/core/ReActAgent.class

# 重置 demo 数据
rm -rf data/ ~/.agentscope/
```

API key 设置(一次性,写入 Windows 用户级注册表):

```bash
setx ANTHROPIC_API_KEY "sk-xxxxxxxxxxxxxxxx"
```

注意 `setx` 只影响**新**进程——已经跑着的 `mvn spring-boot:run` 看不到,必须重启 Spring Boot 才生效。

---

## 踩过的坑(非显而易见)

AgentScope 官方文档没明说、但代码里已经验证过的事实:

1. **基类叫 `ChatModelBase`,不是 `ChatModel`。** 文档里 `*ChatModel.builder()` 那种参数声明用了 `ChatModel model` 形参,容易让人照 Spring AI 的命名去 import 错的类。真实类在 `io.agentscope.core.model.ChatModelBase`。
2. **`Event` 和 `StreamOptions` 在 `io.agentscope.core.agent.*` 子包,不在根 `io.agentscope.core`。** 文档用裸名引用,没给 import。写错包路径 IDE 缓存可能不报,编译时才炸。
3. **`com.anthropic:anthropic-java` 不被 Spring Boot BOM 管理。** 不能省略 `<version>`,当前钉在 `2.26.0`(`<properties>` 里)。升版本时用 `dependency:get` 在 `/tmp` 目录里查 latest。
4. **`JsonSession` 把 `sessionId` 直接当目录名用。** `SessionManager` 用 `[A-Za-z0-9_\-:]{1,128}` 正则做白名单,违规直接 `IllegalArgumentException`。v2 起 `:` 是 namespace 分隔符,合法字符;`/` 和 `..` 仍禁止。
5. **每个 session 的第一次请求很慢(10–60s)。** 懒构造 ReActAgent + 第一次调远端 model 都按需发生。不要加启动期"预热",除非用户明确要。
6. **流式端点是 `POST` 不是 `GET`。** body 传 `{ "message": "..." }`。HTTP header 是 ISO-8859-1,**不能放中文/emoji**——消息必须走 body。
7. **API key 只能从 `ANTHROPIC_API_KEY` 环境变量来。** yml 里是 `${ANTHROPIC_API_KEY:}` 空默认。要是看到 yml 里出现硬编码 key,那是一次安全事故——立刻回滚到 env var 并轮换泄露的 key。
8. **HTTP header 限 ASCII(ISO-8859-1),装不下中文。** 业务载荷永远走 body;header 只放元数据(认证、内容协商、追踪 ID)。
9. **跨域 POST + 任何自定义 header 必触发 OPTIONS 预检。** 鉴权 filter 必须放行 OPTIONS,不能拦截(CorsWebFilter 才会回 CORS 头)。否则浏览器直接报"preflight 不通过"。
10. **`sessionId` 经浏览器 `encodeURIComponent` 后是 `:` → `%3A`。** 后端 filter 必须 `URLDecoder.decode` 后再做 namespace 比对,否则所有合法 sessionId 都被误判跨租户。
11. **`EventSource` 自动重连和自定义 token 续期不兼容。** v2 SDK 用 `fetch + ReadableStream` 自己解析 SSE 帧,可以完全控制生命周期。
12. **Servlet 风格的 `HttpServletRequest` 在 WebFlux 里没有。** 拿 IP 用 `ServerHttpRequest.getRemoteAddress()`,或者自己写 `extractIp` 工具方法。

---

## 本版本已做 / 留给下一轮

### v2 已做(P0 + P1)

- ✅ Secret 永不出浏览器(OAuth 风格 + SDK `getAccessToken` 钩子)
- ✅ Session 强制 namespace,跨租户 400 + 审计
- ✅ 内存 token-bucket 限流
- ✅ Refresh token + 静默续期 + 轮换
- ✅ 审计加 jti / IP / 事件类型
- ✅ demo 弱 secret 启动强 WARN
- ✅ Swagger UI(`/swagger-ui.html`)
- ✅ `/admin/audit` 审计查询

### v3 已做(本分支)

- ✅ 多模型支持:`AnthropicChatModel` / `OpenAIChatModel` 独立 `@ConditionalOnProperty` 开关
- ✅ 第三方工具 schema 注入:`POST /chat/{sid}/tools/register` + `ToolRegistry` + 30 分钟 TTL 清理
- ✅ 流式 `event: tool_call` 帧:`ChatController.toSse` 在模型调工具时多推 `{"tool","args"}` 给 SDK
- ✅ 工具名白名单 + description 黑名单:`RegisteredTool.NAME_PATTERN` + `DescriptionGuard`
- ✅ Markdown 渲染 + XSS 防护:浏览器 SDK 引入 marked + DOMPurify(`static/sdk/vendor/`)
- ✅ 多轮"智能录单"基础:`SessionManager.stream(sid, text, activeTools)` + `JsonSession` 记忆持久化
- ✅ 工具注册表 30 分钟 TTL + 同步 `SessionManager.evict` 控内存
- ✅ 审计 `TOOL_REGISTER` / `TOOL_UNREGISTER` / `FORM_SUBMIT`(args 只存 hash)

### 留给下一轮(P2 / P3 / P4)

- ❌ Token 撤销(jti 黑名单)
- ❌ 安全响应头(HSTS / nosniff / frame-ancestors)
- ❌ JWKS `kid` + 密钥轮换
- ❌ `scope` 细粒度(只读 / 对话 / 管理)
- ❌ `/admin/audit` 加 admin role
- ❌ 跨用户身份传递(`sub_user` claim + 签名)
- ❌ HMAC body 完整性
- ❌ HTTPS 部署文档
- ❌ SDK 端超时 / 重试
- ❌ refresh_token 存哈希(目前存明文,数据库泄露就全完)
- ❌ 限流按 (clientId, IP) 细分
- ❌ 工具 / 函数调用(`toolkit` / `@Tool`)
- ❌ MCP server / 多 agent
- ❌ 长期记忆(Mem0 / ReMe)

---

## 会话存储布局

```
~/.agentscope/sessions/
└── {sessionId}/
    ├── memory_messages.jsonl    # 一行一个 Msg,JSONL 格式
    └── ...                       # 其它组件 state 文件按 key 分
```

`JsonSession` 第一次 save 时自动建目录。手工清空:`rm -rf ~/.agentscope/sessions/{sessionId}`。注意:内存里的 agent 缓存**不会**因为磁盘改动而失效,要让两者重新同步得重启服务。

## 第三方应用凭据 / 审计数据库布局

`./data/agentscope.mv.db`(H2 文件库,MySQL 模式):

```sql
-- 第三方应用凭据
third_party_app(id, name, secret_hash, allowed_origin, enabled, created_at)

-- refresh_token
refresh_token(id, client_id, jti, expires_at, revoked, created_at, last_used_at)

-- 审计
audit_log(id, client_id, session_id, event_type, jti, ip, detail, created_at)
```

启动时若检测到 `agentscope.demo.client-secret=demo-secret`,会输出 5 行强 WARN,但**仍然 seed**(便于开发)。生产部署必须显式覆盖。

---

## 参考文档

`agentscope-java-docs/` 是 `https://java.agentscope.io/` 的本地镜像,已在 `.gitignore` 里(不随项目入库)。需要时直接打开:

- `功能使用手册/en/quickstart/agent.md` — `ReActAgent.builder()` 形态、`toolkit`、hooks
- `功能使用手册/en/quickstart/installation.md` — 必须 / 可选依赖矩阵
- `功能使用手册/en/task/model.md` — 各 `*ChatModel` builder,`baseUrl` 用法
- `功能使用手册/en/task/memory.md` — `InMemoryMemory` vs `AutoContextMemory`
- `功能使用手册/en/task/session.md` — `JsonSession` / `InMemorySession` / 数据迁移
- `功能使用手册/en/task/streaming.md` — `Flux<Event>`、`StreamOptions`、SSE 模板
- `BEST-PRACTICES.md` — 提炼过的 24 章综合指南,迷路时第一站

类路径或方法签名不确定时,`jar tf` + `javap -public` 比再编一遍快得多。
