/**
 * 打字指示器 + 流式光标
 *
 * 用法:
 *   1. assistant 消息开流前,加 .aiagent-sdk-typing-active class
 *      (CSS 的 ::after 会自动渲染闪烁的 ▌ 光标)
 *   2. 流结束时移除 class,光标消失
 *   3. 流过程中的"3 圆点"指示器(刚开始等响应)用 createTypingEl()
 */

export function createTypingEl(): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'aiagent-sdk-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  return div;
}

export function appendTyping(msgEl: HTMLElement): HTMLDivElement {
  const el = createTypingEl();
  msgEl.appendChild(el);
  msgEl.scrollTop = msgEl.scrollHeight;
  return el;
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
