/**
 * 记忆浏览页 —— 用户在浮窗里管理本地记忆(查看 / 搜索 / 编辑 / 删除 / 置顶 / 导入导出)。
 *
 * <p>设计:
 * <ul>
 *   <li>纯渲染层:接收 host(页面容器)+ MemoryEngine 引用,自己管 DOM 状态
 *   <li>订阅 MemoryEngine.onChange 自动重渲
 *   <li>搜索/分类过滤/置顶排序走引擎 API
 *   <li>提供 import / export 按钮(走引擎同名方法)
 * </ul>
 */

import type { MemoryCategory, MemoryEngine, MemoryEntry } from '../../core/memory';

// ====================================================================
// 类别元信息
// ====================================================================

const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  preference: '偏好',
  fact: '事实',
  history: '历史',
  note: '备注',
};

const CATEGORY_ORDER: MemoryCategory[] = ['preference', 'fact', 'history', 'note'];

// ====================================================================
// 渲染入口
// ====================================================================

export interface MemoryPageHandle {
  /** 重新渲染整页(每次切回 memory 页时由 agent 调) */
  refresh(): void;
  /** 清理订阅(浮窗 destroy 时调) */
  destroy(): void;
}

/**
 * 把记忆浏览页挂到 host 容器上。返回 handle 供 agent 控制。
 *
 * <p>页面布局:
 * <pre>
 *   [搜索框........]
 *   [全部][偏好][事实][历史][备注]
 *   ────────────────────────────
 *   [📌 pinned item ........ 🗑]
 *   [item .................. 🗑]
 *   [item .................. 🗑]
 *   ────────────────────────────
 *   共 N 条  [导出][导入][清空]
 * </pre>
 */
