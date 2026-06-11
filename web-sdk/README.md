# AI Agent SDK (web-sdk)

工程化版前端 SDK。两种消费方式,同一份逻辑。

## 目录

- [快速开始](#快速开始)
  - [方式 1:脚本标签(UMD,向后兼容)](#方式-1脚本标签umd)
  - [方式 2:ESM / React 集成](#方式-2esmxreact)
- [API 速查](#api-速查)
- [构建产物](#构建产物)
- [本地开发](#本地开发)
- [模块结构](#模块结构)

## 快速开始

### 方式 1:脚本标签(UMD)

适合传统 `<script>` 接入,不经过 npm。

```html
<script src="http://your-host/sdk/ai-agent-sdk.js"></script>
<script>
  const agent = AIAgent.init({
    endpoint: 'http://localhost:8080',
    getAccessToken: async () => {
      const r = await fetch('http://localhost:7000/api/ai-token', { method: 'POST' });
      return await r.json();
    },
    title: 'AI 助手',
    theme: 'light',
    position: 'bottom-right',
    demoTools: true,
  });
</script>
```

**集成代码与旧版完全一致** — 同名 `AIAgent.init(opts)` 全局,同 URL(`/sdk/ai-agent-sdk.js`),同选项键。

### 方式 2:ESM / React 集成

适合现代 React / Vue / Svelte 项目,本地 file: 安装。

```bash
# 在 React 项目里:
npm install file:../path/to/web-sdk
# 或用 npm link
```

```tsx
// App.tsx
import { AIAgentWidget, useAIAgent } from 'aiagent-sdk/react';

function App() {
  return (
    <AIAgentWidget
      endpoint="http://localhost:8080"
      getAccessToken={async () => {
        const r = await fetch('/api/ai-token', { method: 'POST' });
        return await r.json();
      }}
      title="AI 助手"
      theme="light"
      demoTools
    />
  );
}
```

也支持命令式 hook:

```tsx
function ChatPanel() {
  const agent = useAIAgent({ endpoint, getAccessToken });
  useEffect(() => {
    agent?.stream({ sessionId: 'xxx', message: '你好' });
  }, [agent]);
  return null;
}
```

未来 Vue 适配器入口 `aiagent-sdk/vue`(当前 stub)。

## API 速查

### `AIAgent.init(opts) → AIAgent`

| 选项 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `endpoint` | string | **必填** | 后端 base URL(不带尾 `/`) |
| `getAccessToken` | `() => Promise<{accessToken, refreshToken?}>` | **必填** | 第三方自家的 token 拉取钩子 |
| `title` | string | `"AI 助手"` | 浮窗标题 |
| `subtitle` | string | `"在线"` | 浮窗副标题 |
| `placeholder` | string | `"输入消息,Enter 发送,Shift+Enter 换行"` | 输入框 placeholder |
| `welcomeMessage` | string | `"你好!我是 AI 助手..."` | 首次进入的欢迎语 |
| `theme` | `"light" \| "dark"` | `"light"` | 主题 |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | 气泡位置 |
| `autoOpen` | boolean | `false` | init 后自动展开面板 |
| `avatar` | string | `"🤖"` | 气泡图标(emoji/HTML) |
| `clientPrefix` | string | `"app"` | sessionId 前缀 |
| `demoTools` | boolean | `false` | 启用内置 demo 录单工具 + 📋 按钮 |
| `demoOrderTools` | `ToolDef[]` | 内置默认 | 自定义录单工具 schema |

### 实例方法(全部 9 个,与旧版一致)

| 方法 | 说明 |
|---|---|
| `stream({sessionId, message, onChunk, onDone, onError, onToolCall, activeTools})` | 程序化流式聊天(无 UI) |
| `registerTools({sessionId, tools})` | 注册工具 schema 到后端 |
| `unregisterTools({sessionId, names?})` | 注销工具(`names=null` = 全清) |
| `listTools({sessionId})` | 列已注册工具 |
| `startExtractSession({sessionId?, tools, activeTools?, initialMessage?})` | 一键进入录单 |
| `stopExtractSession()` | 关闭录单 |
| `open() / close() / toggle()` | 浮窗开关 |
| `setTheme({theme:'light'\|'dark'})` | 切主题 |
| `destroy()` | 卸载浮窗 + 清资源 |

## 构建产物

`npm run build` 跑完后产出:

```
web-sdk/dist/
├── ai-agent-sdk.esm.js   (45.74 KB / gzip 13.30 KB)   ← React/Vue 项目 import 用
├── ai-agent-sdk.umd.js   (34.26 KB / gzip 10.54 KB)   ← 脚本标签用
├── react.esm.js          (1.13 KB  / gzip 0.51 KB)    ← <AIAgentWidget/> + useAIAgent
├── index.d.ts            (主入口类型)
├── react.d.ts            (React 入口类型)
└── core/ ui/ adapters/   (各模块的 .d.ts)
```

UMD 产物在 build 后会自动复制到 `src/main/resources/static/sdk/ai-agent-sdk.js`(覆盖旧文件,URL 不变)。

## 本地开发

```bash
# 1) 装依赖
cd web-sdk
npm install

# 2) 改完源码后构建
npm run build           # 跑 ESM + UMD + 复制到 static/sdk/

# 3) 跑 React demo(直接用 src 而非 dist,HMR 立即反映)
cd ../examples/react-host-page
npm install
npm run dev             # 打开 http://localhost:5173
```

`vite.config.ts` 里把 `aiagent-sdk` alias 到 `web-sdk/src/index.ts`,`aiagent-sdk/react` alias 到 `web-sdk/src/adapters/react.tsx`,所以改 web-sdk 源码后 React demo 立即热更新,不必先 `npm run build`。

## 模块结构

```
web-sdk/src/
├── core/                  ← 纯逻辑(无 DOM 依赖,可单测)
│   ├── types.ts           ← 公共类型
│   ├── auth.ts            ← JWT 解析 + TokenCache
│   ├── sse.ts             ← SSE 帧解析(indexOf('\n\n'))
│   ├── markdown.ts        ← marked + DOMPurify + lite 三档
│   ├── tools.ts           ← 工具注册 + TOOL_SUSPENDED 恢复(退避 + 409 + sessionStorage)
│   ├── extract.ts         ← 智能录单
│   └── agent.ts           ← AIAgent 编排器
├── ui/                    ← DOM 渲染层
│   ├── widget.ts          ← 浮窗挂载(bubble + panel)
│   ├── styles.ts          ← CSS 字符串
│   ├── theme.ts           ← 主题切换
│   └── components/
│       ├── message.ts     ← 消息 DOM
│       └── typing.ts      ← 打字指示器
├── adapters/              ← 各种打包入口
│   ├── umd.ts             ← window.AIAgent
│   ├── react.tsx          ← <AIAgentWidget/> + useAIAgent
│   └── vue.ts             ← 占位
└── index.ts               ← ESM 主出口
```

## 关键设计

- **SSE 解析沿用最简的 `indexOf('\n\n')`** — 切到 EventSource 反而会引入多行 data 解析问题,见项目 memory `sse-parse-pitfall.md`。
- **TOOL_SUSPENDED 恢复** — 500/1000/2000ms 退避 × 4、409 主动 abort、`pending:{sid}` 持久化、失败挂"重试/取消"按钮,逻辑与旧版完全一致。
- **样式隔离(Phase A 阶段)** — 仍用 `aiagent-sdk-*` class 前缀,避免污染宿主页。Phase C 会切到 Shadow DOM。
- **零运行时依赖** — marked / DOMPurify 仍走 CDN + 本地 vendor 兜底。后续可切到构建内联。

## 与旧 SDK 的兼容性

- 全局名 `AIAgent.init(opts)` 保留
- 所有 init 选项键 / 默认值不变
- 9 个实例方法签名不变
- sessionStorage key `pending:{sid}` 形状不变(升级前残留的待恢复请求能继续被消费)
- 所有 CSS class 名前缀 `aiagent-sdk-*` 不变
- z-index `2147483600` 不变
