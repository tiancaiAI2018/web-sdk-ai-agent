/**
 * 工具调用卡片 —— 入口由 message.ts / iridescent.ts 联合提供。
 * 这里集中 re-export 油彩终端卡的工具函数,方便 agent.ts 一次 import。
 */

export {
  appendToolCard,
  updateToolCardProgress,
  markToolCardSuccess,
  markToolCardError,
  jsonToHighlightedHtml,
  createThinkingCard,
  setThinkingContent,
  finalizeThinking,
} from './iridescent';

// 兼容旧引用(message.ts 早期版本用过 createToolCallEl)
export { createMessageEl as createToolCallEl } from './message';
