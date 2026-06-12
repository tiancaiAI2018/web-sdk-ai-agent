# 03 两层工具模型

> v5 核心设计

---

## 模型概览

```
┌─────────────────────────────────────────────┐
│  持久工具 (Persistent)                       │
│  · init 时传入的 persistentTools             │
│  · registerBuiltinTool 注册的 changeSkin 等   │
│  · 每个新会话自动注入,生命周期跟 agent 实例   │
├─────────────────────────────────────────────┤
│  临时工具 (Ephemeral)                        │
│  · addEphemeralTools() 追加的                │
│  · 仅当前会话生效,新会话自动清空              │
└─────────────────────────────────────────────┘
```

### 注册时机

```
init()
  → _persistentTools 本地缓存(不调 Register)
  ↓
首次发消息 → _syncToolsForSession(sid)
  → registerRemote(持久工具: persistentTools + 内置工具)
  → appendRemote(临时工具)
  ↓
新会话 → _ephemeralTools 清空, _persistentTools 保留
  → 下次发消息时自动重新注册持久工具
```

---

## 持久工具(Persistent)

### 来源

1. `init({ persistentTools: [...] })` 传入的工具
2. `AIAgent.registerBuiltinTool(...)` 注册的内置工具

### 特点

- 本地缓存,不立即调 Register 接口
- 每个新会话首次发消息时,SDK 自动注册到后端
- 生命周期跟 agent 实例,新会话不会丢失

### 示例

```js
const agent = AIAgent.init({
  persistentTools: [{
    name: 'submit_form',
    description: 'Submit order fields',
    parameters: { /* JSON Schema */ },
    onCall: (payload) => { /* 处理工具调用 */ }
  }]
});
// submit_form 是持久工具,每个新会话都能用
```

---

## 临时工具(Ephemeral)

### 追加

```js
await agent.addEphemeralTools([{
  name: 'translate',
  description: 'Translate text to target language',
  parameters: {
    type: 'object',
    properties: {
      text:       { type: 'string', description: '要翻译的文本' },
      targetLang: { type: 'string', description: '目标语言' }
    },
    required: ['text', 'targetLang']
  },
  onCall: (payload) => `[${payload.targetLang}] ${payload.text}`
}]);
```

### 移除

```js
await agent.removeEphemeralTools(['translate']);
```

### 行为规则

| 场景 | 行为 |
|------|------|
| 当前有会话时追加 | 立即调 `/tools/append` 注册到后端 |
| 当前无会话时追加 | 存入本地 `_ephemeralTools`,下次新会话时自动注册 |
| 新会话 | `_ephemeralTools` 自动清空,不会跨会话残留 |
| 同名工具 | 后注册的覆盖先注册的 |

---

## 内置工具开关

内置工具(如 changeSkin)默认启用,属于持久工具。可通过配置关闭:

### init 时关闭

```js
AIAgent.init({
  builtinTools: { changeSkin: false }  // 关闭 AI 换肤能力
});
```

### 运行时切换

下次新会话生效:

```js
agent._opts.builtinTools = { changeSkin: false };
```

### 过滤逻辑

`_syncToolsForSession` 注册时,会根据 `builtinTools` 配置过滤:

```js
// changeSkin 工具:默认启用,显式传 false 关闭
if (t.name === 'change_skin' && builtinCfg && builtinCfg.changeSkin === false) {
  continue;  // 跳过,不注册
}
```

---

## 工具定义 ToolDef

```ts
interface ToolDef {
  name: string;           // 工具名,白名单 [a-z0-9_]{1,32}
  description?: string;   // 工具描述,≤ 500 字符
  parameters?: {          // JSON Schema
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  strict?: boolean;       // 是否严格模式,默认 true
  onCall?: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}
```

### name 命名规则

- 只允许小写字母、数字、下划线
- 长度 1-32 字符
- 正则: `[a-z0-9_]{1,32}`

### description 限制

- 最长 500 字符
- 后端会过滤 prompt injection 特征

### parameters 格式

必须是 JSON Schema,顶层 `type: 'object'`:

```js
parameters: {
  type: 'object',
  properties: {
    orderId: { type: 'string', description: '订单编号' },
    amount:  { type: 'number', description: '金额' }
  },
  required: ['orderId', 'amount']
}
```

---

## onCall 回调

当后端 LLM 调用工具时,SDK 端触发 `onCall`:

```js
onCall: function(payload) {
  // payload = LLM 传来的参数(已解析为对象)
  // 返回值会被 POST 到 /tools/result,LLM 看到后继续对话
  return '执行结果描述';
}
```

### 返回值处理

| 返回值 | LLM 行为 |
|--------|---------|
| 返回字符串 | LLM 看到结果,生成确认回复 |
| 不返回值 | SDK 用占位符 `"[Tool executed by client SDK; no result returned]"` |
| 返回 Promise | 支持异步操作,等 resolve 后提交 |

### 多步工具链

`/tools/result` 返回的 SSE 流与 `/stream` 完全一致,LLM 可能再次调用工具:

```
用户消息 → stream → LLM 调工具 A → 挂起
  → SDK 提交 A 结果 → /tools/result → LLM 调工具 B → 再次挂起
    → SDK 提交 B 结果 → /tools/result → LLM 最终回复
```

每次 `/tools/result` 的 SSE 流都会触发完整的 thinking、tool_call 等事件,SDK 统一处理。后端通过 `withSuspensionDetection()` 自动检测是否再次挂起。

### 无 onCall 的工具

如果工具没有 `onCall`,SDK 会弹出用户确认框:

```
┌─────────────────────────┐
│ 🔧 submit_form          │
│ { orderId: "123", ... } │
│                         │
│  [✓ 确认]  [✕ 取消]     │
└─────────────────────────┘
```

用户确认后才执行;取消则中止当前 agent。

---

## registerTools vs addEphemeralTools

| | `registerTools` | `addEphemeralTools` |
|---|---|---|
| 语义 | 全量替换该 sid 的工具集 | 追加,不清空已有 |
| 生命周期 | 手动管理 | 仅当前会话,新会话自动清空 |
| 后端接口 | `/tools/register` | `/tools/append` |
| 本地存储 | `_tools` (按 sid) | `_ephemeralTools` (全局) |
| 适用场景 | 低级别控制 | 临时/动态工具 |

---

[← 上一章: 初始化配置](02-init-options.md) | [返回目录](index.md) | [下一章: 公共 API →](04-public-api.md)
