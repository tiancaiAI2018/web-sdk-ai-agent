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
