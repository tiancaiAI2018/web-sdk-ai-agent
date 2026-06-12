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

### aurora

极光渐变 + 脉冲动画 + 等宽字体。科技/开发者风格。

| 布局项 | 值 |
|--------|-----|
| `cornerGlow` | `true` — 4 角极光 |
| `statusDotStyle` | `'pulse'` — 脉冲 |
| `sendIcon` | `'svg'` — 真 SVG 箭头 |
| `messageEnter` | `'fade'` — 淡入 |
| `bubbleAnimation` | `'breathe'` — 呼吸 |
| `fontStack` | `'mono'` — 等宽字体 |

---

## 注册自定义皮肤

### 方式一:完整定义

```js
agent.registerSkin({
  name: 'my-skin',
  css: `
    :host { --bg: #0f172a; --fg: #e2e8f0; ... }
    :host[data-theme="ink"] { --bg: #050505; ... }
    :host[data-theme="paper"] { --bg: #fefce8; ... }
  `,
  layout: {
    cornerGlow: true,
    statusDotStyle: 'pulse',
    fontStack: 'serif',
    // 其余字段可省略,自动补默认值
  },
  palette: 'ink',
  aiHint: '自定义皮肤描述',
});
```

### 方式二:deriveSkin 从已有皮肤派生(推荐)

只需指定差异,其余从基皮肤继承:

```js
const mySkin = AIAgent.deriveSkin(AIAgent.IRIDESCENT_BLOOM, {
  name: 'ocean',
  css: AIAgent.IRIDESCENT_BLOOM.css + '\n' + `
    :host([data-skin="ocean"]) {
      --aia-paint-1: #0ea5e9;
      --aia-paint-2: #06b6d4;
      --aia-glow: #0ea5e9;
    }
  `,
  layout: { fontStack: 'mono' },  // 只改字体,其余继承
  aiHint: '深海蓝绿主题',
});
agent.registerSkin(mySkin);
```

也可以跨基派生:

```js
// 从 classic(浅色)派生暖橙色调
const sunsetSkin = AIAgent.deriveSkin(AIAgent.CLASSIC, {
  name: 'sunset',
  css: AIAgent.CLASSIC.css + '\n' + `
    :host([data-skin="sunset"]) {
      --aia-paint-1: #f97316;
      --aia-paint-2: #ef4444;
    }
  `,
  layout: { cornerGlow: true },
  aiHint: '暖橙日落主题',
});
agent.registerSkin(sunsetSkin);
```

---

## Skin 接口

```ts
interface Skin {
  name: string;          // 唯一名字
  css: string;           // 注入到 shadow root 的 CSS
  layout: SkinLayout;    // 布局开关(字段均可选)
  palette?: Palette;     // 调色板 hint: 'ink' | 'paper' | 'dark' | 'light'
  aiHint?: string;       // 给 AI 看的简短描述
}
```

## SkinLayout 接口(全部可选)

```ts
interface SkinLayout {
  cornerGlow?: boolean;                          // 4 角油彩飞溅,默认 false
  statusDotStyle?: 'rainbow' | 'solid' | 'pulse'; // 状态点风格,默认 'solid'
  sendIcon?: 'svg' | 'arrow' | 'circle';        // 发送按钮图标,默认 'arrow'
  messageEnter?: 'paint' | 'fade' | 'none';     // 消息入场动画,默认 'fade'
  bubbleAnimation?: 'rotate' | 'breathe' | 'none'; // 气泡动画,默认 'none'
  fontStack?: 'mixed' | 'serif' | 'mono' | 'system'; // 字体优先,默认 'system'
}
```

> 所有字段均可选。未指定的字段自动使用 `DEFAULT_LAYOUT` 中的默认值。`deriveSkin` 会合并基皮肤的 layout 和你传入的 layout。

### DEFAULT_LAYOUT

```ts
const DEFAULT_LAYOUT: SkinLayout = {
  cornerGlow: false,
  statusDotStyle: 'solid',
  sendIcon: 'arrow',
  messageEnter: 'fade',
  bubbleAnimation: 'none',
  fontStack: 'system',
};
```

### CSS 编写要点

皮肤 CSS 必须包含:
- `:host` 基础样式
- `:host[data-theme="ink"]` / `:host[data-theme="paper"]` 等主题变量
- 所有组件样式(消息、工具卡、思考卡、输入框等)

建议用 `deriveSkin` 从内置皮肤派生,只需覆盖差异 CSS 变量。

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

## 查询皮肤列表

```js
// 获取所有已注册皮肤名
const names = agent.listSkins();
// → ['iridescent-bloom', 'classic', 'aurora', 'ocean']

// 获取皮肤名 + AI 描述
const info = agent.listSkinsWithInfo();
// → [{ name: 'iridescent-bloom', aiHint: '深色油彩...' }, ...]
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

## AI 动态创建皮肤

除了切换已有皮肤,还可以让 AI 动态创建新皮肤。典型做法是用临时工具注册 `create_skin`:

```js
agent.addEphemeralTools([{
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
    var baseSkin = payload.base === 'classic'
      ? AIAgent.CLASSIC
      : AIAgent.IRIDESCENT_BLOOM;

    // 用主色生成 CSS 变量覆盖
    var p = payload.primaryColor;
    var overrideCSS = baseSkin.css + '\n' + [
      ':host([data-skin="' + payload.name + '"]) {',
      '  --aia-paint-1: ' + p + ';',
      '  --aia-glow: ' + p + ';',
      '}'
    ].join('\n');

    var layoutOverride = payload.fontStack ? { fontStack: payload.fontStack } : {};

    var newSkin = AIAgent.deriveSkin(baseSkin, {
      name: payload.name,
      css: overrideCSS,
      layout: layoutOverride,
      aiHint: payload.description,
    });

    agent.registerSkin(newSkin);

    return {
      ok: true,
      skinName: payload.name,
      message: '皮肤 "' + payload.name + '" 已创建,请用 change_skin 切换。'
    };
  }
}]);
```

流程:AI 调 `create_skin` → SDK 用 `deriveSkin` 注册新皮肤 → AI 再调 `change_skin` 切换。

---

## UMD 全局导出

通过 `<script>` 标签使用时,皮肤相关 API 挂在 `window.AIAgent` 上:

| 属性 | 说明 |
|------|------|
| `AIAgent.IRIDESCENT_BLOOM` | 内置油彩皮肤对象 |
| `AIAgent.CLASSIC` | 内置极简皮肤对象 |
| `AIAgent.AURORA` | 内置极光皮肤对象 |
| `AIAgent.SkinRegistry` | 皮肤注册表(单例) |
| `AIAgent.deriveSkin` | 派生皮肤工具函数 |
| `AIAgent.resolveLayout` | 布局补全函数 |
| `AIAgent.DEFAULT_LAYOUT` | 默认布局常量 |

---

[← 上一章: 公共 API](04-public-api.md) | [返回目录](index.md) | [下一章: 工具实战示例 →](06-smart-extract.md)
