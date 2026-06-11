/**
 * 工具调用卡片 —— 由 message.ts 中的 createMessageEl(role='tool') 处理,
 * 这里预留单独入口方便将来扩展自定义工具卡片样式。
 */

export { createMessageEl as createToolCallEl } from './message';
