# AI Agent SDK API 参考手册

> **版本**: 5.0.0 | **构建**: ESM + UMD + React 适配器

---

## 目录

- [快速开始](#快速开始)
- [初始化配置 (AIAgentOptions)](#初始化配置)
- [核心 API](#核心-api)
- [工具系统](#工具系统)
- [页面感知 (Page Awareness)](#页面感知-page-awareness)
- [皮肤系统](#皮肤系统)
- [工具面板 (ToolPanel)](#工具面板-toolpanel)
- [类型定义](#类型定义)
- [架构说明](#架构说明)

---

## 快速开始

### UMD（`<script>` 标签）

```html
<script src="http://your-host/sdk/ai-agent-sdk.js"></script>
<script>
  var agent = AIAgent.init({
    endpoint: 'http://your-host',
    getAccessToken: async function () {
      var r = await fetch('http://your-backend/api/ai-token', { method: 'POST' });
      return await r.json(); // { accessToken, refreshToken? }
    }
  });
</script>
```

### ESM（npm）

```javascript
import { AIAgent, createAIAgent } from 'aiagent-sdk';

const agent = new AIAgent().init({
  endpoint: 'https://your-host',
  getAccessToken: async () => {
    const r = await fetch('https://your-backend/api/ai-token', { method: 'POST' });
    return await r.json();
  }
});
```

### React

```tsx
import { AIAgentWidget, useAIAgent } from 'aiagent-sdk/react';

function App() {
  return <AIAgentWidget opts={{
    endpoint: 'https://your-host',
    getAccessToken: async () => { /* ... */ }
  }} />;
}
```

---

## 初始化配置

### `AIAgent.init(opts)` → `AIAgent`

创建并挂载浮窗。返回 `AIAgent` 实例。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `endpoint` | `string` | ✅ | — | 后端 base URL，不带尾斜杠 |
| `getAccessToken` | `() => Promise<{accessToken, refreshToken?}>` | ✅ | — | Token 获取钩子，SDK 自动续期 |
| `title` | `string` | | `'AI 助手'` | 浮窗标题 |
| `subtitle` | `string` | | `'在线'` | 浮窗副标题 |
| `placeholder` | `string` | | `'输入消息...'` | 输入框占位符 |
| `welcomeMessage` | `string` | | `'你好!...'` | 欢迎语（首条消息后隐藏） |
| `theme` | `'ink' \| 'paper' \| 'dark' \| 'light'` | | `'ink'` | 主题色板 |
| `position` | `'bottom-right' \| 'bottom-left'` | | `'bottom-right'` | 浮窗位置 |
| `autoOpen` | `boolean` | | `false` | 初始化后自动打开面板 |
| `avatar` | `string` | | `'🤖'` | 气泡头像（emoji 或 SVG） |
| `clientPrefix` | `string` | | `'app'` | sessionId 前缀（`{prefix}:user-{ts}`） |
| `persistentTools` | `ToolDef[]` | | `[]` | 持久工具列表 |
| `builtinTools` | `{changeSkin?, pageErrors?}` | | `{}` | 内置工具开关 |
| `skin` | `string` | | `'iridescent-bloom'` | 初始皮肤名 |
| `pageAwareness` | `PageAwarenessOptions` | | — | 页面感知配置 |

---

## 核心 API

### 浮窗控制

```typescript
agent.open()     // 打开面板
agent.close()    // 关闭面板
agent.toggle()   // 切换开/关
agent.destroy()  // 销毁浮窗 + 清理所有资源
```

### 对话

```typescript
// 不带 UI 的程序化流式调用
await agent.stream({
  sessionId: 'app:user-123',
  message: '你好',
  onChunk: (ev) => console.log(ev.data),
  onDone:  () => console.log('完成'),
  onError: (e) => console.error(e),
  onToolCall: (parsed) => { /* ... */ },
});
```

### 主题 & 皮肤

```typescript
agent.setTheme({ theme: 'dark' })      // 切换主题色板
agent.setSkin('classic')               // 切换皮肤
agent.registerSkin(skinObj)            // 注册自定义皮肤
agent.listSkins()                      // 列出所有皮肤名
agent.listSkinsWithInfo()              // 列出皮肤名 + aiHint
```

---

## 工具系统

SDK 支持三种工具注册方式，生命周期不同：

### 1. 持久工具 (`persistentTools`)

init 时传入，生命周期跟 agent 实例，每个新会话自动注入。

```javascript
AIAgent.init({
  // ...
  persistentTools: [{
    name: 'submit_form',
    description: '提交订单表单到系统',
    parameters: {
      type: 'object',
      properties: {
        customerName: { type: 'string', description: '客户姓名' },
        totalAmount:  { type: 'number', description: '总金额' }
      },
      required: ['customerName', 'totalAmount']
    },
    strict: true,
    onCall: function (payload) {
      // 在宿主页面上填写表单
      document.querySelector('[data-field="customerName"]').value = payload.customerName;
      return '已填写: ' + payload.customerName;
    }
  }]
});
```

### 2. 临时工具 (`addEphemeralTools`)

仅当前会话生效，新会话自动清空。

```javascript
await agent.addEphemeralTools([{
  name: 'translate',
  description: '翻译文本',
  parameters: { /* JSON Schema */ },
  onCall: (args) => '翻译结果: ...'
}]);

await agent.removeEphemeralTools(['translate']);
```

### 3. 内置工具 (`registerBuiltinTool`)

全局静态注册，所有 agent 实例共享。

```javascript
AIAgent.registerBuiltinTool(AIAgent.changeSkinTool(agent));
AIAgent.registerBuiltinTool(AIAgent.pageErrorsTool({
  getPageErrors: () => agent.getPageErrors(),
  clearPageErrors: () => agent.clearPageErrors()
}));
```

通过 `builtinTools` 配置控制开关：

```javascript
AIAgent.init({
  builtinTools: {
    changeSkin: false,   // 关闭换肤工具
    pageErrors: false    // 关闭 get_page_errors 工具
  }
});
```

### 工具注册 API

```typescript
await agent.registerTools({ sessionId, tools: ToolDef[] })   // 全量替换
await agent.unregisterTools({ sessionId, names?: string[] }) // 删除指定/全部
await agent.listTools({ sessionId })                          // 查询列表
```

### 工具面板 (`registerToolPanel`)

在浮窗 header 渲染可交互的工具开关/按钮：

```javascript
agent.registerToolPanel([
  {
    name: 'query_dict', label: '字典查询', icon: '📖',
    type: 'toggle', tool: dictToolDef, defaultOn: false
  },
  {
    name: 'clear_form', label: '清空表单', icon: '🗑️',
    type: 'action', onExecute: () => { document.getElementById('myForm').reset(); }
  }
]);
```

---

## 页面感知 (Page Awareness)

> **v5 新增**。SDK 自动捕获宿主页面的 JS 异常、HTTP 错误、UI 错误弹窗，注入到 AI 上下文中，让 AI 主动发现并帮助用户。

### 开启方式

```javascript
AIAgent.init({
  // ...
  pageAwareness: { enabled: true }  // 一行开启，三个采集源全部启用
});
```

### 工作原理

```
宿主页面发生错误
    ↓
SDK 采集层自动捕获 (三种来源)
    ↓
错误缓冲区 (环形缓冲 + 去重 + 脱敏)
    ↓
用户发消息时自动注入 [Page Context] 前缀
    ↓
AI 看到错误上下文，主动提及并建议解决方案
```

**双通道注入**：
- **消息前缀**（自动）：每次用户发消息时，未上报的错误拼到消息头部
- **`get_page_errors` 虚拟工具**（按需）：AI 需要更多细节时主动调用

### 采集源

| 采集源 | 机制 | 捕获内容 |
|--------|------|----------|
| **全局错误** | `window.onerror` + `unhandledrejection` | JS 异常、未处理的 Promise rejection |
| **网络错误** | `fetch` / `XMLHttpRequest` 拦截 | HTTP 4xx/5xx、网络失败、超时 |
| **DOM 弹窗** | `MutationObserver` | Element UI、Ant Design、Bootstrap 等错误 Toast |

**安全规则**：
- 链式调用宿主原有 handler，不吞掉
- SDK 自身请求（`/chat/`、`/auth/`、`/dict/`）自动排除
- 所有采集逻辑 try/catch 包裹，绝不影响宿主页面

### DOM 弹窗支持的选择器

| 选择器 | 框架 |
|--------|------|
| `.el-message--error` `.el-notification--error` | Element UI / Element Plus |
| `.ant-message-error` `.ant-alert-error` `.ant-notification-error` | Ant Design |
| `.ivu-message-error` | iView / View UI |
| `.van-toast--fail` | Vant |
| `[role="alert"]` | ARIA 标准 |
| `.alert-danger` | Bootstrap |
| `.notification.is-danger` | Bulma |
| `.toast-error` | 通用 |

### 配置项详解

```typescript
interface PageAwarenessOptions {
  enabled?: boolean;            // 总开关，默认 false

  capture?: {
    globalErrors?: boolean;     // window.onerror + unhandledrejection
    networkErrors?: boolean;    // fetch / XHR 拦截
    domErrorPopups?: boolean;   // MutationObserver 监听
  };

  filter?: {
    ignoreUrls?: RegExp[];      // 忽略的 URL 正则
    ignoreMessages?: RegExp[];  // 忽略的错误消息正则
    redactPatterns?: RegExp[];  // 自定义脱敏正则
    maxMessageLength?: number;  // 消息最大长度，默认 500
  };

  behavior?: {
    maxBufferSize?: number;     // 环形缓冲区大小，默认 50
    dedupeWindowMs?: number;    // 去重窗口(ms)，默认 5000
    maxErrorsPerMessage?: number; // 每条消息最多注入几条，默认 5
    autoInject?: boolean;       // 自动注入消息前缀，默认 true
    registerTool?: boolean;     // 注册 get_page_errors 工具，默认 true
  };

  onError?: (error: PageError) => void;  // 采集回调（过滤前调用）
}
```

### 默认脱敏规则

以下敏感信息自动替换为 `[REDACTED]`：

- JWT tokens（`Bearer eyJ...`）
- 密码/密钥（`password=xxx`、`api_key=xxx`、`secret=xxx`）
- 邮箱地址
- 信用卡号（`4532-1234-5678-9012`）
- Auth tokens（`token=xxx`、`auth=xxx`）

### 公共 API

```typescript
// 获取错误缓冲区（只读副本）
agent.getPageErrors(): PageError[]

// 清空缓冲区
agent.clearPageErrors(): void

// 手动上报一条错误
agent.reportPageError({
  source: 'network',       // 'global' | 'network' | 'dom_popup'
  severity: 'error',       // 'info' | 'warning' | 'error' | 'critical'
  message: 'WebSocket 断开',
  details: { code: 1006 }
}): void
```

### PageError 数据结构

```typescript
interface PageError {
  id: string;                        // 去重用 ID
  source: 'global' | 'network' | 'dom_popup';
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;                 // ISO 格式
  message: string;                   // 人可读摘要（已脱敏）
  details: Record<string, unknown>;  // 结构化细节
  surfaced?: boolean;                // 是否已注入过消息前缀
}
```

### UI 反馈

- **气泡角标**：`critical` 级别错误在浮窗气泡上显示红色数字角标
- **主动系统消息**：浮窗打开时，`critical` 错误触发系统消息提示（30 秒节流）
- **打开面板时**：角标自动隐藏（用户已在交互）

### 端到端示例

```javascript
// 1. 初始化（开启页面感知）
var agent = AIAgent.init({
  endpoint: 'http://localhost:8080',
  getAccessToken: async () => ({ accessToken: '...' }),
  pageAwareness: {
    enabled: true,
    filter: {
      ignoreUrls: [/analytics\.google\.com/],   // 忽略埋点请求
      redactPatterns: [/order_id=\d+/g]          // 自定义脱敏
    },
    onError: function (err) {
      console.log('[My App] 捕获到:', err.source, err.message);
    }
  }
});

// 2. 用户在宿主页面操作时发生错误
//    - 用户点"提交订单" → 后端返回 500 库存不足
//    - 页面弹出 Element UI 错误 Toast
//    SDK 自动捕获: network(HTTP 500) + dom_popup(库存不足...)

// 3. 用户打开浮窗问 AI: "刚才提交失败了，怎么回事？"
//    SDK 自动在消息头部注入:
//    [Page Context - 检测到以下页面异常]
//    - [14:32:05] network: HTTP 500 Internal Server Error
//    - [14:32:08] dom_popup: 库存不足: 商品"小米14"在目标仓库可用库存为 0
//
//    AI 看到这些上下文，主动回复:
//    "我看到刚才提交订单时遇到了库存不足的问题，小米14在北京仓暂时没有库存。
//     要不我帮你换成华东仓库试试？"
```

### 真实业务流程

```
用户: "帮我录一单，5台小米14手机，客户张三"
  → AI 调 submit_form 工具填好表单字段
  → 用户点"提交订单"按钮
  → 第三方接口返回 HTTP 500: 库存不足
  → 页面弹出错误 Toast (el-message--error)
  → SDK 捕获: network(500) + dom_popup(库存不足)
  → 用户问 AI: "为什么失败了？"
  → AI 通过页面感知看到错误上下文，主动帮忙
```

---

## 记忆系统（Memory）

让 AI 跨会话记住用户偏好、事实、历史操作。**纯前端 localStorage 持久化，零网络依赖，只存在当前设备**。

### 核心设计：两个工具 + 轻量目录

| 组件 | 作用 | 何时被调用 |
|------|------|----------|
| `save_memory` | 存一条记忆（key/value/category） | AI 听到用户说"记住..."时主动调 |
| `recall_memory` | **完整模糊检索**（5 档匹配 + 加权评分） | AI 需要看具体记忆内容时主动调 |
| `[Memory Index]` 自动注入 | **只列 key 目录**（不展开 value） | 每次发消息自动追加，AI 知道"有这些可查" |

**关键点**：自动注入的是"目录"（~200 字符），不是全量 value。这样：

- 1000 条记忆也不会爆 token
- AI 真要看 value → 调 `recall_memory` 走同一套模糊评分
- 记忆越多目录越完整，但体积增长有限（每条只贡献 1 个 key）

### 注入的目录示例

```text
[Memory Index - 共 12 条记忆]
可调 recall_memory({query:"..."}) 检索详情。
pinned: 📌 city, 📌 default_warehouse, 📌 customer_phone
其他: last_order, payment_method, ... (7 条)
```

### 数据模型

```typescript
export type MemoryCategory = 'preference' | 'fact' | 'history' | 'note';
export type MemoryScope = 'global' | 'session';  // global=持久化, session=仅当前会话

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  key: string;              // 短标识,如 'city' / 'default_warehouse'
  value: string;            // 记忆内容
  tags?: string[];          // 可选标签,便于按 tag 召回
  scope: MemoryScope;
  pinned: boolean;          // 置顶:目录里永远列在前面(最多 5 条,超出控制台警告)
  createdAt: string;        // ISO
  updatedAt: string;
  hitCount: number;         // 被 recall 命中次数
  lastHitAt?: string;
}
```

### 模糊检索算法（`fuzzy.ts`）

`recall_memory` 和 `[Memory Index]` 的非 pinned 部分**走同一套评分**：

```
score = 0.5 × keyMatch + 0.3 × valueMatch + 0.1 × tagMatch + 0.1 × recencyBonus
```

**5 档匹配**：
1. **精确包含**（1.0）：`field.includes(q)` 或 `q.includes(field)`
2. **前缀**（0.9）：`field.startsWith(q)`
3. **分词全命中**（0.75）：q 按空格/标点切分，每段都在 field 中
4. **近似**（0.4~0.7）：编辑距离 ≤ len/4，距离越近分越高
5. **不命中**（0）

**特殊优化**：
- **同义词表**（硬编码常见对）："北京"↔"BJ"、"手机"↔"电话"、"加急"↔"urgent"
- **置顶加分**：`pinned=true` 的 score += 0.05
- **命中衰减**：30 天未命中 score × 0.9，90 天未命中 × 0.7

**算法体积**：~150 行手写实现，**不引入 Fuse.js**（省 ~20KB bundle）。

### 初始化

```javascript
AIAgent.init({
  endpoint: 'http://localhost:8080',
  getAccessToken: async () => ({ accessToken: '...' }),
  memory: {
    enabled: true,             // 总开关
    maxEntries: 1000,          // 记忆上限,默认 1000
    autoInject: true,          // 自动注入目录,默认 true
    maxInjectCount: 10,        // 目录里非 pinned key 上限,默认 10
    maxIndexChars: 200,        // 目录总字符上限,默认 200
    onMemoryChange: (entries) => {  // 记忆变化回调
      console.log('当前记忆数:', entries.length);
    }
  }
});
```

### AI 自动使用

```
用户: "记住: 我在仓库 BJ 发货,客户编码 C001"
AI 调 save_memory({key:'default_warehouse', value:'BJ', category:'preference', pinned:true})
AI 调 save_memory({key:'customer_code', value:'C001', category:'fact'})
AI: 已记住,以后默认用北京仓发货。

[下次会话]
用户: "帮我录一单,5台小米14"
AI 看到 [Memory Index]: pinned: 📌 default_warehouse, 📌 customer_code
AI: 好的,默认仓库 BJ,客户 C001。我帮你填,还需要客户姓名。
```

### 程序化 API

```javascript
// 保存(自动 upsert:同 category+key 会合并更新)
const entry = agent.saveMemory({
  key: 'default_warehouse',
  value: 'BJ-北京中心仓',
  category: 'preference',
  pinned: true,
  tags: ['仓库', '常用'],
  scope: 'global'
});

// 检索(返回 MemoryEntry 数组,按 score 倒序)
const hits = agent.recallMemory('北京');
// → [{ key:'city', value:'北京', ... }, { key:'default_warehouse', value:'BJ...', ... }]

// 类别过滤检索
const prefs = agent.recallMemory('仓', { category: 'preference' });

// 列出全部
const all = agent.listMemories();
const onlyPinned = agent.listMemories({ pinned: true });

// 删除/清空
agent.deleteMemory(entry.id);
agent.clearMemories();

// 导入导出(JSON,跨设备/跨账号迁移)
const json = agent.exportMemories();           // string
const imported = agent.importMemories(json);   // 实际导入条数

// 订阅变更
const unsub = agent.onMemoryChange((entries) => { /* ... */ });
```

### 内置开关

```javascript
// 关闭记忆工具(系统仍记,但 AI 不能调 save/recall)
AIAgent.init({
  ...
  builtinTools: { memory: false }   // 默认开启
});
```

### 浮窗浏览页

启用记忆后，浮窗左侧会出现 🧠 入口。点击进入记忆浏览页：

- 顶部搜索框（实时模糊检索）
- 分类 filter chip（全部/偏好/事实/历史/备注）
- 列表项：点击 📌/🗑 切换置顶/删除；点击 value 可内联编辑
- 底部：导出 JSON / 从 JSON 导入 / 清空全部

### AI 自动化（v2 计划）

`memory.autoExtract` 配置（v2 待实现）允许 SDK 在每轮对话后调用小模型自动抽取值得记忆的 key-value，需用户确认后保存。v1 仅支持 AI 主动 `save_memory` 调用。

### 容量与性能

| 项 | 限制 | 说明 |
|----|------|------|
| 总条数 | 1000（可配 `maxEntries`） | 达到上限时 **save 返回 `capacity_full` 错误**（不静默 LRU） |
| 字节数 | 4MB（可配 `maxBytes`） | 序列化估算，默认 4MB 留 1MB 余量 |
| 单条 value | 无硬限 | 建议 < 500 字 |
| localStorage | ~5MB | 每条记忆 < 500B，1000 条 ≈ 500KB |
| 注入体积 | 200 字符（可配） | 目录模式，**不随记忆数线性增长** |
| 模糊检索 | **1-3ms（千条内）** | 倒排索引 + Levenshtein，详见下 |

### 性能优化：倒排索引

```
[query 到来] → tokenize(q) → 取所有 token 的 entryId 集合并集（去重）→ 精排
                                       ↓
                            （候选 < 3 时回退全表扫，处理同义词/拼写差异）
```

- **倒排表**：`token → Set<entryId>`，启动时从 `_entries` 一次性建好，后续 save/delete/update 增量维护
- **1000 条 → 实际精排 20-50 条**，检索从 50ms 降到 1-3ms
- **value 截前 500 字符** 入索引，避免巨型 value 让 tokenize 爆炸
- **候选 < 3 自动回退全表扫**，兼容同义词（"北京" 查 "BJ"）和拼写差异

### 容量错误机制（AI 主导）

**v2 行为变更**：当 `maxEntries` 或 `maxBytes` 达到上限时，`save` 不再静默 LRU 淘汰，而是返回结构化错误给 AI，让 AI 决定怎么处理。

#### 触发流程

```
AI: save_memory({key:"new", value:"...", category:"fact"})
  → save() 检查容量，发现已满
  → throw CapacityError（saveFromTool 捕获后转成 ok:false 返回）
  → AI 收到错误响应，看到 suggestions 列表
  → AI 决定:
     A. 遗忘：查 forgetCandidates，删几条不重要的，再 save
     B. 压缩：查 compressCandidates，合并相似条目，再 save
     C. 提示用户手动清理（打开浮窗 → 🧠 记忆 → 清空）
```

#### 错误返回体结构

```typescript
interface CapacityErrorResult {
  ok: false;
  error: 'capacity_full';
  current: number;          // 当前条目数
  capacity: number;         // 上限
  bytes: number;            // 当前字节估算
  maxBytes: number;
  suggestions: {
    /** 5 条最久未用的非 pinned 记忆，按 lastHitAt 升序（null 优先） */
    forgetCandidates: Array<{
      id: string;
      key: string;
      value: string;
      category: string;
      daysSinceLastHit: number | null;
      daysSinceUpdate: number;
    }>;
    /** 1-2 组可合并的记忆（同 category + 相似 key 前缀） */
    compressCandidates: Array<{
      ids: string[];
      keys: string[];
      category: string;
      reason: string;
    }>;
  };
  message: string;          // 人类可读建议
}
```

#### 死循环保护

同 `category:key` 在 5 分钟内连续 3 次触发 `capacity_full` → 自动 LRU 淘汰 1 条 + 强制保存，控制台 warn。

避免 AI 选了"遗忘"但删完再 save 又满的无限循环。

#### 配置项

```javascript
memory: {
  maxEntries: 1000,        // 条目上限，默认 1000
  maxBytes: 4 * 1024 * 1024, // 字节上限，默认 4MB
  // ...其他
}
```

#### 程序化 API 处理

```javascript
const result = agent.saveMemory({ key:"new", value:"...", category:"fact" });
if (result && 'error' in result && result.error === 'capacity_full') {
  console.log('容量满，候选:', result.suggestions.forgetCandidates);
  // AI/宿主处理后让用户决定，再调 saveMemory
} else {
  console.log('保存成功:', result);
}
```

---

## 皮肤系统

### 内置皮肤

| 名称 | 风格 | 适用场景 |
|------|------|----------|
| `iridescent-bloom` | 暗色油彩画布 + 4 角飞溅 + 毛玻璃 | 默认，视觉冲击力最强 |
| `classic` | 白底 + 蓝色强调 + 系统字体 | 商务/极简 |
| `aurora` | 极光绿/青/紫色系 + 衬线字体 | 创意/个性化 |

### 自定义皮肤

```javascript
// 从内置皮肤派生
var mySkin = AIAgent.deriveSkin(AIAgent.IRIDESCENT_BLOOM, {
  name: 'ocean',
  css: '/* CSS 变量覆盖 */',
  layout: { fontStack: 'mono', cornerGlow: true },
  aiHint: '深海蓝底 + 天蓝色系 + 等宽字体'
});

agent.registerSkin(mySkin);
agent.setSkin('ocean');
```

---

## 类型定义

### ToolDef

```typescript
interface ToolDef {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;  // JSON Schema
  strict?: boolean;
  onCall?: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}
```

### PageAwarenessOptions

见[页面感知配置项详解](#配置项详解)。

### PageError

见 [PageError 数据结构](#pageerror-数据结构)。

---

## 架构说明

### Widget 渲染

- **Shadow DOM**：浮窗通过 `attachShadow({mode: "open"})` 挂载在 `document.body`，CSS 完全隔离
- **z-index**：`2147483600`（近 int32 最大值），确保浮在最上层
- **非 iframe**：SDK 与宿主页面共享 DOM，可直接操作宿主页面的表单元素

### Token 管理

- SDK 不持有 `clientSecret`，只通过 `getAccessToken` 钩子获取 JWT
- 内部 `TokenCache` 自动解析 JWT `exp` claim，提前 30 秒续期
- `clientSecret` 永远只在第三方后端 ↔ AI 后端之间传递

### SSE 通信

- 使用 `fetch` + `ReadableStream` 手动解析 SSE 帧（非 `EventSource`）
- 原因：`EventSource` 自动重连与自定义 token 续期不兼容
- 支持 8 种事件类型：`thinking`、`text`、`tool_call_start/delta/end`、`tool_call`、`round_end`、`id: last`

### 工具执行流

```
LLM 生成 ToolUseBlock
  → 后端检测无实现 → TOOL_SUSPENDED
  → 后端挂起 agent，推 tool_call 帧
  → SDK 查找本地 onCall → 执行 → POST /tools/result
  → 后端 resume(agent) → LLM 看到工具结果 → 继续推理
```

---

## 构建

```bash
cd web-sdk

# 类型检查
npm run typecheck

# ESM 构建
npm run build:esm

# UMD 构建（自动复制到 Spring Boot static/）
npm run build:umd

# 完整构建
npm run build
```
