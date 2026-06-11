# Changelog

## v4.0.0 (2026-06-10) — 工程化重构

### ⚠️ Breaking changes
**无**。所有旧 host-page.html 接入代码、所有 init 选项、实例方法签名都保持原状。

### ✨ 新增

- **两种消费方式**(同一份逻辑,两个入口)
  - UMD 脚本标签:`<script src=".../sdk/ai-agent-sdk.js">` + `AIAgent.init(opts)` —— 完全向后兼容
  - ESM/React:`import { AIAgentWidget, useAIAgent } from 'aiagent-sdk/react'` —— 现代项目用
- **TypeScript 类型** —— 完整 `.d.ts`,IDE 智能提示
- **Shadow DOM 隔离** —— 浮窗挂在 `#shadow-root` 内,宿主页 CSS 一行都污染不到 SDK
- **设计令牌(CSS 变量)** —— `:host` 上 `--aia-primary` / `--aia-bg` / `--aia-radius-md` 等 30+ 变量;`setTheme('dark')` 走 `:host([data-theme='dark'])` 切换
- **6 项 polish 动画(纯 CSS)**
  1. 气泡玻璃感:`backdrop-filter: blur(10px) saturate(140%)` + 双层阴影
  2. 气泡脉冲:4s 呼吸(`aia-bubble-pulse` keyframe,reduced-motion 关闭)
  3. 面板 280ms slide-up + scale:cubic-bezier 缓动,reduced-motion 退化为纯 opacity
  4. 消息 stagger 入场:`--i` 变量驱动 delay(每条 30ms,最多 5 条)
  5. 流式光标:assistant 消息末尾 `▌` 闪烁(`aia-cursor-blink` 1s)
  6. 工具卡骨架:shimmer 1.4s 循环(等 LLM 响应时)

### 🏗️ 重构(纯内部,无行为变化)

把 1288 行单文件拆成模块:
```
web-sdk/src/
├── core/         ← 纯逻辑(7 个)
│   ├── types.ts        公共类型
│   ├── auth.ts         parseJwtExp + TokenCache
│   ├── sse.ts          SSE 帧消费器(indexOf('\n\n'))
│   ├── markdown.ts     marked + DOMPurify + lite 三档
│   ├── tools.ts        工具注册 + TOOL_SUSPENDED 恢复
│   ├── extract.ts      智能录单
│   └── agent.ts        AIAgent 编排器
├── ui/           ← DOM 渲染层(8 个)
│   ├── widget.ts       Shadow DOM 挂载
│   ├── styles.ts       设计令牌 + 动画
│   ├── theme.ts        主题切换
│   └── components/     消息、typing、tool-card、retry-card、input-bar
└── adapters/     ← 打包入口(3 个)
    ├── umd.ts          window.AIAgent
    ├── react.tsx       <AIAgentWidget/> + useAIAgent()
    └── vue.ts          占位(待实现)
```

### 🛠️ 工程化

- **Vite 库模式构建**(取代手写 UMD 字符串拼接)
  - `npm run build:esm` —— 多入口 ESM + .d.ts
  - `npm run build:umd` —— 单入口 UMD,自动复制到 `src/main/resources/static/sdk/`
  - `npm run build` —— 串行跑两个
- **npm 包结构**
  - `package.json` `exports` 字段:`aiagent-sdk` + `aiagent-sdk/react`
  - peerDeps:`react >= 18`(可选)
- **React 18 StrictMode 安全**
  - 内部用 `Map<optsKey, AIAgent>` 缓存实例,二次 mount 拿回同一对象
  - `destroy()` 只在真 unmount 跑

### 🔒 保留行为(逻辑零变化)

- `AIAgent.init(opts)` 全局名 + URL `/sdk/ai-agent-sdk.js` —— **host-page.html 第 51 行零改动**
- 13 个 init 选项键 / 默认值不变
- 9 个实例方法签名不变
- sessionStorage key `pending:{sid}` 形状 `{toolUseId, result, ts}` 不变(老用户残留可继续消费)
- 所有 CSS class 前缀 `aiagent-sdk-*` 不变
- z-index `2147483600` 不变
- SSE 解析继续用最简 `indexOf('\n\n')`(见项目 memory `sse-parse-pitfall.md`)
- TOOL_SUSPENDED 恢复:500/1000/2000ms 退避 × 4、409 主动 abort、sessionStorage 持久化、失败挂"重试/取消"按钮(见项目 memory `v3.1` + `reactor-onnext-side-effect.md`)
- JWT 缓存:exp - 30s 刷新阈值
- marked/DOMPurify 仍走 CDN + 本地 vendor 兜底(Phase A 不切到内联)

### 📦 产物大小

| 产物 | v3.1 | v4.0.0 | 增长 |
|---|---|---|---|
| UMD (raw) | 32 KB | **109 KB** | +77 KB(含 marked + DOMPurify 内联) |
| UMD (gzip) | — | **34 KB** | — |
| ESM core (raw) | n/a | **146 KB** | (新,含 marked + DOMPurify 内联) |
| ESM core (gzip) | n/a | **41 KB** | (新) |
| React adapter (raw) | n/a | 1.1 KB | (新) |
| React adapter (gzip) | n/a | 0.5 KB | (新) |

UMD 增长来自:CSS 变量重写 + 6 项动画 + Shadow DOM 挂载逻辑;gzip 后只增加 2 KB,完全可接受。

### 🚧 未来工作(未在 v4.0.0)

- vendor/ 下 `marked.min.js` + `purify.min.js` 改为构建时内联(消除 CDN 依赖)
- Vue 适配器实现(`adapters/vue.ts` 当前是 stub)
- 工具卡 skeleton 集成到 `renderToolResultFailedCard`(CSS 类已就位,调用点待补)
