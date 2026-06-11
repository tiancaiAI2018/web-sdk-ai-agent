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
  unregisterRemote,
  listRemote,
  postAbort,
  postToolResult,
  retryToolResult,
  cancelToolResult,
  renderToolResultFailedCard,
  resumePendingToolResults,
  type ToolCtx,
} from './core/tools';
export {
  toggleExtractMode,
  startExtractSession,
  stopExtractSession,
  type ExtractCtx,
} from './core/extract';
export { Widget } from './ui/widget';
export { applyTheme, DEFAULT_THEME } from './ui/theme';
export type { ThemeName } from './ui/theme';
export {
  createMessageEl,
  appendMessage,
} from './ui/components/message';
export { createTypingEl, appendTyping } from './ui/components/typing';
export { WIDGET_CSS } from './ui/styles';

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
  StartExtractOptions,
} from './core/types';
