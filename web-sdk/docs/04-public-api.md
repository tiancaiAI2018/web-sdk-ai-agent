# 04 公共 API

---

## 浮窗控制

```js
agent.open();    // 展开浮窗
agent.close();   // 收起浮窗
agent.toggle();  // 切换展开/收起
```

| 方法 | 说明 |
|------|------|
| `open()` | 展开浮窗,设置 `_isOpen = true` |
| `close()` | 收起浮窗,设置 `_isOpen = false` |
| `toggle()` | 切换展开/收起状态 |

---

## 主题与皮肤

### setTheme — 切换主题(改色板)

```js
agent.setTheme({ theme: 'dark' });
```

可选值: `'ink'` | `'paper'` | `'dark'` | `'light'`

### setSkin — 切换皮肤(改布局/动画,热切换不丢消息)

```js
agent.setSkin('classic');
```

可选值: `'iridescent-bloom'` | `'classic'` | 自定义注册名

如果传入未注册的皮肤名,会 warn 并忽略。

### registerSkin — 注册自定义皮肤

```js
agent.registerSkin({
  name: 'aurora',
  css: '...',
  layout: { cornerGlow: true, statusDotStyle: 'pulse', ... },
  aiHint: '极光渐变 + 脉冲动画',
});
```

详细说明见 [05 皮肤系统](05-skin-system.md)。

---

## 工具注册/注销/查询

### registerTools — 全量注册

```js
await agent.registerTools({
  sessionId: 'xxx',
  tools: [{
    name: 'my_tool',
    description: '...',
    parameters: { type: 'object', properties: {...} },
    onCall: (args) => 'result'
  }]
});
```

> 注意:`registerTools` 是全量替换语义,会清空该 sid 下已有工具。如需追加,用 `addEphemeralTools`。

### unregisterTools — 注销工具

```js
// 删除指定工具
await agent.unregisterTools({
  sessionId: 'xxx',
  names: ['my_tool']
});

// 全清该 sid 下所有工具
await agent.unregisterTools({
  sessionId: 'xxx',
  names: null
});
```

### listTools — 查询已注册工具

```js
const result = await agent.listTools({ sessionId: 'xxx' });
// result.tools = [{ name, description, strict, registeredAt, lastUsedAt }, ...]
```

> 返回元信息,不含 `parameters`(避免大块 schema 传输)。

---

## 临时工具管理

### addEphemeralTools — 追加临时工具

```js
await agent.addEphemeralTools([{
  name: 'translate',
  description: 'Translate text',
  parameters: { type: 'object', properties: {...} },
  onCall: (args) => 'result'
}]);
```

行为:
- 当前有会话 → 立即调 `/tools/append` 注册到后端
- 当前无会话 → 存入本地,下次新会话时自动注册
- 同名工具 → 覆盖更新
- 仅当前会话生效,新会话自动清空

### removeEphemeralTools — 移除临时工具

```js
await agent.removeEphemeralTools(['translate']);
```

行为:
- 从本地 `_ephemeralTools` 移除
- 从 `_activeTools` 移除
- 当前有会话 → 调 `/tools/unregister` 从后端移除
- 不影响持久工具

---

## 无 UI 流式(stream)

不经过浮窗,程序化消费 SSE 流:

```js
await agent.stream({
  sessionId: 'xxx',
  message: '你好',
  activeTools: ['submit_form'],
  onChunk: (ev) => { /* SSE 事件 */ },
  onDone: () => { /* 流结束 */ },
  onError: (e) => { /* 错误 */ },
  onToolCall: (parsed) => { /* 完整工具调用 */ },
  onToolCallStart: (parsed) => { /* 工具调用开始(流式) */ },
  onToolCallDelta: (parsed) => { /* 工具调用参数增量(流式) */ },
  onToolCallEnd: (parsed) => { /* 工具调用结束(流式) */ },
  onThinking: (text) => { /* 思考过程 */ },
});
```

### StreamOptions 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `sessionId` | `string` | 必填:会话 ID |
| `message` | `string` | 必填:用户消息 |
| `activeTools` | `string[]` | 激活的工具名列表 |
| `onChunk` | `(ev: SSEEvent) => void` | SSE 原始事件 |
| `onDone` | `() => void` | 流结束 |
| `onError` | `(e: Error) => void` | 错误 |
| `onToolCall` | `(parsed: ToolCallPayload) => void` | 完整工具调用 |
| `onToolCallStart` | `(parsed: ToolCallStartPayload) => void` | 流式工具调用开始 |
| `onToolCallDelta` | `(parsed: ToolCallDeltaPayload) => void` | 流式工具调用增量 |
| `onToolCallEnd` | `(parsed: ToolCallEndPayload) => void` | 流式工具调用结束 |
| `onThinking` | `(text: string) => void` | 思考过程文本 |

---

## 生命周期

### destroy — 销毁实例

```js
agent.destroy();
```

行为:
- 移除浮窗 DOM
- 清理事件监听
- 不清理后端已注册的工具(需手动 `unregisterTools`)

---

## 静态方法

### AIAgent.init — 工厂方法

```js
const agent = AIAgent.init({ ... });
```

返回 `AIAgent` 实例。

### AIAgent.registerBuiltinTool — 注册内置工具

```js
AIAgent.registerBuiltinTool(toolDef);
```

将工具定义加入 `AIAgent._builtinTools` 静态列表,所有实例共享。新会话时自动注册为持久工具。

### AIAgent.changeSkinTool — 换肤工具工厂

```js
const tool = AIAgent.changeSkinTool(agent);
AIAgent.registerBuiltinTool(tool);
```

预制的 `change_skin` 工具定义,`onCall` 内部调 `agent.setSkin()`。

---

[← 上一章: 两层工具模型](03-two-layer-tools.md) | [返回目录](index.md) | [下一章: 皮肤系统 →](05-skin-system.md)
