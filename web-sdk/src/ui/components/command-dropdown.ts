/**
 * 快捷指令下拉面板 —— 纯 DOM 操作函数,无副作用。
 *
 * 元素结构(渲染在 inputbar 之前):
 *   <div class="aiagent-sdk-cmd-dropdown" hidden>
 *     <div class="aiagent-sdk-cmd-header">快捷指令</div>
 *     <div class="aiagent-sdk-cmd-list">
 *       <div class="aiagent-sdk-cmd-item" data-index="0">
 *         <span class="aiagent-sdk-cmd-icon">🆕</span>
 *         <span class="aiagent-sdk-cmd-name">/new</span>
 *         <span class="aiagent-sdk-cmd-label">新会话</span>
 *         <span class="aiagent-sdk-cmd-desc">创建新会话</span>
 *       </div>
 *       ...
 *     </div>
 *     <div class="aiagent-sdk-cmd-footer">
 *       <kbd>↑↓</kbd> 导航 <kbd>Enter</kbd> 选择 <kbd>Esc</kbd> 关闭
 *     </div>
 *   </div>
 */

import type { CommandMatch } from '../../core/commands';

export interface CommandDropdownItem {
  cmd: { name: string; label: string; description?: string; icon?: string };
  score: number;
}

export interface CreateCommandDropdownOptions {
  /** 点击某项时回调(由 widget.ts 实现选中逻辑) */
  onSelect: (index: number) => void;
}

/**
 * 创建下拉容器并插入到 inputBarEl 之前。
 * 返回的 div 默认 hidden。
 */
export function createCommandDropdown(
  inputBarEl: HTMLElement,
  opts: CreateCommandDropdownOptions
): HTMLDivElement {
  const dd = document.createElement('div');
  dd.className = 'aiagent-sdk-cmd-dropdown';
  dd.setAttribute('role', 'listbox');
  dd.setAttribute('aria-label', '快捷指令');
  dd.hidden = true;
  dd.innerHTML = [
    '<div class="aiagent-sdk-cmd-header">快捷指令</div>',
    '<div class="aiagent-sdk-cmd-list"></div>',
    '<div class="aiagent-sdk-cmd-footer">',
    '  <span><kbd>↑</kbd><kbd>↓</kbd>导航</span>',
    '  <span><kbd>Enter</kbd>选择</span>',
    '  <span><kbd>Esc</kbd>关闭</span>',
    '</div>',
  ].join('');

  // 委托点击
  const list = dd.querySelector('.aiagent-sdk-cmd-list') as HTMLDivElement;
  list.addEventListener('mousedown', (e: MouseEvent) => {
    // mousedown 而不是 click,避免 textarea 失焦
    const target = (e.target as HTMLElement).closest('.aiagent-sdk-cmd-item') as HTMLElement | null;
    if (!target) return;
    e.preventDefault();
    const idx = Number(target.dataset.index);
    if (Number.isFinite(idx)) opts.onSelect(idx);
  });

  // 插入到 inputbar 之前
  inputBarEl.parentElement?.insertBefore(dd, inputBarEl);
  return dd;
}

/**
 * 更新下拉中的指令列表(activeIndex 标记高亮项)。
 * 每次 query 变化时调。
 */
export function updateDropdownItems(
  dd: HTMLDivElement,
  items: CommandDropdownItem[],
  activeIndex: number
): void {
  const list = dd.querySelector('.aiagent-sdk-cmd-list') as HTMLDivElement;
  const header = dd.querySelector('.aiagent-sdk-cmd-header') as HTMLElement;

  if (items.length === 0) {
    list.innerHTML = '<div class="aiagent-sdk-cmd-empty">无匹配指令</div>';
    header.textContent = '快捷指令';
    return;
  }

  header.textContent = `快捷指令 (${items.length})`;

  // 重建列表(数量小,直接 innerHTML 重置最简单)
  const html = items
    .map((it, idx) => {
      const isActive = idx === activeIndex ? ' aiagent-sdk-cmd-active' : '';
      const icon = it.cmd.icon || '⚡';
      const name = escapeHtml('/' + it.cmd.name);
      const label = escapeHtml(it.cmd.label);
      const desc = it.cmd.description ? escapeHtml(it.cmd.description) : '';
      const descHTML = desc
        ? `<span class="aiagent-sdk-cmd-desc">${desc}</span>`
        : '';
      return [
        `<div class="aiagent-sdk-cmd-item${isActive}" data-index="${idx}" role="option">`,
        `  <span class="aiagent-sdk-cmd-icon">${escapeHtml(icon)}</span>`,
        `  <div class="aiagent-sdk-cmd-body">`,
        `    <span class="aiagent-sdk-cmd-name">${name}</span>`,
        `    <span class="aiagent-sdk-cmd-label">${label}</span>`,
        `  </div>`,
        `  ${descHTML}`,
        `</div>`,
      ].join('');
    })
    .join('');
  list.innerHTML = html;

  // 滚动到 active 项
  const activeEl = list.querySelector('.aiagent-sdk-cmd-active') as HTMLElement | null;
  if (activeEl) {
    const ddRect = dd.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    if (itemRect.bottom > ddRect.bottom) {
      list.scrollTop += itemRect.bottom - ddRect.bottom;
    } else if (itemRect.top < ddRect.top) {
      list.scrollTop -= ddRect.top - itemRect.top;
    }
  }
}

/** 显示下拉 */
export function showDropdown(dd: HTMLDivElement): void {
  if (!dd.hidden) return;
  dd.hidden = false;
}

/** 隐藏下拉 */
export function hideDropdown(dd: HTMLDivElement): void {
  if (dd.hidden) return;
  dd.hidden = true;
}

/** 判断下拉是否可见 */
export function isDropdownVisible(dd: HTMLDivElement): boolean {
  return !dd.hidden;
}

/** 高亮某项(纯类名切换,不重建 DOM) */
export function setActiveIndex(dd: HTMLDivElement, index: number): void {
  const list = dd.querySelector('.aiagent-sdk-cmd-list') as HTMLDivElement;
  const items = list.querySelectorAll('.aiagent-sdk-cmd-item');
  items.forEach((el, i) => {
    el.classList.toggle('aiagent-sdk-cmd-active', i === index);
  });
  // 滚动到可见
  const activeEl = list.querySelector('.aiagent-sdk-cmd-active') as HTMLElement | null;
  if (activeEl) {
    const ddRect = dd.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    if (itemRect.bottom > ddRect.bottom) {
      list.scrollTop += itemRect.bottom - ddRect.bottom;
    } else if (itemRect.top < ddRect.top) {
      list.scrollTop -= ddRect.top - itemRect.top;
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 重新导出类型方便调用方
export type { CommandMatch };
