# 08 事件与回调

---

## SSE 流式事件

SDK 通过 SSE(Server-Sent Events)接收后端流式响应。以下事件类型可在 `stream()` 的回调中接收:

| 事件 | 回调 | 说明 |
|------|------|------|
| `token` | `onChunk` | 文本增量(delta) |
| `thinking` | `onThinking` | 思考过程(模型内部推理) |
| `tool_call_start` | `onToolCallStart` | 工具调用开始(流式) |
| `tool_call_delta` | `onToolCallDelta` | 工具调用参数增量(流式) |
| `tool_call` | `onToolCall` | 完整工具调用 |
| `tool_call_end` | `onToolCallEnd` | 工具调用结束(流式) |
| `done` | `onDone` | 流结束 |

---

## SSEEvent 结构

```ts
interface SSEEvent {
  event?: string;  // 事件类型
  data?: string;   // 事件数据(JSON 字符串)
  id?: string;     // 事件 ID
}
```

---

## 工具调用生命周期

### 非流式(完整 tool_call)

```
LLM 生成 tool_call
  → SDK 收到 tool_call 事件
  → 创建工具卡 UI
  → 查找 onCall 回调
    → 有 onCall: 直接执行
    → 无 onCall: 弹出用户确认框
  → 执行结果 POST 到 /tools/result
  → LLM 收到结果,继续对话
```

### 流式(tool_call_start → delta → end)

```
tool_call_start
  → SDK 创建占位卡(显示工具名)
  → 记录 toolUseId → 卡片 DOM 映射

tool_call_delta (×N)
  → 增量拼接参数 JSON
  → 更新占位卡内容

tool_call_end
  → 参数拼接完成
  → 占位卡 promote 为完整工具卡
  → 后续流程同非流式
```

### 多步工具链

`/tools/result` 返回的 SSE 流与 `/stream` 完全一致,LLM 可能再次调用工具:

```
用户发消息 → /stream → LLM 调工具 A
  → SDK 提交 A 结果 → /tools/result → LLM 调工具 B
    → SDK 提交 B 结果 → /tools/result → LLM 最终回复
```

每次 `/tools/result` 的 SSE 流都会触发完整的 thinking、tool_call_start、tool_call_delta、tool_call 事件,SDK 统一处理:
- 思考卡正常渲染
- 工具卡正常创建/执行
- onCall 正常触发
- 如果再次挂起,后端自动保持 agent 在挂起池中

> 后端通过 `withSuspensionDetection()` 统一检测挂起,`stream()` 和 `resume()` 共用同一逻辑。

---

## 载荷类型

### ToolCallPayload

完整工具调用:

```ts
interface ToolCallPayload {
  tool: string;                          // 工具名
  args?: Record<string, unknown>;        // 调用参数
  id?: string;                           // 工具调用 ID
}
```

### ToolCallStartPayload

流式工具调用开始:

```ts
interface ToolCallStartPayload {
  id: string;    // 工具调用 ID
  name: string;  // 工具名
}
```

### ToolCallDeltaPayload

流式工具调用增量:

```ts
interface ToolCallDeltaPayload {
  id: string;       // 工具调用 ID
  delta: string;    // 参数 JSON 增量片段
  name?: string;    // 工具名(中间帧也会带)
}
```

### ToolCallEndPayload

流式工具调用结束:

```ts
interface ToolCallEndPayload {
  id?: string;  // 工具调用 ID
}
```

---

## 工具卡 UI 状态

工具卡在 UI 上有以下状态(通过 CSS class 切换):

| 状态 | class | 说明 |
|------|-------|------|
| `delta` | `--delta` | 流式参数拼接中 |
| `pending` | `--pending` | 等待执行/确认 |
| `confirmed` | `--confirmed` | 用户已确认 |
| `cancelled` | `--cancelled` | 用户已取消 |
| `done` | `--done` | 执行完成 |
| `success` | `--success` | 执行成功(含 confirmed) |

---

## 思考卡(thinking)

当 LLM 返回 `thinking` 事件时,SDK 显示思考卡:

```
┌─────────────────────────────┐
│ 💭 思考中...                │
│ 模型内部推理文本...          │
└─────────────────────────────┘
```

- 思考过程实时追加到卡片
- 流结束后标记为 `thinking-done`
- 可通过 `onThinking` 回调获取文本

---

[← 上一章: 认证与 Token](07-auth-token.md) | [返回目录](index.md) | [下一章: 后端接口约定 →](09-backend-api.md)
