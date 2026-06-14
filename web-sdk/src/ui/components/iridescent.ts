/**
 * Iridescent Bloom 视觉组件 — 油彩/工具卡的 DOM 构造
 *
 * 设计主张:AI Agent 不是"客服",是一块"活的、会思考的、会调用工具的虹彩玻璃"。
 *
 * 提供:
 *   - appendToolCard(msgEl, tool, args)         油彩终端卡(工具调用)
 *   - updateToolCardProgress(card, percent, status)  进度条推进
 *   - markToolCardSuccess(card)                工具完成(边框转绿 + ✓)
 *   - markToolCardError(card, msg)             工具失败
 *   - jsonToHighlightedHtml(jsonString)        JSON 字符串 → 带高亮 span 的 HTML
 *
 * 颜色定义同步 styles.ts:
 *   #5eead4 青绿  #a78bfa 紫  #f0abfc 粉  #93c5fd 天蓝  #fcd34d 琥珀
 */

/**
 * 在 msgEl 末尾加一张油彩终端卡(工具调用),返回卡片根元素。
 * 卡片结构:头部(箭头 + 名字 + 状态点) + JSON 主体 + 进度条
 */
export function appendToolCard(
  msgEl: HTMLElement,
  tool: string,
  args: Record<string, unknown>,
  beforeEl?: HTMLElement | null
): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'aiagent-sdk-tool-card';
  card.setAttribute('role', 'status');
  card.setAttribute('data-tool', tool);

  // 头部
  const head = document.createElement('div');
  head.className = 'aiagent-sdk-tool-head';
  const arrow = document.createElement('span');
  arrow.className = 'aiagent-sdk-tool-arrow';
  arrow.textContent = '▸';
  const name = document.createElement('span');
  name.className = 'aiagent-sdk-tool-name';
  name.textContent = tool;
  const dot = document.createElement('span');
  dot.className = 'aiagent-sdk-tool-dot';
  head.appendChild(arrow);
  head.appendChild(name);
  head.appendChild(dot);

  // 主体(JSON 高亮)
  const body = document.createElement('pre');
  body.className = 'aiagent-sdk-tool-body';
  body.innerHTML = jsonToHighlightedHtml(JSON.stringify(args, null, 2) || '{}');

  // 进度条
  const progress = document.createElement('div');
  progress.className = 'aiagent-sdk-tool-progress';
  const bar = document.createElement('div');
  bar.className = 'aiagent-sdk-tool-bar';
  bar.style.setProperty('--p', '0%');
  const status = document.createElement('span');
  status.className = 'aiagent-sdk-tool-status';
  status.textContent = '调用中…';
  progress.appendChild(bar);
  progress.appendChild(status);

  card.appendChild(head);
  card.appendChild(body);
  card.appendChild(progress);
  // 如果指定了 beforeEl,插入到它之前(多轮场景下确保卡片在 typing 占位之前)
  if (beforeEl && beforeEl.parentNode === msgEl) {
    msgEl.insertBefore(card, beforeEl);
  } else {
    msgEl.appendChild(card);
  }
  msgEl.scrollTop = msgEl.scrollHeight;
  return card;
}

/** 更新工具卡状态文字(percent 参数在新结构下不再用,保留兼容) */
export function updateToolCardProgress(
  card: HTMLElement,
  _percent: number,
  statusText?: string
): void {
  if (!card) return;
  // 新结构没 bar 元素,只改 status 文字(percent 保留参数兼容)
  if (statusText) {
    const status = card.querySelector('.aiagent-sdk-tool-status') as HTMLElement | null;
    if (status) status.textContent = statusText;
  }
}

/** 标记工具卡为成功(边框转绿 + 头部箭头变绿 + 状态点停止脉冲 + 进度条满) */
export function markToolCardSuccess(
  card: HTMLElement,
  statusText: string = '✓ 完成'
): void {
  if (!card) return;
  card.classList.add('aiagent-sdk-tool-success');
  // 新结构卡:加 --confirmed 触发 48px 折叠(跟思考卡 done 一样)
  if (card.classList.contains('aiagent-sdk-tool-card--pending')) {
    card.classList.add('aiagent-sdk-tool-confirmed');
    card.classList.remove('aiagent-sdk-tool-card--pending');
  }
  const status = card.querySelector('.aiagent-sdk-tool-status') as HTMLElement | null;
  if (status) status.textContent = statusText;
}

/** 标记工具卡为失败(边框转红 + 状态文字) */
export function markToolCardError(
  card: HTMLElement,
  statusText: string = '✕ 失败'
): void {
  if (!card) return;
  card.classList.add('aiagent-sdk-tool-error');
  card.style.borderLeftColor = 'var(--aia-error)';
  const status = card.querySelector('.aiagent-sdk-tool-status') as HTMLElement | null;
  if (status) status.textContent = statusText;
}

/**
 * 把 JSON 字符串转成带高亮 span 的 HTML。
 * 转义 HTML 字符后,匹配 key / 字符串 / 数字 / 布尔 / null,加 .k / .s / .n 类。
 */
