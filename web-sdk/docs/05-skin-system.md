# 05 皮肤系统

---

## 概述

皮肤(skin)和主题(theme)是两个正交维度:

| 维度 | 控制范围 | API |
|------|---------|-----|
| **theme** | 色板(颜色变量) | `setTheme({ theme })` |
| **skin** | 布局/动画/字体/DOM 结构 | `setSkin(name)` |

可以任意组合:比如 `skin: 'iridescent-bloom'` + `theme: 'paper'` = 油彩布局 + 暖米色板。

---

## 内置皮肤

### iridescent-bloom(默认)

深色油彩画布 + 4 角油彩飞溅 + 虹彩动画 + 毛玻璃。视觉强烈。

| 布局项 | 值 |
|--------|-----|
| `cornerGlow` | `true` — 4 角油彩飞溅 |
| `statusDotStyle` | `'rainbow'` — 虹彩旋转 |
| `sendIcon` | `'svg'` — 真 SVG 箭头 |
| `messageEnter` | `'paint'` — 墨水渗纸 |
| `bubbleAnimation` | `'rotate'` — 棱镜旋转 |
| `fontStack` | `'mixed'` — 中英混排 |

### classic

浅灰白底 + 蓝色强调 + 系统字体 + 无装饰动画。商务/简洁风格。

| 布局项 | 值 |
|--------|-----|
| `cornerGlow` | `false` |
| `statusDotStyle` | `'solid'` — 单色 |
| `sendIcon` | `'arrow'` — 字符箭头 |
| `messageEnter` | `'fade'` — 淡入 |
| `bubbleAnimation` | `'none'` — 静态 |
| `fontStack` | `'system'` — 系统字体 |

---

## 注册自定义皮肤

```js
agent.registerSkin({
  name: 'aurora',
  css: `
    :host { --bg: #0f172a; --fg: #e2e8f0; ... }
    :host[data-theme="ink"] { --bg: #050505; ... }
    :host[data-theme="paper"] { --bg: #fefce8; ... }
    /* 完整 CSS,参考 iridescent-bloom 或 classic 的 CSS */
  `,
  layout: {
    cornerGlow: true,
    statusDotStyle: 'pulse',
    sendIcon: 'svg',
    messageEnter: 'fade',
    bubbleAnimation: 'breathe',
    fontStack: 'mixed',
  },
  palette: 'ink',       // 可选:默认调色板
  aiHint: '极光渐变 + 脉冲动画',  // 可选:给 AI 看的描述
});
```

### Skin 接口

```ts
interface Skin {
  name: string;          // 唯一名字
  css: string;           // 注入到 shadow root 的 CSS
  layout: SkinLayout;    // 布局开关
  palette?: Palette;     // 调色板 hint: 'ink' | 'paper' | 'dark' | 'light'
  aiHint?: string;       // 给 AI 看的简短描述
}
```

### SkinLayout 接口

```ts
interface SkinLayout {
  cornerGlow: boolean;                          // 4 角油彩飞溅
  statusDotStyle: 'rainbow' | 'solid' | 'pulse'; // 状态点风格
  sendIcon: 'svg' | 'arrow' | 'circle';        // 发送按钮图标
  messageEnter: 'paint' | 'fade' | 'none';     // 消息入场动画
  bubbleAnimation: 'rotate' | 'breathe' | 'none'; // 气泡呼吸动画
  fontStack: 'mixed' | 'serif' | 'mono' | 'system'; // 字体优先
}
```

### CSS 编写要点

皮肤 CSS 必须包含:
- `:host` 基础样式
- `:host[data-theme="ink"]` / `:host[data-theme="paper"]` 等主题变量
- 所有组件样式(消息、工具卡、思考卡、输入框等)

建议从 `iridescent-bloom` 或 `classic` 的 CSS 复制后修改。

---

## 运行时切换

```js
agent.setSkin('aurora');
```

### 热切换行为

- 不销毁浮窗 DOM,不丢失消息历史
- Widget 内部替换 CSS + 更新 data 属性
- 思考卡、工具卡状态完整保留

### 切换不存在的皮肤

```js
agent.setSkin('nonexistent');
// console.warn: [AIAgent SDK] setSkin: skin not found: nonexistent
// 静默忽略,不报错
```

---

## AI 换肤工具(changeSkinTool)

SDK 内置 `changeSkinTool`,让 AI 能主动切换皮肤。

### 注册

```js
AIAgent.registerBuiltinTool(AIAgent.changeSkinTool(agent));
```

注册后,AI 可以看到 `change_skin` 工具,用户说"换个皮肤"时 AI 会自动调用。

### 工具 schema

```js
{
  name: 'change_skin',
  description: 'Change the chat widget skin/appearance. Available skins: ...',
  parameters: {
    type: 'object',
    properties: {
      skin_name: {
        type: 'string',
        description: 'Skin name to switch to. Available: iridescent-bloom, classic, ...'
      }
    },
    required: ['skin_name']
  }
}
```

### onCall 行为

`onCall` 内部调用 `agent.setSkin(skin_name)`,返回切换结果。

### 控制开关

```js
// init 时关闭
AIAgent.init({
  builtinTools: { changeSkin: false }
});

// 运行时切换(下次新会话生效)
agent._opts.builtinTools = { changeSkin: false };
```

关闭后 AI 看不到 `change_skin` 工具,无法主动换肤。用户仍可通过 `agent.setSkin()` 手动切换。

---

[← 上一章: 公共 API](04-public-api.md) | [返回目录](index.md) | [下一章: 工具实战示例 →](06-smart-extract.md)
