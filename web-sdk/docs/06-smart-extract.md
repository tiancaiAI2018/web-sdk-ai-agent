# 06 工具实战示例

> 持久工具 + 临时工具的典型使用场景

---

## 场景一:表单自动回填

通过持久工具,让 LLM 在对话中自动收集字段并回填表单:

```js
const agent = AIAgent.init({
  endpoint: 'http://localhost:8080',
  getAccessToken: async () => { /* ... */ },
  persistentTools: [{
    name: 'submit_form',
    description: 'Submit collected form fields. Call when all required fields are confirmed.',
    parameters: {
      type: 'object',
      properties: {
        orderId:      { type: 'string', description: '订单编号' },
        customerName: { type: 'string', description: '客户全名' },
        amount:       { type: 'number', description: '金额' }
      },
      required: ['orderId', 'customerName', 'amount']
    },
    onCall: (payload) => {
      // 回填表单
      Object.keys(payload).forEach(key => {
        const el = document.querySelector(`[data-field="${key}"]`);
        if (el) el.value = payload[key];
      });
      return '表单已提交,字段: ' + Object.keys(payload).join(', ');
    }
  }]
});
```

用户只需在浮窗中描述信息,LLM 会自动调用 `submit_form` 回填。

---

## 场景二:临时翻译工具

在特定会话中追加临时工具,新会话自动失效:

```js
// 追加临时工具
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
  onCall: (payload) => {
    // 调用翻译 API 或返回模拟结果
    return `[${payload.targetLang}] ${payload.text}`;
  }
}]);

// 移除临时工具
await agent.removeEphemeralTools(['translate']);
```

### 行为规则

| 场景 | 行为 |
|------|------|
| 当前有会话时追加 | 立即注册到后端 |
| 当前无会话时追加 | 下次新会话时自动注册 |
| 新会话 | 临时工具自动清空 |
| 同名工具 | 后注册的覆盖先注册的 |

---

## 场景三:持久 + 临时工具组合

持久工具提供基础能力,临时工具按需扩展:

```js
const agent = AIAgent.init({
  persistentTools: [
    { name: 'query_order', description: '查询订单', /* ... */ },
    { name: 'submit_form', description: '提交表单', /* ... */ }
  ],
  builtinTools: { changeSkin: true }
});

// 某次会话中追加临时工具
document.getElementById('btn-translate').addEventListener('click', () => {
  agent.addEphemeralTools([{
    name: 'translate',
    description: 'Translate text',
    /* ... */
  }]);
});
```

新会话后:
- `query_order`、`submit_form`、`changeSkin` 仍然可用(持久)
- `translate` 自动失效(临时)

---

## 场景四:AI 动态创建皮肤

让 AI 在对话中动态创建新皮肤,再切换到该皮肤:

```js
// 注册临时工具 create_skin
await agent.addEphemeralTools([{
  name: 'create_skin',
  description: '动态创建新皮肤并注册。创建后需用 change_skin 切换。',
  parameters: {
    type: 'object',
    properties: {
      name:         { type: 'string', description: '皮肤唯一名' },
      base:         { type: 'string', enum: ['iridescent-bloom', 'classic'], description: '基于哪个内置皮肤派生' },
      description:  { type: 'string', description: '风格描述' },
      primaryColor: { type: 'string', description: '主色调十六进制,如 #0ea5e9' },
      fontStack:    { type: 'string', enum: ['mixed', 'serif', 'mono', 'system'], description: '字体风格' }
    },
    required: ['name', 'base', 'description', 'primaryColor']
  },
  onCall: function(payload) {
    var baseSkin = payload.base === 'classic' ? AIAgent.CLASSIC : AIAgent.IRIDESCENT_BLOOM;
    var p = payload.primaryColor;
    var overrideCSS = baseSkin.css + '\n' + [
      ':host([data-skin="' + payload.name + '"]) {',
      '  --aia-paint-1: ' + p + ';',
      '  --aia-glow: ' + p + ';',
      '}'
    ].join('\n');
    var newSkin = AIAgent.deriveSkin(baseSkin, {
      name: payload.name,
      css: overrideCSS,
      layout: payload.fontStack ? { fontStack: payload.fontStack } : {},
      aiHint: payload.description,
    });
    agent.registerSkin(newSkin);
    return { ok: true, skinName: payload.name, message: '皮肤已创建,请用 change_skin 切换。' };
  }
}]);
```

用户说"帮我创建一个深海蓝绿风格的皮肤"时:
1. AI 调用 `create_skin` → SDK 用 `deriveSkin` 注册新皮肤
2. AI 再调用 `change_skin` → 浮窗实时切换到新皮肤

> `create_skin` 是临时工具,新会话自动失效。`change_skin` 是内置持久工具。

---

## 场景五:无 onCall 的工具(用户确认模式)

如果工具没有 `onCall`,SDK 会弹出确认框让用户决定:

```js
persistentTools: [{
  name: 'delete_account',
  description: 'Delete user account permanently',
  parameters: {
    type: 'object',
    properties: {
      confirmed: { type: 'boolean', description: '确认删除' }
    },
    required: ['confirmed']
  }
  // 不提供 onCall → SDK 弹出确认框
}]
```

用户确认后才执行;取消则中止当前 agent。

---

[← 上一章: 皮肤系统](05-skin-system.md) | [返回目录](index.md) | [下一章: 认证与 Token →](07-auth-token.md)
