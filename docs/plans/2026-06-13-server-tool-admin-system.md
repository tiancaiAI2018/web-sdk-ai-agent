# 第三方工具双向认证 + 管理端 + 服务端工具体系 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 dictTool 从 SDK 内置工具改为"第三方通过管理端配置注册到 AI 后端"的服务端工具，同时建设管理端页面和双向认证体系，使第三方系统可安全地注册数据源和工具。

**Architecture:** 三层工具体系 —— SDK 工具(onCall 在浏览器端执行)、服务端工具(onCall 在 AI 后端执行，如字典匹配)、第三方数据源(提供原始数据，匹配算法由平台提供)。管理端页面提供第三方账号管理、工具/数据源配置、审计日志查看。双向认证确保第三方 API 注册和数据源调用都经过鉴权。

**Tech Stack:** Spring Boot WebFlux + JPA(H2 MySQL模式) + JWT + BCrypt + 前端管理页面(纯HTML+CSS+JS)

---

## 核心设计决策

### 1. 工具分类体系

```
┌─────────────────────────────────────────────────────────────┐
│ SDK 工具 (Schema Tool)                                       │
│ - schema 发给 LLM，onCall 在浏览器端执行                      │
│ - 如: submit_form, clear_form, change_skin, create_skin      │
│ - 注册方式: SDK 调 POST /chat/{sid}/tools/register           │
│ - 执行方式: LLM 调用 → SSE 推 tool_call → SDK onCall →       │
│            POST /chat/{sid}/tools/result                      │
├─────────────────────────────────────────────────────────────┤
│ 服务端工具 (Server Tool)                                      │
│ - schema 发给 LLM，onCall 在 AI 后端执行                      │
│ - 如: query_dict (字典匹配)                                   │
│ - 注册方式: 管理端配置 → 存数据库 → 自动注入到每个 session      │
│ - 执行方式: LLM 调用 → 后端直接执行 → 结果返回 LLM             │
│ - 不走 TOOL_SUSPENDED 流程，对 SDK 透明                       │
├─────────────────────────────────────────────────────────────┤
│ 第三方数据源 (Data Source)                                    │
│ - 不直接暴露给 LLM，是服务端工具的数据提供方                    │
│ - 如: 字典 REST API、数据库连接                               │
│ - 注册方式: 管理端配置 → 存数据库                              │
│ - 调用方式: 服务端工具(如 DictService) → DataSource → 第三方    │
└─────────────────────────────────────────────────────────────┘
```

### 2. 双向认证设计

```
方向1: 第三方前端 → AI 平台
  第三方后端用 clientId + clientSecret 换 JWT
  第三方前端用 JWT 调 AI 平台 API (chat, tools 等)
  ✅ 已实现 (现有 OAuth 2.0 client_credentials)

方向2: AI 平台 → 第三方数据源 API
  管理端配置第三方 API 时，可选填认证信息:
  - 无认证 (公开 API)
  - API Key (Header: X-API-Key: xxx)
  - Bearer Token (Authorization: Bearer xxx)
  - Basic Auth (Authorization: Basic base64(user:pass))
  AI 后端调用第三方 API 时自动带上认证头
  ✅ 新增 (DataSource 实体 + RestDictProvider)

方向3: 管理端自身认证
  管理员账号: 用户名+密码登录，签发 admin scope JWT
  第三方账号: 用现有 clientId+clientSecret 登录，签发 tenant scope JWT
  管理端页面根据 scope 显示不同功能
  ✅ 新增 (AdminAccount 实体 + 登录接口)
```

### 3. dictTool 改造路径

```
现在: SDK dictTool → 浏览器 fetch → AI后端 /dict/{type}/query → StaticDictProvider
将来: 服务端 query_dict → DictService → RestDictProvider → 第三方 API
      SDK 不再内置 dictTool，字典查询对 SDK 完全透明
      LLM 调 query_dict → 后端直接执行 → 结果返回 LLM → LLM 继续推理
```

### 4. AgentScope V1 服务端工具执行方式

参考 AgentScope 的 Toolkit + @Tool 模式，服务端工具在 AgentScope 层面注册为
Toolkit 中的 ToolSchema，但 onCall 由后端 Java 代码直接执行（不走 TOOL_SUSPENDED）。

实现方式：在 SessionManager.build() 时，除了从 ToolRegistry 拿 SDK 工具，
还从 ServerToolRegistry 拿服务端工具，合并到 Toolkit 中。
当 LLM 调用服务端工具时，通过 AgentScope 的 Toolkit 回调机制直接执行。

