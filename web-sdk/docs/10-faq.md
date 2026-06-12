# 10 常见问题(FAQ)

---

### Q: init 后工具为什么没有立即注册到后端?

v4 采用延迟注册策略:工具在 `init` 时只缓存到本地 `_persistentTools`,新会话首次发消息时才通过 `_syncToolsForSession` 注册到后端。这样确保每个新会话都能看到工具,不会丢失。

---

### Q: 新会话后临时工具为什么消失了?

临时工具(`addEphemeralTools`)设计为仅当前会话生效。新会话时 SDK 自动清空 `_ephemeralTools`,持久工具(`_persistentTools`)保留并自动重新注册。

---

### Q: 如何关闭 AI 换肤能力?

```js
AIAgent.init({
  builtinTools: { changeSkin: false }
});
```

或运行时切换(下次新会话生效):

```js
agent._opts.builtinTools = { changeSkin: false };
```

---

### Q: 如何让工具跨所有会话生效?

把工具放在 `init({ persistentTools: [...] })` 里,它就是持久工具,每个新会话自动注入。

---

### Q: 如何动态追加一个只在当前会话可用的工具?

```js
await agent.addEphemeralTools([{
  name: 'temp_tool',
  description: '临时工具',
  parameters: { type: 'object', properties: {...} },
  onCall: (args) => 'result'
}]);
```

---

### Q: registerTools 和 addEphemeralTools 有什么区别?

| | `registerTools` | `addEphemeralTools` |
|---|---|---|
| 语义 | 全量替换该 sid 的工具集 | 追加,不清空已有 |
| 生命周期 | 手动管理 | 仅当前会话,新会话自动清空 |
| 后端接口 | `/tools/register` | `/tools/append` |
| 本地存储 | `_tools` (按 sid) | `_ephemeralTools` (全局) |
| 适用场景 | 低级别控制 | 临时/动态工具 |

---

### Q: 皮肤(skin)和主题(theme)有什么区别?

- **theme**: 改色板(ink/paper/dark/light),影响 CSS 颜色变量
- **skin**: 改布局/动画/字体,影响 DOM 结构和 CSS 样式
- 两者正交,可以任意组合

---

### Q: onCall 返回值有什么用?

返回值会被 POST 到 `/tools/result`,后端 LLM 看到后继续对话:
- 返回描述性文字 → LLM 据此生成确认回复
- 不返回值 → SDK 用占位符 `"[Tool executed by client SDK; no result returned]"`,LLM 也能继续但不知道具体结果

---

### Q: 工具注册后多久会被清理?

后端默认 TTL 30 分钟。超过 30 分钟无活动的 sid,其下所有工具被 `ToolRegistryCleaner` 清空。每次工具调用(包括 `touch`)会刷新 `lastUsedAt`。

---

### Q: 页面刷新后工具还在吗?

SDK 不持久化工具注册信息。页面刷新后:
- 持久工具:下次发消息时自动重新注册
- 临时工具:丢失(因为 `_ephemeralTools` 在内存中)

---

### Q: 如何在 React 中使用?

```tsx
import { AIAgent } from 'aiagent-sdk/react';
import { useEffect, useRef } from 'react';

function App() {
  const agentRef = useRef(null);

  useEffect(() => {
    agentRef.current = AIAgent.init({
      endpoint: 'http://localhost:8080',
      getAccessToken: async () => { /* ... */ },
    });
    return () => agentRef.current?.destroy();
  }, []);

  return <div>...</div>;
}
```

---

### Q: 如何自定义浮窗位置和大小?

浮窗位置通过 `position` 配置:

```js
AIAgent.init({
  position: 'bottom-left'  // 或 'bottom-right'
});
```

大小和更多样式需要通过自定义皮肤 CSS 覆盖。

---

[← 上一章: 后端接口约定](09-backend-api.md) | [返回目录](index.md)
