# 01 快速开始

## Script 标签接入(3 行)

```html
<script src="http://your-host/sdk/ai-agent-sdk.js"></script>
<script>
  const agent = AIAgent.init({
    endpoint: 'http://localhost:8080',
    getAccessToken: async () => {
      const r = await fetch('http://localhost:7000/api/ai-token', { method: 'POST' });
      return await r.json(); // { accessToken, refreshToken }
    }
  });
</script>
```

页面右下角自动出现浮窗气泡,点击即可聊天。无需写任何聊天框 DOM。

---

## ESM / npm 接入

```ts
import { AIAgent, changeSkinTool } from 'aiagent-sdk';

const agent = AIAgent.init({
  endpoint: 'http://localhost:8080',
  getAccessToken: async () => { /* ... */ },
});
```

React 适配器:

```ts
import { AIAgent } from 'aiagent-sdk/react';
```

---

## 最小配置项

只有 `endpoint` 和 `getAccessToken` 是必填的,其余全部可选:

```js
AIAgent.init({
  endpoint: 'http://localhost:8080',       // 必填:后端地址
  getAccessToken: async () => { ... },      // 必填:Token 获取钩子
});
```

---

## 完整配置示例

```js
const agent = AIAgent.init({
  // 必填
  endpoint: 'http://localhost:8080',
  getAccessToken: async () => {
    const r = await fetch('http://localhost:7000/api/ai-token', { method: 'POST' });
    return await r.json();
  },

  // 浮窗外观
  title: 'AI 助手',
  subtitle: '点我开始聊天',
  welcomeMessage: '你好!我是 AI 助手',
  placeholder: '输入消息,Enter 发送,Shift+Enter 换行',
  theme: 'light',
  position: 'bottom-right',
  autoOpen: false,
  avatar: '🤖',
  clientPrefix: 'demo-app',

  // 工具配置
  persistentTools: [{ name: 'submit_form', ... }],
  builtinTools: { changeSkin: true },

  // 皮肤
  skin: 'iridescent-bloom',
});

// 注册内置换肤工具
AIAgent.registerBuiltinTool(AIAgent.changeSkinTool(agent));
```

---

[← 返回目录](index.md) | [下一章: 初始化配置 →](02-init-options.md)