export function jsonToHighlightedHtml(json: string): string {
  // 先转义 HTML
  const esc = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // 给 key 加色(在引号后跟冒号前的字符串)
  // 给字符串字面量(双引号包裹的内容)加色
  // 给数字 / true / false / null 加色
  return esc.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (m, str, colon, kw, num) => {
      if (str) {
        // 字符串字面量
        if (colon) {
          return `<span class="k">${str}</span>${colon}`;
        }
        return `<span class="s">${str}</span>`;
      }
      if (kw) {
        return `<span class="k">${kw}</span>`;
      }
      if (num) {
        return `<span class="n">${num}</span>`;
      }
      return m;
    }
  );
}

import { renderMarkdownLite, decorateImages } from '../../core/markdown';

/**
 * 思考卡片 — 展示模型推理过程(流式,可折叠)
 *
 * 设计:
 *   - 默认折叠:固定高度 140px,overflow hidden,mask-image 底部淡出
 *   - 自动滚底:appendThinkingChunk 时 body.scrollTop = body.scrollHeight
 *   - 展开:去掉高度限制和 mask,允许原生滚动
 *   - 完成:缩小到仅头部可见(label 变 ✓ 思考完成)
 */

/** 在 msgEl 末尾创建思考卡片,返回卡片根元素 */
export function createThinkingCard(msgEl: HTMLElement): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'aiagent-sdk-thinking-card';
  card.setAttribute('role', 'status');
  card.setAttribute('aria-label', 'AI 思考中');

  // 头部
  const head = document.createElement('div');
  head.className = 'aiagent-sdk-thinking-head';

  const dot = document.createElement('span');
  dot.className = 'aiagent-sdk-thinking-dot';
  dot.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'aiagent-sdk-thinking-label';
  label.textContent = '思考中…';

  const toggle = document.createElement('button');
  toggle.className = 'aiagent-sdk-thinking-toggle';
  toggle.textContent = '展开';
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = card.classList.toggle('aiagent-sdk-thinking-expanded');
    toggle.textContent = expanded ? '收起' : '展开';
  });

  head.appendChild(dot);
  head.appendChild(label);
  head.appendChild(toggle);

  // 主体
  const body = document.createElement('pre');
  body.className = 'aiagent-sdk-thinking-body';

  card.appendChild(head);
  card.appendChild(body);
  msgEl.appendChild(card);
  msgEl.scrollTop = msgEl.scrollHeight;
  return card;
}

/**
 * 渲染完整思考内容(支持 markdown),自动滚到底部
 * 流式思路:agent.ts 累加 thinkingBuf,每来一个 chunk 就用本函数全量重渲染
 * (thinking 内容通常不超过几 KB,全量渲染性能可接受)
 */
export function setThinkingContent(card: HTMLElement, md: string): void {
  if (!card) return;
  const body = card.querySelector('.aiagent-sdk-thinking-body') as HTMLElement | null;
  if (!body) return;
  body.innerHTML = renderMarkdownLite(md || '');
  decorateImages(body);
  // 自动滚到底部 — 聚焦最新一行
  body.scrollTop = body.scrollHeight;
}

/** 标记思考完成:label 变 ✓,触发 CSS 收起动画 */
export function finalizeThinking(card: HTMLElement): void {
  if (!card) return;
  // 已完成的卡不重复处理
  if (card.classList.contains('aiagent-sdk-thinking-done')) return;
  card.classList.add('aiagent-sdk-thinking-done');
  const label = card.querySelector('.aiagent-sdk-thinking-label') as HTMLElement | null;
  if (label) label.textContent = '✓ 思考完成';
  // 如果展开过,先收起
  card.classList.remove('aiagent-sdk-thinking-expanded');
  const toggle = card.querySelector('.aiagent-sdk-thinking-toggle') as HTMLElement | null;
  if (toggle) toggle.textContent = '展开';
}

// ====================================================================
// 工具调用卡片 — 跟思考卡(createThinkingCard)完全同构,只换颜色/文字
//
// 元素顺序:head { dot, name, status, toggle, [confirm, cancel] } + body
//   流式:  --delta  body 累积 delta 原始字符串(灰)
//   完整:  --pending body 替换为高亮 JSON
//   折叠:  --done   body 收起成 0 高度
//   展开:  --expanded body 高度提到 460px 可滚
//   终态:  --confirmed / --cancelled 整卡配色变绿/红
// ====================================================================

/**
 * 创建"参数加载中…"占位卡(灰态)。
 * DOM 结构跟 createThinkingCard 镜像:head(dot + name + status + toggle) + body。
 */
