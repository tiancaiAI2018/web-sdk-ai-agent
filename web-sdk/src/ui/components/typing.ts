/**
 * 流式占位 + AI 思考 —— IRIDESCENT BLOOM v5 合并版
 *
 * 修 v5 问题:
 *   - 之前 thinking(粒子行) + typing(空 assistant 占位)是两个独立 sibling,
 *     看着像"loading 在占位外面",用户反馈"loading 不在框里"
 *   - 现在合并为一个元素:typing 占位 div **内部就是 5 颗粒子**,
 *     等流开始时把粒子清空,开始填 markdown
 *
 * 元素结构:
 *   <div class="aiagent-sdk-msg aiagent-sdk-msg-assistant">
 *     <span class="aia-p" style="--c: ...; --d: 0s"></span>
 *     <span class="aia-p" style="--c: ...; --d: 0.2s"></span>
 *     <span class="aia-p" style="--c: ...; --d: 0.4s"></span>
 *     <span class="aia-p" style="--c: ...; --d: 0.6s"></span>
 *     <span class="aia-p" style="--c: ...; --d: 0.8s"></span>
 *   </div>
 *
 *   ↑ 等流开始,清空 children,开始填 markdown 文本,加 active class 触发光标
 */

const PAINT_COLORS = ['#5eead4', '#a78bfa', '#f0abfc', '#93c5fd', '#fcd34d'];

/**
 * 创建 assistant 消息占位(内部是 5 颗粒子,代表"等待响应中")。
 * 流开始后,外部代码会清空内部 children,然后填 markdown 文本。
 */
export function createTypingEl(): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'aiagent-sdk-msg aiagent-sdk-msg-assistant aiagent-sdk-typing-pending';
  // 5 颗粒子,颜色 5 色循环,错峰 0/0.2/0.4/0.6/0.8s
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('span');
    p.className = 'aia-p';
    p.style.setProperty('--c', PAINT_COLORS[i % PAINT_COLORS.length]);
    if (i > 0) p.style.setProperty('--d', (i * 0.2) + 's');
    div.appendChild(p);
  }
  return div;
}

export function appendTyping(msgEl: HTMLElement): HTMLDivElement {
  const el = createTypingEl();
  msgEl.appendChild(el);
  msgEl.scrollTop = msgEl.scrollHeight;
  return el;
}

/**
 * 清空 typing 占位内部的粒子(供 upgradeTyping 在第一次 onChunk 时调)。
 * 也可以直接 div.innerHTML = ''。
 */
export function clearTypingParticles(el: HTMLElement): void {
  if (!el) return;
  el.classList.remove('aiagent-sdk-typing-pending');
  el.innerHTML = '';
}

/** 给 assistant 消息 div 加"流式中"class,触发 CSS ::after 闪烁光标 */
export function markTypingActive(el: HTMLElement): void {
  if (!el) return;
  el.classList.add('aiagent-sdk-typing-active');
}

/** 流结束:移除 class,光标消失 */
export function unmarkTypingActive(el: HTMLElement): void {
  if (!el) return;
  el.classList.remove('aiagent-sdk-typing-active');
}
