/**
 * UMD 入口 — 暴露 window.AIAgent 给 <script> 标签加载方式(老 host-page.html 不变)
 *
 * 行为必须和老 ai-agent-sdk.js 完全一致:
 *   <script src=".../sdk/ai-agent-sdk.js"></script>
 *   <script>
 *     AIAgent.init({...}) // 返回 AIAgent 实例
 *   </script>
 *
 * 关键技术点:
 *   Vite/Rollup 的 UMD wrapper 长这样:
 *     (function(root, factory) {
 *       ...
 *       factory(root.AIAgent = {});  // ← root.AIAgent 是空对象传给 factory
 *     })(this, function(exports) {
 *       // ESM 模块代码
 *       return theDefault;  // ← return 值被忽略!
 *     });
 *   所以光靠 `export default factory` 不会让 window.AIAgent.init 出现。
 *
 *   修法:用副作用直接给 globalThis.AIAgent 赋值,绕开 wrapper 的 return 路径。
 *   umd.ts 不会被 ESM 入口(vite.config.ts)收编,只用于 UMD 构建,所以副作用安全。
 *
 *   类型导出:仍然保留,供 vite-plugin-dts 产 .d.ts(虽然 UMD 消费方不读 .d.ts,
 *   但 dist/index.d.ts 主入口会 re-export 这些类型给 npm 消费方)。
 */

import { AIAgent, createAIAgent } from '../core/agent';
import { changeSkinTool, dictTool } from '../core/tools';
import {
  IRIDESCENT_BLOOM,
  CLASSIC,
  AURORA,
  SkinRegistry,
  deriveSkin,
  resolveLayout,
  DEFAULT_LAYOUT,
} from '../core/skin';
import { loadFonts } from '../ui/fonts';
import type { AIAgentOptions, ToolDef } from '../core/types';

// IRIDESCENT BLOOM 主题 — 提前加载字体(Inter / JetBrains Mono / Fraunces)
loadFonts();

const factory = createAIAgent();

// UMD 入口副作用:把 factory 挂到 globalThis.AIAgent
// 这样 <script> 加载后 window.AIAgent.init(...) 可调
// 同时挂载工具工厂(changeSkinTool 等)+ registerBuiltinTool 静态方法,
// 用户在 html 里可以直接
//   AIAgent.changeSkinTool(agent)
//   AIAgent.registerBuiltinTool(AIAgent.changeSkinTool(agent))
// 跟 ESM 入口 `import { changeSkinTool, registerBuiltinTool } from 'aiagent-sdk'` 等价
(globalThis as unknown as { AIAgent: unknown }).AIAgent = Object.assign(
  factory,
  {
    changeSkinTool,
    dictTool,
    registerBuiltinTool: AIAgent.registerBuiltinTool,
    // 皮肤系统 — <script> 用户可直接 AIAgent.IRIDESCENT_BLOOM / AIAgent.deriveSkin(...)
    IRIDESCENT_BLOOM,
    CLASSIC,
    AURORA,
    SkinRegistry,
    deriveSkin,
    resolveLayout,
    DEFAULT_LAYOUT,
  }
);

// 加载横幅(方便 devtools 立刻看到当前 SDK 版本,排查浏览器缓存)
const sdkVersion = '5.0.0';
const sdkBuiltAt = '__BUILD_TIME__'; // 打包时由 vite 替换为 ISO 时间戳
// eslint-disable-next-line no-console
console.info(
  `%c[AIAgent SDK v${sdkVersion}]%c loaded (built ${sdkBuiltAt}). ` +
    `Theme: Iridescent Bloom. AIAgent.init({...}) is on window.AIAgent.`,
  'background:linear-gradient(135deg,#5eead4,#a78bfa,#f0abfc);color:#050505;padding:2px 8px;border-radius:3px;font-weight:700',
  'color:#a1a1aa'
);

export default factory;
export type { AIAgentOptions };
