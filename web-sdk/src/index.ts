/**
 * 核心出口 — ESM 消费者 `import { AIAgent, type AIAgentOptions, ... } from 'aiagent-sdk'`
 *
 * UMD 入口在 adapters/umd.ts,React 适配器在 adapters/react.tsx。
 */

export { AIAgent, createAIAgent } from './core/agent';
export { parseJwtExp, TokenCache } from './core/auth';
export { consumeSseStream } from './core/sse';
export {
  ensureMarkdown,
  renderMarkdownLite,
  renderMarkdownFallback,
  decorateImages,
} from './core/markdown';
export {
  ToolsRegistry,
  registerRemote,
  appendRemote,
  unregisterRemote,
  listRemote,
  postAbort,
  postToolResult,
  retryToolResult,
  cancelToolResult,
  renderToolResultFailedCard,
  resumePendingToolResults,
  changeSkinTool,
  dictTool,
  pageErrorsTool,
  validateTool,
  runValidation,
  saveMemoryTool,
  recallMemoryTool,
  MemoryEngine,
  type ToolCtx,
  type DictToolOptions,
  type ValidationRule,
  type ValidationResult,
  type ValidationError,
  type ValidationSeverity,
  type ValidateToolOptions,
  type MemoryEntry,
  type MemoryCategory,
  type MemoryScope,
  type MemoryOptions,
  type MemorySaveInput,
  type CapacityErrorResult,
  type ForgetCandidate,
  type CompressCandidate,
} from './core/tools';
export { Widget } from './ui/widget';
export { applyTheme, DEFAULT_THEME } from './ui/theme';
export type { ThemeName } from './ui/theme';
export {
  createMessageEl,
  appendMessage,
} from './ui/components/message';
export { createTypingEl, appendTyping } from './ui/components/typing';
export { WIDGET_CSS, SKIN_NAME, DEFAULT_SKIN_NAME } from './ui/styles';
// 皮肤系统 — 用户可 registerSkin() 加自定义皮肤,setSkin() 运行时切换
export {
  IRIDESCENT_BLOOM,
  CLASSIC,
  AURORA,
  SkinRegistry,
  deriveSkin,
  resolveLayout,
  DEFAULT_LAYOUT,
} from './core/skin';
export type { Skin, SkinLayout, Palette } from './core/skin';
export { PageAwareness } from './core/page-awareness';
export type { PageAwarenessHost } from './core/page-awareness';

// 类型导出
export type {
  AIAgentOptions,
  ToolDef,
  LocalTool,
  PendingToolCall,
  Message,
  MessageRole,
  SSEEvent,
  ToolCallPayload,
  StreamOptions,
  RegisterToolsOptions,
  UnregisterToolsOptions,
  ListToolsOptions,
  ToolPanelItem,
  PageAwarenessOptions,
  PageError,
  PageErrorSource,
  PageErrorSeverity,
} from './core/types';
