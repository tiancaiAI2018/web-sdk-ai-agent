/**
 * 消息 DOM 构造 —— 1:1 平移原 SDK 的 _appendMsg(原文件 359-376)
 *
 * 用法:
 *   const el = createMessageEl('user', '你好', 5);
 *   msgEl.appendChild(el);
 *   msgEl.scrollTop = msgEl.scrollHeight;
 *
 * `index` 参数:消息下标,渲染时 style.setProperty('--i', index) 给 CSS
 * `aia-msg-in` 动画的 stagger delay 用(CSS 已 clamp 到 5)。
 */

import { renderMarkdownLite, decorateImages } from '../../core/markdown';
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
  if (role === 'user') {
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-user';
  } else if (role === 'assistant') {
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-assistant';
  } else if (role === 'tool') {
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-tool';
  } else {
    div.className = 'aiagent-sdk-msg aiagent-sdk-msg-system';
  }

  // stagger 用:每条消息一个 --i
  div.style.setProperty('--i', String(index));

  if (role === 'tool') {
    // data = {tool, args} —— 显示工具调用摘要
    div.innerHTML =
      '<div class="aiagent-sdk-tool-title">📋 ' +
      escapeHtml(data?.tool || 'tool') +
      '</div>' +
      '<pre>' +
      escapeHtml(JSON.stringify(data?.args, null, 2) || '') +
      '</pre>';
  } else {
    div.innerHTML = renderMarkdownLite(text || '');
    decorateImages(div);
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