export function mountMemoryPage(
  host: HTMLElement,
  engine: MemoryEngine,
  opts?: {
    /** 用户点 [清空] 时的确认回调,返回 false 取消 */
    onConfirmClear?: () => boolean;
    /** 状态变化回调(给 agent / 测试用) */
    onToast?: (msg: string, level?: 'info' | 'error' | 'success') => void;
  }
): MemoryPageHandle {
  let activeCategory: MemoryCategory | 'all' = 'all';
  let searchQuery = '';
  let unsub: (() => void) | null = null;

  // ----------------------------------------------------------------
  // 渲染外壳
  // ----------------------------------------------------------------
  host.innerHTML = [
    '<div class="aia-mem-page">',
    '  <div class="aia-mem-searchbar">',
    '    <span class="aia-mem-search-icon">🔍</span>',
    '    <input type="text" class="aia-mem-search" placeholder="搜索记忆(key / value / tag)" />',
    '  </div>',
    '  <div class="aia-mem-chips"></div>',
    '  <div class="aia-mem-list" role="list"></div>',
    '  <div class="aia-mem-footer">',
    '    <span class="aia-mem-stats">加载中…</span>',
    '    <div class="aia-mem-actions">',
    '      <button class="aia-mem-btn" data-act="export">导出</button>',
    '      <button class="aia-mem-btn" data-act="import">导入</button>',
    '      <button class="aia-mem-btn aia-mem-btn-danger" data-act="clear">清空</button>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('');

  const searchEl = host.querySelector('.aia-mem-search') as HTMLInputElement;
  const chipsEl = host.querySelector('.aia-mem-chips') as HTMLElement;
  const listEl = host.querySelector('.aia-mem-list') as HTMLElement;
  const statsEl = host.querySelector('.aia-mem-stats') as HTMLElement;

  // ----------------------------------------------------------------
  // 事件
  // ----------------------------------------------------------------
  searchEl.addEventListener('input', () => {
    searchQuery = searchEl.value.trim();
    renderList();
  });

  host.querySelector('[data-act="export"]')!.addEventListener('click', () => {
    const json = engine.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aia-memories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('已导出', 'success');
  });

  host.querySelector('[data-act="import"]')!.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const n = engine.import(String(reader.result || ''));
          toast(`成功导入 ${n} 条记忆`, 'success');
        } catch (e) {
          toast('导入失败: ' + (e as Error).message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  host.querySelector('[data-act="clear"]')!.addEventListener('click', () => {
    const ok = opts?.onConfirmClear ? opts.onConfirmClear() : confirm('确定清空所有记忆？此操作不可恢复。');
    if (!ok) return;
    engine.clear();
    toast('已清空', 'info');
  });

  // ----------------------------------------------------------------
  // 渲染:分类 chips
  // ----------------------------------------------------------------
  function renderChips(): void {
    const counts: Record<MemoryCategory | 'all', number> = {
      all: engine.size(),
      preference: 0,
      fact: 0,
      history: 0,
      note: 0,
    };
    for (const e of engine.list()) counts[e.category]++;

    const items: Array<{ key: MemoryCategory | 'all'; label: string; count: number }> = [
      { key: 'all', label: '全部', count: counts.all },
    ];
    for (const c of CATEGORY_ORDER) {
      items.push({ key: c, label: CATEGORY_LABELS[c], count: counts[c] });
    }

    chipsEl.innerHTML = items
      .map(
        (it) =>
          `<button class="aia-mem-chip ${it.key === activeCategory ? 'aia-mem-chip-active' : ''}" data-cat="${it.key}">` +
          `${it.label} <span class="aia-mem-chip-count">${it.count}</span>` +
          '</button>'
      )
      .join('');

    chipsEl.querySelectorAll('.aia-mem-chip').forEach((el) => {
      el.addEventListener('click', () => {
        const cat = (el as HTMLElement).dataset.cat as MemoryCategory | 'all';
        activeCategory = cat;
        renderChips();
        renderList();
      });
    });
  }

  // ----------------------------------------------------------------
  // 渲染:列表
  // ----------------------------------------------------------------
  function renderList(): void {
    let items: MemoryEntry[];
    if (searchQuery) {
      const opts: { limit: number; category?: MemoryCategory; touch?: boolean } = {
        limit: 50,
        touch: false,
      };
      if (activeCategory !== 'all') opts.category = activeCategory;
      items = engine.search(searchQuery, opts);
    } else if (activeCategory === 'all') {
      items = engine.list().sort(byPinnedThenUpdated);
    } else {
      items = engine.list({ category: activeCategory }).sort(byPinnedThenUpdated);
    }

    if (items.length === 0) {
      listEl.innerHTML = renderEmpty();
      statsEl.textContent = `共 0 条记忆`;
      return;
    }

    listEl.innerHTML = items.map(renderItem).join('');
    statsEl.textContent = `共 ${items.length} 条记忆`;

    // 绑定每条记忆的按钮事件
    listEl.querySelectorAll('.aia-mem-item').forEach((el) => {
      const id = (el as HTMLElement).dataset.id!;
      const pinBtn = el.querySelector('[data-act="pin"]');
      if (pinBtn) {
        pinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const entry = engine.get(id);
          if (entry) engine.update(id, { pinned: !entry.pinned });
        });
      }
      const delBtn = el.querySelector('[data-act="del"]');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('删除这条记忆？')) engine.delete(id);
        });
      }
      // 点击行:内联编辑 value
      el.addEventListener('click', () => startEdit(id));
    });
  }

  function renderEmpty(): string {
    if (searchQuery) {
      return '<div class="aia-mem-empty">没有匹配的记忆。试试换个关键词。</div>';
    }
    return [
      '<div class="aia-mem-empty">',
      '  <div class="aia-mem-empty-icon">🧠</div>',
      '  <div class="aia-mem-empty-title">还没有记忆</div>',
      '  <div class="aia-mem-empty-hint">告诉 AI "记住...",或点这里 →</div>',
      '  <button class="aia-mem-btn aia-mem-btn-primary" data-act="add-sample">添加示例记忆</button>',
      '</div>',
    ].join('\n');
  }

  function renderItem(e: MemoryEntry): string {
    const tags = e.tags && e.tags.length
      ? `<div class="aia-mem-item-tags">${e.tags.map((t) => `<span class="aia-mem-tag">#${escapeHtml(t)}</span>`).join('')}</div>`
      : '';
    return [
      `<div class="aia-mem-item ${e.pinned ? 'aia-mem-item-pinned' : ''}" data-id="${e.id}">`,
      `  <button class="aia-mem-pin" data-act="pin" title="${e.pinned ? '取消置顶' : '置顶'}">${e.pinned ? '📌' : '📍'}</button>`,
      `  <div class="aia-mem-item-main">`,
      `    <div class="aia-mem-item-key">${escapeHtml(e.key)} <span class="aia-mem-item-cat">${CATEGORY_LABELS[e.category]}</span></div>`,
      `    <div class="aia-mem-item-value">${escapeHtml(e.value)}</div>`,
      tags,
      `  </div>`,
      `  <button class="aia-mem-del" data-act="del" title="删除">🗑</button>`,
      `</div>`,
    ].join('\n');
  }

  // ----------------------------------------------------------------
  // 内联编辑
  // ----------------------------------------------------------------
  function startEdit(id: string): void {
    const item = listEl.querySelector(`.aia-mem-item[data-id="${id}"]`) as HTMLElement | null;
    if (!item) return;
    const entry = engine.get(id);
    if (!entry) return;

    const valueEl = item.querySelector('.aia-mem-item-value') as HTMLElement;
    const original = entry.value;
    valueEl.contentEditable = 'true';
    valueEl.classList.add('aia-mem-editing');
    valueEl.focus();
    // 选中所有文本
    const range = document.createRange();
    range.selectNodeContents(valueEl);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    const finish = (commit: boolean) => {
      valueEl.contentEditable = 'false';
      valueEl.classList.remove('aia-mem-editing');
      valueEl.removeEventListener('blur', onBlur);
      valueEl.removeEventListener('keydown', onKey);
      if (commit) {
        const newVal = valueEl.textContent?.trim() || '';
        if (newVal && newVal !== original) {
          engine.update(id, { value: newVal });
        } else {
          valueEl.textContent = original;
        }
      } else {
        valueEl.textContent = original;
      }
    };
    const onBlur = () => finish(true);
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        finish(true);
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        finish(false);
      }
    };
    valueEl.addEventListener('blur', onBlur);
    valueEl.addEventListener('keydown', onKey);
  }

  // ----------------------------------------------------------------
  // Toast 提示
  // ----------------------------------------------------------------
  function toast(msg: string, level: 'info' | 'error' | 'success' = 'info'): void {
    if (opts?.onToast) {
      opts.onToast(msg, level);
      return;
    }
    // 简单 inline 提示(显示 2 秒后消失)
    const el = document.createElement('div');
    el.className = `aia-mem-toast aia-mem-toast-${level}`;
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add('aia-mem-toast-show'));
    setTimeout(() => {
      el.classList.remove('aia-mem-toast-show');
      setTimeout(() => el.remove(), 300);
    }, 2000);
  }

  // ----------------------------------------------------------------
  // 示例记忆按钮
  // ----------------------------------------------------------------
  host.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.act === 'add-sample') {
      engine.save({
        key: 'default_warehouse',
        value: 'BJ-北京中心仓',
        category: 'preference',
        pinned: true,
        scope: 'global',
      });
      engine.save({
        key: 'city',
        value: '北京',
        category: 'fact',
        pinned: true,
        scope: 'global',
      });
      engine.save({
        key: 'customer_phone',
        value: '13800138000',
        category: 'fact',
        scope: 'global',
      });
      toast('已添加 3 条示例记忆', 'success');
    }
  });

  // ----------------------------------------------------------------
  // 工具
  // ----------------------------------------------------------------
  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function byPinnedThenUpdated(a: MemoryEntry, b: MemoryEntry): number {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  }

  // ----------------------------------------------------------------
  // 初次渲染 + 订阅变更
  // ----------------------------------------------------------------
  function refresh(): void {
    renderChips();
    renderList();
  }
  refresh();

  // 引擎变更时自动重渲
  unsub = engine.onChange(() => {
    renderChips();
    renderList();
  });

  return {
    refresh,
    destroy() {
      if (unsub) {
        unsub();
        unsub = null;
      }
      host.innerHTML = '';
    },
  };
}
