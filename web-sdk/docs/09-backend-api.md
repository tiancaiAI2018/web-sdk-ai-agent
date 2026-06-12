# 09 后端接口约定

---

## 工具注册接口

### POST /chat/{sid}/tools/register

全量替换该 sid 下的工具集。

**请求体:**

```json
{
  "tools": [{
    "name": "submit_form",
    "description": "Submit order fields",
    "parameters": {
      "type": "object",
      "properties": {
        "orderId": { "type": "string", "description": "订单编号" }
      },
      "required": ["orderId"]
    },
    "strict": true
  }]
}
```

**响应:**

```json
{
  "registered": ["submit_form"]
}
```

> 注意:会清空该 sid 下已有工具,再写入新的。

---

### POST /chat/{sid}/tools/append

追加工具到该 sid,不清空已有工具。同名工具覆盖更新。

**请求体:** 同 register

**响应:**

```json
{
  "appended": ["translate"]
}
```

> v4 新增,用于临时工具场景:持久工具先 register,临时工具再 append。

---

### POST /chat/{sid}/tools/unregister

删除指定工具。`names` 为空或 null = 全清。

**请求体:**

```json
{
  "names": ["submit_form"]
}
```

**响应:**

```json
{
  "unregistered": ["submit_form"]
}
```

---

### GET /chat/{sid}/tools

查询已注册工具元信息(不含 parameters)。

**响应:**

```json
{
  "tools": [{
    "name": "submit_form",
    "description": "Submit order fields",
    "strict": true,
    "registeredAt": "2026-06-12T10:00:00Z",
    "lastUsedAt": "2026-06-12T10:05:00Z"
  }]
}
```

---

## 聊天流式接口

### POST /chat/{sid}/stream

SSE 流式对话。

**请求体:**

```json
{
  "message": "你好",
  "activeTools": ["submit_form", "change_skin"]
}
```

**响应:** SSE 流

```
event: token
data: {"text": "你"}

event: token
data: {"text": "好"}

event: thinking
data: {"text": "用户打招呼..."}

event: tool_call_start
data: {"id": "tc_123", "name": "submit_form"}

event: tool_call_delta
data: {"id": "tc_123", "delta": "{\"order"}

event: tool_call_delta
data: {"id": "tc_123", "delta": "Id\":\"123\"}"}

event: tool_call
data: {"tool": "submit_form", "args": {"orderId": "123"}, "id": "tc_123"}

event: tool_call_end
data: {"id": "tc_123"}

event: done
data: {}
```

---

## 工具结果提交

### POST /chat/{sid}/tools/result

提交工具执行结果,恢复挂起的 agent。

**请求体:**

```json
{
  "toolUseId": "tc_123",
  "result": "订单 123 已提交到本系统,字段: orderId, customerName"
}
```

**响应:** SSE 流(与 `/stream` 完全一致)

```
event: thinking
data: {"text": "根据工具结果继续推理..."}

event: tool_call_start
data: {"id": "tc_456", "name": "query_order"}

event: tool_call_delta
data: {"id": "tc_456", "delta": "{\"orderId\""}

event: tool_call
data: {"tool": "query_order", "args": {"orderId": "123"}, "id": "tc_456"}

event: token
data: {"text": "订单"}

event: done
data: {}
```

> `/tools/result` 的 SSE 响应格式与 `/stream` 完全一致。LLM 可能再次调用工具(多步工具链),SDK 统一处理。

### 挂起检测与再挂起

后端 `SessionManager` 通过 `withSuspensionDetection()` 统一处理 `stream()` 和 `resume()` 的挂起逻辑:

1. 流结束时扫描最后一条 AI 消息中的 `ToolUseBlock`
2. 如果存在 → agent 再次挂起,保留在 `suspendedAgents` 池中
3. 如果不存在 → agent 正常结束,移出挂起池 + saveTo

这意味着一次对话中可能发生多次挂起/恢复循环:

```
用户消息 → stream → LLM 调工具 A → 挂起
  → POST /tools/result(A) → resume → LLM 调工具 B → 再次挂起
    → POST /tools/result(B) → resume → LLM 最终回复 → 正常结束
```

### 错误响应

| 状态码 | 错误 | 说明 |
|--------|------|------|
| 400 | `IllegalArgumentException` | toolUseId 或 result 缺失 |
| 404 | `NoPendingToolException` | 该 sid 没有挂起的 agent |
| 409 | `ToolUseIdMismatchException` | toolUseId 与挂起的工具不匹配 |

---

### POST /chat/{sid}/abort

中止当前 agent。幂等,失败静默。

---

## 认证

所有接口需要 `Authorization: Bearer <JWT>` 头。

### JWT 验证流程

1. SDK 调用 `getAccessToken()` 获取 JWT
2. 所有请求携带 `Authorization: Bearer <token>` 头
3. 后端 `JwtAuthFilter` 验证 JWT 签名和过期时间
4. 验证失败返回 401,SDK 自动刷新 Token 重试

---

## 工具注册校验

后端 `ToolRegistry.register()` / `append()` 会对工具定义校验:

| 字段 | 规则 |
|------|------|
| `name` | 白名单 `[a-z0-9_]{1,32}` |
| `description` | ≤ 500 字符,过滤 prompt injection 特征 |
| `parameters` | 顶层 `type: 'object'` |
| `strict` | 布尔值 |

校验失败抛 `IllegalArgumentException`,返回 400。

---

## TTL 清理

后端 `ToolRegistryCleaner` 定时清理无活动的 sid:

- 默认 TTL: 30 分钟
- 超过 30 分钟无活动的 sid,其下所有工具被清空
- 每次工具调用(包括 `touch`)刷新 `lastUsedAt`

---

[← 上一章: 事件与回调](08-events-callbacks.md) | [返回目录](index.md) | [下一章: 常见问题 →](10-faq.md)
