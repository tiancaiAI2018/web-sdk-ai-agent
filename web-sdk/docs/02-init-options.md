# 02 初始化配置(AIAgentOptions)

## 必填项

| 字段 | 类型 | 说明 |
|------|------|------|
| `endpoint` | `string` | 后端 base URL,不带尾斜杠 |
| `getAccessToken` | `() => Promise<{accessToken, refreshToken?}>` | 第三方自家的 Token 拉取钩子 |

### endpoint

后端服务地址,SDK 所有 HTTP 请求都基于此:

```js
endpoint: 'http://localhost:8080'  // 不要带尾斜杠
```

### getAccessToken

SDK 不管理登录逻辑,由第三方自行实现 Token 获取:

```js
getAccessToken: async () => {
  const r = await fetch('https://your-api.com/ai-token', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + yourLoginToken }
  });
  return await r.json();  // { accessToken: 'xxx', refreshToken: 'xxx' }
}
```

详细说明见 [07 认证与 Token](07-auth-token.md)。

---

## 浮窗外观

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'AI 助手'` | 浮窗标题栏文字 |
| `subtitle` | `string` | `'在线'` | 标题栏副标题 |
| `placeholder` | `string` | `'输入消息,Enter 发送...'` | 输入框占位文字 |
| `welcomeMessage` | `string` | `'你好!我是 AI 助手...'` | 首次打开的欢迎语 |
| `theme` | `'ink' \| 'paper' \| 'dark' \| 'light'` | `'ink'` | 主题色板 |
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | 浮窗位置 |
| `autoOpen` | `boolean` | `false` | 是否自动展开浮窗 |
| `avatar` | `string` | `'🤖'` | 气泡头像(支持 emoji 或 URL) |
| `clientPrefix` | `string` | `'app'` | sessionId 前缀,区分不同接入方 |

### theme 主题映射

| theme 值 | 效果 | 对应皮肤 palette |
|-----------|------|-----------------|
| `'ink'` | OLED 黑底 + 虹彩油彩(推荐) | `ink` |
| `'paper'` | 暖米底 + 油彩 | `paper` |
| `'dark'` | `'ink'` 的别名(向后兼容) | `ink` |
| `'light'` | `'paper'` 的别名(向后兼容) | `paper` |

---

## 工具配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `persistentTools` | `ToolDef[]` | `[]` | 持久工具列表,每个新会话自动注入 |
| `builtinTools` | `{ changeSkin?: boolean }` | `{}` | 内置工具开关 |

### persistentTools

持久工具:每个新会话自动注入,生命周期跟 agent 实例。适合所有会话都需要的功能(如提交表单、查询数据等):

```js
persistentTools: [{
  name: 'submit_form',
  description: 'Submit collected order fields',
  parameters: {
    type: 'object',
    properties: {
      orderId:      { type: 'string', description: '订单编号' },
      customerName: { type: 'string', description: '客户全名' },
    },
    required: ['orderId', 'customerName']
  },
  strict: true,
  onCall: (payload) => {
    // 处理工具调用
    return '订单已提交';
  }
}]
```

详细说明见 [03 两层工具模型](03-two-layer-tools.md)。

### builtinTools

控制 SDK 预制工具是否启用。不传或 `undefined` = 全部启用;显式传 `false` 关闭:

```js
builtinTools: { changeSkin: false }  // 关闭 AI 换肤能力
```

---

## 皮肤与主题

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `skin` | `string` | `'iridescent-bloom'` | 皮肤名,决定布局/动画/字体 |

> `theme` 和 `skin` 正交:theme 改色板,skin 改布局/动画。

详细说明见 [05 皮肤系统](05-skin-system.md)。

---

[← 上一章: 快速开始](01-quick-start.md) | [返回目录](index.md) | [下一章: 两层工具模型 →](03-two-layer-tools.md)