---

## 数据库设计

### 新增表

#### admin_account (管理员账号)
```sql
CREATE TABLE admin_account (
  id        VARCHAR(64) PRIMARY KEY,
  username  VARCHAR(64) NOT NULL UNIQUE,
  password  VARCHAR(128) NOT NULL,  -- BCrypt hash
  role      VARCHAR(32) NOT NULL,   -- 'super_admin' | 'admin'
  enabled   BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### server_tool (服务端工具配置)
```sql
CREATE TABLE server_tool (
  id          VARCHAR(64) PRIMARY KEY,     -- 工具唯一标识
  name        VARCHAR(64) NOT NULL UNIQUE, -- 工具名(如 query_dict)
  type        VARCHAR(32) NOT NULL,        -- 'dict_query' | 'custom'
  description TEXT NOT NULL,               -- 工具描述(发给 LLM)
  parameters  TEXT NOT NULL,               -- JSON Schema (发给 LLM)
  config      TEXT,                        -- 工具特有配置(JSON)
  enabled     BOOLEAN DEFAULT TRUE,
  owner_id    VARCHAR(64),                 -- 所属第三方 clientId(空=平台内置)
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### data_source (第三方数据源)
```sql
CREATE TABLE data_source (
  id            VARCHAR(64) PRIMARY KEY,
  name          VARCHAR(128) NOT NULL,
  type          VARCHAR(32) NOT NULL,      -- 'rest' | 'jdbc'(v2)
  url           VARCHAR(500) NOT NULL,     -- 第三方 API 地址
  auth_type     VARCHAR(32),               -- 'none' | 'api_key' | 'bearer' | 'basic'
  auth_config   TEXT,                      -- 认证配置(JSON,加密存储)
  headers       TEXT,                      -- 额外请求头(JSON)
  owner_id      VARCHAR(64) NOT NULL,      -- 所属第三方 clientId
  health_status VARCHAR(16) DEFAULT 'unknown', -- 'ok' | 'fail' | 'unknown'
  last_check_at TIMESTAMP,
  enabled       BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### dict_source_binding (字典类型与数据源绑定)
```sql
CREATE TABLE dict_source_binding (
  id            VARCHAR(64) PRIMARY KEY,
  dict_type     VARCHAR(64) NOT NULL,      -- 字典类型(如 city, device_type)
  data_source_id VARCHAR(64) NOT NULL,     -- 关联数据源
  dict_label    VARCHAR(128),              -- 字典中文名(如 "城市")
  cascade_parent VARCHAR(64),              -- 父字典类型(级联用)
  path_template  VARCHAR(500),             -- API 路径模板(如 /api/dict/{type}/list)
  response_mapping TEXT,                   -- 响应字段映射(JSON)
  enabled       BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 任务分解

### Phase 1: 管理员认证体系 (后端)

#### Task 1.1: AdminAccount 实体 + Repository

**Files:**
- Create: `src/main/java/com/example/agent/admin/AdminAccount.java`
- Create: `src/main/java/com/example/agent/admin/AdminAccountRepository.java`

**Step 1: 创建 AdminAccount 实体**

```java
@Entity
@Table(name = "admin_account")
public class AdminAccount {
    @Id @Column(length = 64)
    private String id;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(nullable = false)
    private String password; // BCrypt hash
    @Column(nullable = false)
    private String role; // "super_admin" | "admin"
    private boolean enabled = true;
    private Instant createdAt = Instant.now();
    // getters/setters
}
```

**Step 2: 创建 Repository**

```java
public interface AdminAccountRepository extends JpaRepository<AdminAccount, String> {
    Optional<AdminAccount> findByUsername(String username);
}
```

**Step 3: 验证 H2 自动建表**

启动应用，检查 `admin_account` 表是否创建。

**Step 4: Commit**

```bash
git add src/main/java/com/example/agent/admin/AdminAccount.java src/main/java/com/example/agent/admin/AdminAccountRepository.java
git commit -m "feat: add AdminAccount entity and repository"
```

---

#### Task 1.2: 管理员登录接口

**Files:**
- Modify: `src/main/java/com/example/agent/auth/TokenService.java` — 新增 admin scope 签发
- Modify: `src/main/java/com/example/agent/auth/dto/TokenRequest.java` — 新增 password grant
- Create: `src/main/java/com/example/agent/admin/AdminAuthService.java`
- Modify: `src/main/java/com/example/agent/auth/AuthController.java` — 新增 admin 登录

**Step 1: 扩展 TokenRequest 支持 password grant**

在 TokenRequest record 中新增 `password` grant_type，包含 username + password 字段。

**Step 2: 创建 AdminAuthService**

```java
@Service
public class AdminAuthService {
    // 验证管理员用户名+密码，返回 AdminAccount
    // 验证第三方 clientId+clientSecret，返回 AppCredentials
    // 统一签发 JWT，scope 区分: "admin" / "tenant:{clientId}"
}
```

**Step 3: 修改 AuthController**

在 `/auth/token` 中新增 `password` grant_type 处理:
- 验证 username + password (BCrypt)
- 签发 scope="admin" 的 JWT

同时支持第三方用 clientId+clientSecret 登录管理端:
- 签发 scope="tenant:{clientId}" 的 JWT

**Step 4: 修改 JwtAuthFilter**

- `/admin/**` 需要 scope="admin" 或 scope="tenant:*"
- 其他路径逻辑不变

**Step 5: Commit**

```bash
git commit -m "feat: admin login with password grant + tenant login"
```

---

#### Task 1.3: 管理员 Seeder + 第三方账号管理接口

**Files:**
- Create: `src/main/java/com/example/agent/admin/AdminSeeder.java`
- Modify: `src/main/java/com/example/agent/admin/AdminController.java` — CRUD 接口

**Step 1: 创建 AdminSeeder**

启动时插入默认 super_admin 账号 (admin/admin123)，类似 DemoAppSeeder。

**Step 2: 扩展 AdminController**

```
POST   /admin/apps          — 创建第三方应用(生成 clientId + clientSecret)
GET    /admin/apps          — 列出所有第三方应用
PUT    /admin/apps/{id}     — 更新应用(启用/禁用、改名称等)
DELETE /admin/apps/{id}     — 删除应用
POST   /admin/apps/{id}/rotate-secret — 轮换 clientSecret
```

**Step 3: Commit**

```bash
git commit -m "feat: admin seeder + third-party app CRUD"
```

---

### Phase 2: 服务端工具体系 (后端)

#### Task 2.1: ServerTool 实体 + 数据源实体

**Files:**
- Create: `src/main/java/com/example/agent/tool/ServerTool.java`
- Create: `src/main/java/com/example/agent/tool/ServerToolRepository.java`
- Create: `src/main/java/com/example/agent/datasource/DataSourceEntity.java`
- Create: `src/main/java/com/example/agent/datasource/DataSourceRepository.java`
- Create: `src/main/java/com/example/agent/datasource/DictSourceBinding.java`
- Create: `src/main/java/com/example/agent/datasource/DictSourceBindingRepository.java`

**Step 1-3: 创建各实体和 Repository**

按上面数据库设计创建 JPA 实体。

**Step 4: Commit**

```bash
git commit -m "feat: server tool + data source entities"
```

---

#### Task 2.2: RestDictProvider — 调第三方 API 拉数据

**Files:**
- Create: `src/main/java/com/example/agent/datasource/RestDictProvider.java`
- Modify: `src/main/java/com/example/agent/dict/DictConfig.java` — 改为从数据库加载

**Step 1: 实现 RestDictProvider**

实现 DictProvider 接口，通过 WebClient 调第三方 REST API:
- 读取 DataSourceEntity 的 url、authType、authConfig
- 支持 keyword + parentCode 参数透传
- 响应映射: code/name/aliases/parent 字段提取
- 错误处理:超时、第三方不可达、响应格式错误

```java
public class RestDictProvider implements DictProvider {
    private final WebClient webClient;
    private final DataSourceEntity dataSource;
    private final DictSourceBinding binding;

    @Override
    public List<DictItem> search(String dictType, String keyword, int limit) {
        // GET {dataSource.url}?keyword={keyword}&limit={limit}
        // 带 auth header
        // 解析响应 → List<DictItem>
    }
}
```

**Step 2: 修改 DictConfig**

- 不再硬编码 StaticDictProvider
- 启动时从数据库加载 DictSourceBinding，为每个绑定创建 RestDictProvider
- 保留 StaticDictProvider 作为 fallback/demo

**Step 3: Commit**

```bash
git commit -m "feat: RestDictProvider + dynamic dict config from DB"
```

---

#### Task 2.3: ServerToolRegistry — 服务端工具注册与执行

**Files:**
- Create: `src/main/java/com/example/agent/tool/ServerToolRegistry.java`
- Create: `src/main/java/com/example/agent/tool/ServerToolExecutor.java`
- Modify: `src/main/java/com/example/agent/session/SessionManager.java` — 合并服务端工具

**Step 1: 创建 ServerToolRegistry**

从数据库加载已启用的 ServerTool，提供查询接口:
```java
@Component
public class ServerToolRegistry {
    // List<ServerTool> findAllEnabled()
    // ServerTool findByName(String name)
    // 按 ownerId 过滤(第三方只能看到自己的 + 平台内置的)
}
```

**Step 2: 创建 ServerToolExecutor**

执行服务端工具调用，不走 TOOL_SUSPENDED:
```java
@Component
public class ServerToolExecutor {
    // Object execute(String toolName, Map<String,Object> args)
    // 根据 tool.type 分发:
    //   dict_query → DictService.match()
    //   custom → 反射/脚本执行(v2)
}
```

**Step 3: 修改 SessionManager.build()**

在 build agent 时，除了 SDK 工具(从 ToolRegistry)，还加载服务端工具:
- 服务端工具注册到 Toolkit 的 ToolSchema
- 但标记为 `__server__` 前缀或特殊标记，让 TOOL_SUSPENDED 检测跳过
- 实际执行: 当 LLM 调用服务端工具时，在 AgentScope 的 Toolkit 回调中直接执行

**关键实现**: 利用 AgentScope Toolkit 的 `registerSchema` + 自定义执行回调。
查看 AgentScope V1 的 Toolkit API，看是否支持自定义 onCall。
如果不支持，则需要:
- 在 ChatController 的 toSse 中拦截服务端工具调用
- 直接执行并构造 ToolResultBlock 喂回 agent
- 不走 SDK 的 TOOL_SUSPENDED 流程

**Step 4: Commit**

```bash
git commit -m "feat: server tool registry + executor + session integration"
```

---

#### Task 2.4: 字典工具改为服务端工具

**Files:**
- Create: `src/main/java/com/example/agent/tool/DictQueryServerTool.java`
- Modify: `src/main/java/com/example/agent/tool/ServerToolExecutor.java` — 注册 dict_query
- Modify: `src/main/java/com/example/agent/dict/DictController.java` — 保留但加 JWT 鉴权
- Delete from SDK: `web-sdk/src/core/tools.ts` 中的 `dictTool` 函数(或标记 deprecated)

**Step 1: 创建 DictQueryServerTool**

将 dictTool 的 schema 和执行逻辑搬到后端:
- name: "query_dict"
- description: 动态从数据库加载已注册的字典类型和级联关系
- parameters: 同现有 dictTool 的 schema
- 执行: 调 DictService.match()

**Step 2: 启动时自动注册**

在 ServerToolRegistry 初始化时，如果数据库中没有 query_dict 记录，自动插入:
```java
@PostConstruct
void seedDictTool() {
    if (!repo.existsByName("query_dict")) {
        ServerTool dictTool = new ServerTool();
        dictTool.setName("query_dict");
        dictTool.setType("dict_query");
        dictTool.setDescription("...动态生成...");
        dictTool.setParameters("...动态生成...");
        repo.save(dictTool);
    }
}
```

**Step 3: 动态生成 description**

query_dict 的 description 需要包含当前已注册的字典类型列表。
在 ServerToolExecutor 执行时，动态从 DictService 获取 supportedTypes，
拼接到 description 中（或在 AgentScope 层面动态更新 schema）。

**Step 4: Commit**

```bash
git commit -m "feat: dict query as server-side tool"
```

---

### Phase 3: 管理端页面 (前端)

#### Task 3.1: 管理端页面框架 + 登录

**Files:**
- Create: `src/main/resources/static/admin/index.html`
- Create: `src/main/resources/static/admin/login.html`
- Create: `src/main/resources/static/admin/css/admin.css`
- Create: `src/main/resources/static/admin/js/api.js`
- Create: `src/main/resources/static/admin/js/auth.js`

**Step 1: 创建登录页面**

- 用户名+密码表单
- 调 POST /auth/token (grant_type=password)
- 存 JWT 到 localStorage
- 跳转到管理主页

**Step 2: 创建管理主页框架**

- 侧边栏导航: 应用管理、数据源管理、工具管理、审计日志
- 顶部: 当前用户 + 退出
- 内容区: 动态加载各模块

**Step 3: 创建 api.js 封装**

统一的 API 调用封装，自动带 JWT header，处理 401 跳转登录。

**Step 4: Commit**

```bash
git commit -m "feat: admin page framework + login"
```

---

#### Task 3.2: 第三方应用管理页面

**Files:**
- Create: `src/main/resources/static/admin/js/apps.js`

**Step 1: 应用列表页**

- 表格展示: clientId、名称、状态、创建时间
- 操作: 启用/禁用、删除、轮换密钥
- 新建应用弹窗: 输入名称 → 生成 clientId + clientSecret

**Step 2: Commit**

```bash
git commit -m "feat: admin apps management page"
```

---

#### Task 3.3: 数据源管理页面

**Files:**
- Create: `src/main/resources/static/admin/js/datasources.js`

**Step 1: 数据源列表页**

- 表格展示: 名称、类型、URL、认证方式、健康状态、所属应用
- 操作: 新增、编辑、删除、健康检查
- 新增/编辑弹窗:
  - 名称、类型(REST)
  - URL
  - 认证方式(无/API Key/Bearer/Basic)
  - 认证配置(密钥输入框)
  - 所属第三方应用(下拉选择)

**Step 2: 健康检查按钮**

调后端 POST /admin/datasources/{id}/health-check，更新状态。

**Step 3: Commit**

```bash
git commit -m "feat: admin data source management page"
```

---

#### Task 3.4: 字典绑定管理页面

**Files:**
- Create: `src/main/resources/static/admin/js/dict-bindings.js`
- Create: `src/main/java/com/example/agent/admin/DictBindingController.java`

**Step 1: 字典绑定列表页**

- 表格展示: 字典类型、中文名、关联数据源、级联父类型、启用状态
- 操作: 新增、编辑、删除
- 新增/编辑弹窗:
  - 字典类型(如 city)
  - 中文名(如 "城市")
  - 关联数据源(下拉选择)
  - API 路径模板(如 /api/dict/{type}/list)
  - 响应字段映射(code/name/aliases/parent)
  - 级联父类型(可选)

**Step 2: 后端 DictBindingController**

```
GET    /admin/dict-bindings          — 列出所有绑定
POST   /admin/dict-bindings          — 创建绑定
PUT    /admin/dict-bindings/{id}     — 更新绑定
DELETE /admin/dict-bindings/{id}     — 删除绑定
POST   /admin/dict-bindings/{id}/test — 测试绑定(调第三方 API 验证)
```

**Step 3: Commit**

```bash
git commit -m "feat: admin dict binding management"
```

---

#### Task 3.5: 工具管理页面

**Files:**
- Create: `src/main/resources/static/admin/js/tools.js`
- Create: `src/main/java/com/example/agent/admin/ServerToolController.java`

**Step 1: 服务端工具列表页**

- 表格展示: 工具名、类型、描述、所属应用、启用状态
- 操作: 启用/禁用、编辑描述
- query_dict 工具显示为"平台内置"，不可删除

**Step 2: 后端 ServerToolController**

```
GET    /admin/server-tools           — 列出所有服务端工具
PUT    /admin/server-tools/{id}      — 更新工具(描述、启用状态)
POST   /admin/server-tools           — 创建自定义服务端工具(v2)
```

**Step 3: Commit**

```bash
git commit -m "feat: admin server tool management"
```

---

#### Task 3.6: 审计日志页面

**Files:**
- Modify: `src/main/resources/static/admin/js/audit.js`

**Step 1: 审计日志列表**

- 表格展示: 时间、类型、clientId、详情
- 筛选: 按类型、按 clientId、按时间范围
- 分页

**Step 2: Commit**

```bash
git commit -m "feat: admin audit log page"
```

---

### Phase 4: 第三方 Mock 改造 + SDK 适配

#### Task 4.1: 改造 third-party-mock.js 提供字典 API

**Files:**
- Modify: `examples/third-party-mock.js`

**Step 1: 添加字典数据 REST API**

```javascript
// GET /api/dict/:dictType/list?keyword=北京&parentCode=DT02
app.get('/api/dict/:dictType/list', (req, res) => {
    const { dictType } = req.params;
    const { keyword, parentCode } = req.query;
    // 从内存数据中筛选返回
    // 格式: [{ code, name, aliases?, parent? }]
});
```

**Step 2: 添加认证中间件(可选)**

支持 API Key 认证，验证请求头中的 X-API-Key。

**Step 3: Commit**

```bash
git commit -m "feat: third-party mock dict API"
```

---

#### Task 4.2: SDK 移除 dictTool 内置 + 适配 order-form

**Files:**
- Modify: `web-sdk/src/core/tools.ts` — dictTool 标记 @deprecated
- Modify: `web-sdk/src/core/tools.ts` — 导出保留但加警告
- Modify: `src/main/resources/static/examples/order-form.html` — 移除 dictTool 调用
- Modify: `src/main/resources/static/examples/host-page.html` — 移除 dictTool 调用

**Step 1: dictTool 标记 deprecated**

在 dictTool 函数上加 @deprecated 注释，控制台打印警告。
保留函数不删除，给老用户过渡期。

**Step 2: 修改 order-form.html**

- 移除 createDictTool() 调用
- 移除 registerToolPanel 中的 query_dict toggle
- 字典查询现在由服务端工具自动注入，SDK 无需关心

**Step 3: 修改 host-page.html**

同上。

**Step 4: Commit**

```bash
git commit -m "feat: deprecate SDK dictTool, server-side tool takes over"
```

---

#### Task 4.3: JwtAuthFilter 调整

**Files:**
- Modify: `src/main/java/com/example/agent/auth/JwtAuthFilter.java`

**Step 1: /dict/ 路径加回 JWT 鉴权**

字典 API 不再从浏览器直接调用（服务端工具在后端执行），
移除 `/dict/` 的白名单。如果还需要保留给前端下拉用，
则加 JWT 鉴权。

**Step 2: /admin/ 路径加 scope 校验**

/admin/** 需要 scope 包含 "admin" 或 "tenant:*"。

**Step 3: Commit**

```bash
git commit -m "feat: JWT filter scope check for admin + dict"
```

---

### Phase 5: 集成测试 + 文档

#### Task 5.1: 端到端测试

**Step 1: 启动 third-party-mock.js**

```bash
node examples/third-party-mock.js
```

**Step 2: 启动 AI 后端**

```bash
mvn spring-boot:run
```

**Step 3: 管理端操作**

1. 登录管理端 (admin/admin123)
2. 创建第三方应用 "ERP系统"
3. 添加数据源: type=rest, url=http://localhost:7000/api/dict, auth=none
4. 添加字典绑定: city→ERP数据源, device_type→ERP数据源, device_model→ERP数据源(级联parent=device_type)
5. 确认 query_dict 服务端工具已启用

**Step 4: 前端测试**

1. 打开 order-form.html
2. 输入"客户在北京，要5台小米14手机"
3. AI 应自动调 query_dict 查城市编码和设备型号
4. 验证字典查询走的是第三方 mock API

**Step 5: Commit**

```bash
git commit -m "test: e2e dict query via third-party mock"
```

---

#### Task 5.2: 第三方对接文档

**Files:**
- Create: `docs/third-party-integration-guide.md` (仅在用户要求时创建)

---

## 执行顺序和依赖关系

```
Phase 1 (认证体系):
  Task 1.1 → Task 1.2 → Task 1.3
  ↓
Phase 2 (服务端工具):
  Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4
  ↓ (可与 Phase 3 并行)
Phase 3 (管理端页面):
  Task 3.1 → Task 3.2 + 3.3 + 3.4 + 3.5 + 3.6 (可并行)
  ↓
Phase 4 (SDK 适配):
  Task 4.1 → Task 4.2 + 4.3 (可并行)
  ↓
Phase 5 (测试):
  Task 5.1 → Task 5.2
```

## 风险和注意事项

1. **AgentScope Toolkit 不可改限制**: SessionManager 每次 stream 都新建 agent，
   服务端工具需要在 build 时注入。如果 Toolkit 不支持自定义执行回调，
   需要在 ChatController 层面拦截服务端工具调用。

2. **H2 MySQL 模式兼容**: JPA 实体的字段类型需兼容 H2，避免 MySQL 特有语法。

3. **第三方 API 超时**: RestDictProvider 需设置合理的超时时间(如 5s)，
   避免第三方 API 慢导致整个对话卡住。

4. **密钥安全**: DataSource 的 authConfig 需加密存储(Jasypt 或 AES)，
   管理端显示时脱敏。

5. **向后兼容**: dictTool 在 SDK 中标记 deprecated 但不删除，
   给老用户过渡期。服务端 query_dict 和 SDK dictTool 可暂时共存。