export function appendToolCallDelta(
  msgEl: HTMLElement,
  id: string,
  toolHint?: string,
  beforeEl?: HTMLElement | null
): HTMLDivElement {
  const card = document.createElement('div');
  card.className =
    'aiagent-sdk-tool-card aiagent-sdk-tool-card--delta';
  card.setAttribute('role', 'status');
  card.setAttribute('data-tool', toolHint || '...');
  card.setAttribute('data-tool-id', id || '');

  // 头部 —— 跟 .aiagent-sdk-thinking-head 同构
  const head = document.createElement('div');
  head.className = 'aiagent-sdk-tool-head';

  const dot = document.createElement('span');
  dot.className = 'aiagent-sdk-tool-dot';
  dot.setAttribute('aria-hidden', 'true');

  const name = document.createElement('span');
  name.className = 'aiagent-sdk-tool-name';
  name.textContent = toolHint || '加载工具…';

  const status = document.createElement('span');
  status.className = 'aiagent-sdk-tool-status';
  status.textContent = '加载参数…';

  const toggle = document.createElement('button');
  toggle.className = 'aiagent-sdk-tool-toggle';
  toggle.textContent = '展开';
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = card.classList.toggle('aiagent-sdk-tool-expanded');
    toggle.textContent = expanded ? '收起' : '展开';
  });

  head.appendChild(dot);
  head.appendChild(name);
  head.appendChild(status);
  head.appendChild(toggle);

  // 主体(累积显示 delta 原始字符串)
  const body = document.createElement('pre');
  body.className = 'aiagent-sdk-tool-body';
  body.textContent = '';

  card.appendChild(head);
  card.appendChild(body);
  if (beforeEl && beforeEl.parentNode === msgEl) {
    msgEl.insertBefore(card, beforeEl);
  } else {
    msgEl.appendChild(card);
  }
  msgEl.scrollTop = msgEl.scrollHeight;
  return card;
}

/**
 * 把 tool_call_delta 的内容累加到占位卡的 body(纯文本,不解析)。
 * 跟 setThinkingContent 同构(都是改 body 内容)。
 */
export function updateToolCallDelta(card: HTMLElement, delta: string): void {
  if (!card) return;
  const body = card.querySelector('.aiagent-sdk-tool-body') as HTMLElement | null;
  if (!body) return;
  body.textContent = (body.textContent || '') + (delta || '');
  // 自动滚底
  const msgEl = card.parentElement;
  if (msgEl) msgEl.scrollTop = msgEl.scrollHeight;
}

/**
 * 流式结束 — 把 delta 卡转成完整 tool_use 卡。
 *   - name 改为真实工具名
 *   - status 改为"等待执行"or"等待确认"
 *   - body 替换成高亮 JSON
 *   - 删除 --delta,加 --pending
 * 跟 finalizeThinking(setThinkingContent) 同构(切状态 + 改文本)。
 */
export function promoteToConfirmedToolCall(
  card: HTMLElement,
  fullArgs: Record<string, unknown>,
  toolName: string
): void {
  if (!card) return;
  card.classList.remove('aiagent-sdk-tool-card--delta');
  card.classList.add('aiagent-sdk-tool-card--pending');
  card.setAttribute('data-tool', toolName || '');
  // 名字
  const name = card.querySelector('.aiagent-sdk-tool-name') as HTMLElement | null;
  if (name) name.textContent = toolName || 'tool';
  // 状态文字
  const status = card.querySelector('.aiagent-sdk-tool-status') as HTMLElement | null;
  if (status) status.textContent = '等待执行';
  // 主体 — 高亮 JSON
  const body = card.querySelector('.aiagent-sdk-tool-body') as HTMLElement | null;
  if (body) {
    body.innerHTML = jsonToHighlightedHtml(
      JSON.stringify(fullArgs || {}, null, 2)
    );
  }
}

/**
 * 在卡片 head 的 toggle 位置追加 ✓ 确认 / ✕ 取消 两个按钮(替换 toggle)。
 * 返回 Promise<boolean>(true=确认,false=取消)。
 * 跟 finalizeThinking(set 头 label) 同构 —— 都是改 head 文案。
 */
export function addConfirmActions(card: HTMLElement): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (!card) {
      resolve(false);
      return;
    }
    const head = card.querySelector('.aiagent-sdk-tool-head') as HTMLElement | null;
    if (!head) {
      resolve(false);
      return;
    }
    // 删掉 toggle(确认时不需要展开/收起)
    const oldToggle = head.querySelector('.aiagent-sdk-tool-toggle');
    if (oldToggle) oldToggle.remove();
    // 状态文字改"等待用户确认"
    const status = head.querySelector('.aiagent-sdk-tool-status');
    if (status) status.textContent = '⏸ 等待确认';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'aiagent-sdk-tool-confirm-btn';
    confirmBtn.textContent = '✓ 确认';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'aiagent-sdk-tool-cancel-btn';
    cancelBtn.textContent = '✕ 取消';
    head.appendChild(confirmBtn);
    head.appendChild(cancelBtn);

    let resolved = false;
    const finish = (ok: boolean) => {
      if (resolved) return;
      resolved = true;
      confirmBtn.remove();
      cancelBtn.remove();
      resolve(ok);
    };
    confirmBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.add('aiagent-sdk-tool-confirmed');
      const st = head.querySelector('.aiagent-sdk-tool-status');
      if (st) st.textContent = '✓ 已确认';
      finish(true);
    });
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.add('aiagent-sdk-tool-cancelled');
      const st = head.querySelector('.aiagent-sdk-tool-status');
      if (st) st.textContent = '✕ 已取消';
      finish(false);
    });
  });
}
