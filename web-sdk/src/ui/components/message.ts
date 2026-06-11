/**
 * 消息 DOM 构造 —— IRIDESCENT BLOOM
 *
 * 设计主张:消息不画背景气泡框,只靠"墨水渲染"做入场动画 + 装饰边。
 *   - user:右对齐 + 左边缘 2px 虹彩渐变条
 *   - assistant:左对齐,纯文字
 *   - tool:走油彩终端卡(JSON 高亮)
 *
 * 用法:
 *   const el = createMessageEl('user', '你好', 5);
 *   msgEl.appendChild(el);
 *   msgEl.scrollTop = msgEl.scrollHeight;
 */

import { renderMarkdownLite, decorateImages } from '../../core/markdown';
import { appendToolCard, jsonToHighlightedHtml } from './iridescent';
import type { MessageRole } from '../../core/types';

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]!;
  });
}

export function createMessageEl(
  role: MessageRole,
  text: string,
  index: number = 0,
  data?: { tool: string; args: Record<string, unknown> }
): HTMLDivElement {
  const div = document.createElement('div');
  // 保留 --i 供将来扩展(目前 CSS 不消费)
  div.style.setProperty('--i', String(index));

  if (role === 'user') {
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-user';
    div.innerHTML = escapeHtml(text || '');
  } else if (role === 'assistant') {
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-assistant';
    div.innerHTML = renderMarkdownLite(text || '');
    decorateImages(div);
  } else if (role === 'tool') {
    // 工具调用 — 走油彩终端卡(由 iridescent.ts 构造完整结构)
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-tool';
    if (data) {
      // 构造一张"只读"卡片(不挂到 msgEl,挂到 div 里)
      // 直接用 iridescent.ts 的 appendToolCard 即可,它会创建结构并返回 card
      // —— 但 appendToolCard 也会 append 到传入的容器(div),所以一行搞定
      appendToolCard(div, data.tool, data.args || {});
    }
  } else {
    // system
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-system';
    div.textContent = text || '';
  }

  return div;
}

export function appendMessage(
  msgEl: HTMLElement,
  role: MessageRole,
  text: string,
  index: number = 0,
  data?: { tool: string; args: Record<string, unknown> }
): void {
  const el = createMessageEl(role, text, index, data);
  msgEl.appendChild(el);
  msgEl.scrollTop = msgEl.scrollHeight;
}

/**
 * 直接在 msgEl 末尾追加一个油彩终端卡(更轻量,不再走 createMessageEl 套娃)。
 * 返回卡片根元素,供 agent.ts 后续更新进度。
 */
export function appendToolCardToMsgEl(
  msgEl: HTMLElement,
  tool: string,
  args: Record<string, unknown>
): HTMLDivElement {
  return appendToolCard(msgEl, tool, args);
}

// 暴露 jsonToHighlightedHtml 供外部直接用
export { jsonToHighlightedHtml };

