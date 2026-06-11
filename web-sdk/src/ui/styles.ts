/**
 * 浮窗 CSS —— Shadow DOM 内 + 设计令牌 + 6 项 polish 动画
 *
 * 注入位置:由 widget.ts 在 attachShadow 后 append 一个 <style> 元素。
 * 选择器策略:
 *   - `:host` / `:host([data-theme="dark"])` 切主题
 *   - `.aiagent-sdk-*` 前缀保留(防 debug 时混淆;shadow 内本不需要,但万一被
 *     复制回外层也还能识别)
 *   - 旧版 `.aiagent-sdk-panel.aiagent-sdk-theme-dark` 这种"主题 + 面板"链式
 *     选择器改为 `:host([data-theme="dark"]) .aiagent-sdk-xxx`
 *
 * 设计令牌(在 :host 上定义,所有规则消费):
 *   --aia-primary / --aia-primary-strong / --aia-accent
 *   --aia-bg / --aia-bg-elev / --aia-text / --aia-text-muted / --aia-border
 *   --aia-radius-sm/md/lg
 *   --aia-shadow-1/2
 *   --aia-anim-ease / --aia-anim-dur
 *   --aia-font
 *
 * 6 项动画 polish:
 *   1. 气泡:玻璃感(backdrop-filter + 双层阴影)
 *   2. 气泡:4s 呼吸脉冲(关闭 reduced-motion)
 *   3. 面板:280ms slide-up + scale(cubic-bezier ease)
 *   4. 消息:stagger 入场(--i 控制 delay,最多 5 条后不再延迟)
 *   5. 流式光标:assistant 消息末尾 ▌ 闪烁
 *   6. 工具卡骨架:shimmer 1.4s 循环(等结果时)
 */

export const WIDGET_CSS = `
/* ====================================================================
 * 设计令牌
 * ==================================================================== */
:host {
  /* 调色板 */
  --aia-primary: #3b82f6;
  --aia-primary-strong: #2563eb;
  --aia-accent: #8b5cf6;
  --aia-bg: #ffffff;
  --aia-bg-elev: #f9fafb;
  --aia-bg-soft: #f3f4f6;
  --aia-text: #1f2937;
  --aia-text-muted: #6b7280;
  --aia-text-faint: #9ca3af;
  --aia-border: #e5e7eb;
  --aia-border-soft: #f3f4f6;
  --aia-success: #065f46;
  --aia-success-bg: #ecfdf5;
  --aia-success-border: #a7f3d0;
  --aia-error: #991b1b;
  --aia-error-bg: #fef2f2;
  --aia-error-border: #fecaca;
  --aia-link: #3b82f6;
  --aia-link-hover: #2563eb;
  --aia-code-bg: rgba(0,0,0,.06);
  --aia-pre-bg: rgba(0,0,0,.05);

  /* 形状 */
  --aia-radius-sm: 8px;
  --aia-radius-md: 12px;
  --aia-radius-lg: 16px;
  --aia-radius-pill: 9999px;

  /* 阴影 */
  --aia-shadow-1: 0 6px 20px rgba(59,130,246,.30);
  --aia-shadow-2: 0 12px 40px rgba(0,0,0,.18);
  --aia-shadow-glow: 0 0 0 3px rgba(59,130,246,.18);

  /* 动效 */
  --aia-anim-ease: cubic-bezier(.2,.8,.2,1);
  --aia-anim-dur: 220ms;
  --aia-anim-dur-slow: 320ms;
  --aia-anim-stagger-step: 30ms;

  /* 字体 */
  --aia-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;
  --aia-mono: ui-monospace, "Cascadia Code", "JetBrains Mono", monospace;
}

:host([data-theme="dark"]) {
  --aia-bg: #0b1220;
  --aia-bg-elev: #111827;
  --aia-bg-soft: #1f2937;
  --aia-text: #e5e7eb;
  --aia-text-muted: #9ca3af;
  --aia-text-faint: #6b7280;
  --aia-border: #1f2937;
  --aia-border-soft: #374151;
  --aia-success: #a7f3d0;
  --aia-success-bg: #064e3b;
  --aia-success-border: #047857;
  --aia-error: #fecaca;
  --aia-error-bg: #450a0a;
  --aia-error-border: #7f1d1d;
  --aia-link: #93c5fd;
  --aia-link-hover: #bfdbfe;
  --aia-code-bg: rgba(255,255,255,.08);
  --aia-pre-bg: rgba(0,0,0,.35);

  --aia-shadow-1: 0 6px 20px rgba(0,0,0,.5);
  --aia-shadow-2: 0 12px 40px rgba(0,0,0,.6);
}

/* ====================================================================
 * 气泡(玻璃感 + 呼吸脉冲)
 * ==================================================================== */
.aiagent-sdk-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--aia-primary), var(--aia-accent));
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4);
  z-index: 2147483600;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-family: var(--aia-font);
  /* 玻璃感 */
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  transition:
    transform var(--aia-anim-dur) var(--aia-anim-ease),
    box-shadow var(--aia-anim-dur) var(--aia-anim-ease);
}
.aiagent-sdk-bubble:hover {
  transform: scale(1.08);
  box-shadow:
    0 8px 28px rgba(59,130,246,.45),
    inset 0 1px 0 rgba(255,255,255,.4);
}
.aiagent-sdk-bubble.aiagent-sdk-hidden { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-pos-bl { right: auto; left: 24px; }

/* 持续浮动 + 呼吸脉冲 + 缩放呼吸(不依赖 hover,空闲就一直在动) */
@keyframes aia-bubble-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50%      { transform: translateY(-6px) scale(1.04); }
}
@keyframes aia-bubble-pulse {
  0%   { box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 0 rgba(59,130,246,.55); }
  70%  { box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 22px rgba(59,130,246,0); }
  100% { box-shadow: var(--aia-shadow-1), inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 0 rgba(59,130,246,0); }
}
.aiagent-sdk-bubble {
  animation:
    aia-bubble-float 2.4s var(--aia-anim-ease) infinite,
    aia-bubble-pulse 2.5s var(--aia-anim-ease) infinite;
}
.aiagent-sdk-bubble:hover,
.aiagent-sdk-bubble:focus-visible {
  /* hover 时只保留自身的缩放过渡,停掉持续动效以免视觉打架 */
  animation: none;
  transform: scale(1.10);
  box-shadow:
    0 12px 32px rgba(59,130,246,.55),
    inset 0 1px 0 rgba(255,255,255,.4),
    0 0 0 6px rgba(59,130,246,.15);
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-bubble { animation: none; }
}

/* ====================================================================
 * 面板(滑入 + 微缩放)
 * ==================================================================== */
.aiagent-sdk-panel {
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: 380px;
  height: 540px;
  max-height: 80vh;
  background: var(--aia-bg);
  color: var(--aia-text);
  border-radius: var(--aia-radius-md);
  box-shadow: var(--aia-shadow-2);
  z-index: 2147483600;
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--aia-font);
  border: 1px solid var(--aia-border);
  /* 初始关闭态(透明 + 下沉 + 缩到 .88) */
  opacity: 0;
  transform: translateY(20px) scale(.88);
  transform-origin: bottom right;
  transition:
    opacity var(--aia-anim-dur) var(--aia-anim-ease),
    transform 420ms var(--aia-anim-ease);
  pointer-events: none;
}
.aiagent-sdk-panel.aiagent-sdk-open {
  display: flex;
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.aiagent-sdk-panel.aiagent-sdk-pos-bl { right: auto; left: 24px; transform-origin: bottom left; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-panel {
    transition: opacity 120ms linear;
    transform: none;
  }
}

/* ====================================================================
 * 头部
 * ==================================================================== */
.aiagent-sdk-header {
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--aia-primary), var(--aia-accent));
  color: #fff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.aiagent-sdk-header-info { display: flex; flex-direction: column; min-width: 0; }
.aiagent-sdk-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-subtitle {
  font-size: 11px;
  opacity: .85;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-header-actions { display: flex; gap: 4px; }
.aiagent-sdk-iconbtn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  width: 26px;
  height: 26px;
  border-radius: var(--aia-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 0;
  opacity: .85;
  transition: background 150ms var(--aia-anim-ease), opacity 150ms var(--aia-anim-ease);
}
.aiagent-sdk-iconbtn:hover { background: rgba(255,255,255,.15); opacity: 1; }
.aiagent-sdk-iconbtn:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }

/* ====================================================================
 * 消息区
 * ==================================================================== */
.aiagent-sdk-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--aia-bg-elev);
  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: var(--aia-text-faint) transparent;
}
.aiagent-sdk-messages::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-messages::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-messages::-webkit-scrollbar-track { background: transparent; }

/* ====================================================================
 * 消息气泡(聊天框里的消息框)
 *
 * 设计要点:
 *   - display: inline-block + width: fit-content → 宽度跟内容走,不会撑出空白
 *   - 不用 border(会跟输入框撞视觉),改用 box-shadow 立体感
 *   - 不用 1px 边框纯白底,改用浅蓝→浅紫渐变(assistant)与蓝渐变(user)
 *   - 不加微信尖角:渐变消息上尖角颜色难统一,纯圆角更干净
 * ==================================================================== */
.aiagent-sdk-msg {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: 85%;
  padding: 9px 13px;
  font-size: 13.5px;
  line-height: 1.5;
  word-wrap: break-word;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 2px 6px rgba(0,0,0,.04);
  /* 入场前态:大位移 + 小缩放,绝对看得见"消息冒出来" */
  opacity: 0;
  transform: translateY(16px) scale(.9);
  animation: aia-msg-in 420ms var(--aia-anim-ease) forwards;
  /* --i 由 JS 设置(消息下标),每条 delay 70ms,最多 5 */
  animation-delay: calc(min(var(--i, 0), 5) * 70ms);
}
@keyframes aia-msg-in {
  0%   { opacity: 0; transform: translateY(16px) scale(.9); }
  60%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg { animation: none; opacity: 1; transform: none; }
}

/* 用户消息:蓝→紫渐变 + 蓝色阴影(右侧) */
.aiagent-sdk-msg-user {
  align-self: flex-end;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(59,130,246,.32);
  animation-name: aia-msg-in-user;
}
@keyframes aia-msg-in-user {
  0%   { opacity: 0; transform: translateX(28px) scale(.9); }
  60%  { opacity: 1; transform: translateX(-3px) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}

/* assistant 消息:浅蓝→浅紫渐变 + 灰阴影(左侧,无边框) */
.aiagent-sdk-msg-assistant {
  align-self: flex-start;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  color: var(--aia-text);
  box-shadow: 0 2px 8px rgba(99,102,241,.10);
  animation-name: aia-msg-in-assistant;
}
@keyframes aia-msg-in-assistant {
  0%   { opacity: 0; transform: translateX(-28px) scale(.9); }
  60%  { opacity: 1; transform: translateX(3px) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
:host([data-theme="dark"]) .aiagent-sdk-msg-assistant {
  background: linear-gradient(135deg, #1e293b 0%, #2e1f47 100%);
  color: var(--aia-text);
  box-shadow: 0 2px 8px rgba(0,0,0,.30);
}

/* 系统提示(小字居中,胶囊背景) */
.aiagent-sdk-msg-system {
  align-self: center;
  background: var(--aia-bg-soft);
  color: var(--aia-text-faint);
  font-size: 11.5px;
  font-style: italic;
  padding: 4px 12px;
  border: none;
  box-shadow: none;
  border-radius: var(--aia-radius-pill);
  animation: aia-msg-in 380ms var(--aia-anim-ease) forwards;
}

/* 工具调用卡片(绿色调) */
.aiagent-sdk-msg-tool {
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  color: var(--aia-success);
  border: none;
  font-size: 12.5px;
  padding: 9px 13px;
  align-self: flex-start;
  max-width: 90%;
  border-radius: 14px;
  font-family: var(--aia-mono);
  box-shadow: 0 2px 8px rgba(16,185,129,.10);
}
:host([data-theme="dark"]) .aiagent-sdk-msg-tool {
  background: linear-gradient(135deg, #064e3b 0%, #14532d 100%);
}
.aiagent-sdk-msg-tool .aiagent-sdk-tool-title {
  font-family: var(--aia-font);
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
}
.aiagent-sdk-msg-tool pre {
  margin: 4px 0 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 11.5px;
}
.aiagent-sdk-msg b { font-weight: 600; }

/* ====================================================================
 * 流式光标(assistant 消息末尾 ▌ 闪烁)
 * 加 class="aiagent-sdk-typing-active" 的 assistant 消息 div 会在
 * 末尾生成一个 <span class="aia-cursor">▌</span>(由 typing.ts 注入)
 * ==================================================================== */
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after {
  content: '▌';
  display: inline-block;
  margin-left: 2px;
  color: var(--aia-primary);
  font-weight: 600;
  animation: aia-cursor-blink 1s steps(2) infinite;
}
@keyframes aia-cursor-blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg-assistant.aiagent-sdk-typing-active::after { animation: none; }
}

/* ====================================================================
 * 打字指示器(3 圆点)
 * ==================================================================== */
.aiagent-sdk-typing {
  align-self: flex-start;
  display: inline-flex;
  gap: 4px;
  padding: 10px 14px;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-md);
  border-bottom-left-radius: 2px;
  opacity: 0;
  transform: translateY(6px);
  animation: aia-msg-in 280ms var(--aia-anim-ease) forwards;
}
.aiagent-sdk-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--aia-text-faint);
  animation: aia-typing-bounce 1.2s infinite;
}
.aiagent-sdk-typing span:nth-child(2) { animation-delay: .2s; }
.aiagent-sdk-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes aia-typing-bounce {
  0%, 60%, 100% { opacity: .3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-typing span { animation: none; opacity: .6; }
}

/* ====================================================================
 * 工具卡骨架屏(等结果时 shimmer)
 * 加 class="aiagent-sdk-skeleton" 触发
 * ==================================================================== */
@keyframes aia-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.aiagent-sdk-skeleton {
  background: linear-gradient(
    90deg,
    var(--aia-bg-soft) 0%,
    rgba(255,255,255,.4) 50%,
    var(--aia-bg-soft) 100%
  );
  background-size: 200% 100%;
  animation: aia-shimmer 1.4s linear infinite;
  border-radius: var(--aia-radius-sm);
}
:host([data-theme="dark"]) .aiagent-sdk-skeleton {
  background: linear-gradient(
    90deg,
    var(--aia-bg-soft) 0%,
    rgba(255,255,255,.06) 50%,
    var(--aia-bg-soft) 100%
  );
  background-size: 200% 100%;
}

/* ====================================================================
 * 输入栏
 * ==================================================================== */
.aiagent-sdk-inputbar {
  padding: 10px;
  border-top: 1px solid var(--aia-border);
  background: var(--aia-bg);
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
/* 顶部扫光线(空闲时一直在扫,4s 一次) */
.aiagent-sdk-inputbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--aia-primary) 50%,
    transparent 100%
  );
  animation: aia-scanline 4s linear infinite;
  pointer-events: none;
}
@keyframes aia-scanline {
  0%   { left: -50%; }
  100% { left: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-inputbar::before { animation: none; opacity: .4; }
}
.aiagent-sdk-inputbar textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  padding: 8px 10px;
  font: inherit;
  font-size: 13.5px;
  line-height: 1.4;
  outline: none;
  max-height: 80px;
  background: var(--aia-bg);
  color: var(--aia-text);
  font-family: inherit;
  transition:
    border-color 160ms var(--aia-anim-ease),
    box-shadow 160ms var(--aia-anim-ease);
}
.aiagent-sdk-inputbar textarea:focus {
  border-color: var(--aia-primary);
  box-shadow: var(--aia-shadow-glow);
}
.aiagent-sdk-send {
  background: var(--aia-primary);
  color: #fff;
  border: none;
  border-radius: var(--aia-radius-sm);
  padding: 0 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  position: relative;
  transition:
    background 150ms var(--aia-anim-ease),
    transform 80ms var(--aia-anim-ease),
    box-shadow 200ms var(--aia-anim-ease);
  min-width: 54px;
}
.aiagent-sdk-send:hover:not(:disabled) {
  background: var(--aia-primary-strong);
  box-shadow: 0 0 0 4px rgba(59,130,246,.25);
}
.aiagent-sdk-send:active:not(:disabled) { transform: scale(.94); }
.aiagent-sdk-send:disabled {
  background: var(--aia-text-faint);
  cursor: not-allowed;
}

/* ====================================================================
 * 工具结果重试/取消卡片
 * ==================================================================== */
.aiagent-sdk-tool-result-failed {
  align-self: stretch;
  background: var(--aia-error-bg);
  border: 1px solid var(--aia-error-border);
  border-radius: var(--aia-radius-sm);
  padding: 10px 12px;
  margin: 2px 0;
  font-size: 12.5px;
  color: var(--aia-error);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: aia-msg-in 280ms var(--aia-anim-ease) forwards;
}
.aiagent-sdk-tool-result-failed-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.aiagent-sdk-tool-result-failed-header::before { content: "⚠️"; font-size: 14px; }
.aiagent-sdk-tool-result-failed-detail {
  font-weight: 400;
  opacity: .85;
  font-size: 12px;
  margin-left: 22px;
}
.aiagent-sdk-tool-result-actions {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  margin-left: 22px;
}
.aiagent-sdk-tool-result-actions button {
  font-family: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 150ms var(--aia-anim-ease), border-color 150ms var(--aia-anim-ease), color 150ms var(--aia-anim-ease), transform 80ms var(--aia-anim-ease);
}
.aiagent-sdk-tool-result-actions button:active { transform: scale(.96); }
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry {
  background: var(--aia-primary);
  color: #fff;
  border: 1px solid var(--aia-primary);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry:hover {
  background: var(--aia-primary-strong);
  border-color: var(--aia-primary-strong);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel {
  background: transparent;
  color: var(--aia-text-muted);
  border: 1px solid var(--aia-border);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel:hover {
  background: var(--aia-bg-soft);
  color: var(--aia-text);
  border-color: var(--aia-text-faint);
}

/* ====================================================================
 * Markdown 渲染样式(marked + DOMPurify)
 * ==================================================================== */
.aiagent-sdk-msg p { margin: .35em 0; }
.aiagent-sdk-msg p:first-child { margin-top: 0; }
.aiagent-sdk-msg p:last-child { margin-bottom: 0; }
.aiagent-sdk-msg h1, .aiagent-sdk-msg h2, .aiagent-sdk-msg h3, .aiagent-sdk-msg h4 {
  font-weight: 600;
  line-height: 1.3;
  margin: .7em 0 .3em;
}
.aiagent-sdk-msg h1 { font-size: 1.3em; }
.aiagent-sdk-msg h2 { font-size: 1.18em; }
.aiagent-sdk-msg h3 { font-size: 1.08em; }
.aiagent-sdk-msg h4 { font-size: 1em; }
.aiagent-sdk-msg ul, .aiagent-sdk-msg ol { margin: .4em 0; padding-left: 1.5em; }
.aiagent-sdk-msg li { margin: .15em 0; }
.aiagent-sdk-msg li > p { margin: .15em 0; }
.aiagent-sdk-msg blockquote {
  border-left: 3px solid var(--aia-border);
  padding: 2px 10px;
  margin: .5em 0;
  color: var(--aia-text-muted);
  background: rgba(0,0,0,.02);
  border-radius: 0 4px 4px 0;
}
:host([data-theme="dark"]) .aiagent-sdk-msg blockquote {
  background: rgba(255,255,255,.04);
  border-left-color: var(--aia-border-soft);
}
.aiagent-sdk-msg hr {
  border: none;
  border-top: 1px solid var(--aia-border);
  margin: .8em 0;
}
.aiagent-sdk-msg pre {
  background: var(--aia-pre-bg);
  border-radius: 6px;
  padding: 8px 10px;
  margin: .5em 0;
  overflow-x: auto;
  font-family: var(--aia-mono);
  font-size: 12.5px;
  line-height: 1.5;
  white-space: pre;
}
.aiagent-sdk-msg pre code { background: transparent; padding: 0; font-size: inherit; }
.aiagent-sdk-msg code {
  background: var(--aia-code-bg);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12.5px;
  font-family: var(--aia-mono);
}
.aiagent-sdk-msg a {
  color: var(--aia-link);
  text-decoration: underline;
  word-break: break-all;
}
.aiagent-sdk-msg a:hover { color: var(--aia-link-hover); }
.aiagent-sdk-msg table {
  border-collapse: separate;
  border-spacing: 0;
  margin: .6em 0;
  font-size: 13px;
  display: table;
  overflow: hidden;
  max-width: 100%;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  width: auto;
}
.aiagent-sdk-msg th, .aiagent-sdk-msg td {
  border: none;
  border-bottom: 1px solid var(--aia-border-soft);
  padding: 7px 12px;
  text-align: left;
  vertical-align: middle;
}
.aiagent-sdk-msg tr:last-child td { border-bottom: none; }
.aiagent-sdk-msg th {
  background: var(--aia-bg-elev);
  font-weight: 600;
  color: var(--aia-text);
}
.aiagent-sdk-msg tbody tr:nth-child(even) td {
  background: var(--aia-bg-soft);
}
.aiagent-sdk-msg del { color: var(--aia-text-faint); text-decoration: line-through; }
.aiagent-sdk-msg input[type=checkbox] { margin-right: 6px; }

/* ====================================================================
 * 图片(百分比缩放 + 加载模糊过渡)
 * ==================================================================== */
.aiagent-sdk-msg img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: .4em 0;
  display: block;
  cursor: zoom-in;
  background: rgba(0,0,0,.03);
}
.aiagent-sdk-msg img.aiagent-sdk-img-loading {
  opacity: .3;
  filter: blur(6px);
  transition: opacity .35s, filter .35s;
}
.aiagent-sdk-msg img.aiagent-sdk-img-loaded {
  opacity: 1;
  filter: none;
  transition: opacity .35s, filter .35s;
}
`;
