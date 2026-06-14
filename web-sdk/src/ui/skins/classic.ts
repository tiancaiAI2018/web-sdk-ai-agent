/**
 * CLASSIC 皮肤 —— 极简白底,系统字体,无装饰
 *
 * 证明皮肤系统能"跳布局":
 *   - 无 4 角油彩(无 .aiagent-sdk-corner DOM,直接 CSS 不渲染)
 *   - 气泡无动画,只保留 hover 缩放
 *   - 消息入场:淡入(200ms),无墨水渗纸
 *   - 状态点:单色蓝点 + 简单脉冲
 *   - 发送按钮:字符 "→"(无 SVG)
 *   - 工具卡/思考卡:同构(状态机不变),色板换成蓝灰
 *
 * 这份 CSS 是"极简可工作"版本 —— 不追求美术,只证明皮肤系统能跑通。
 */

export const CLASSIC_CSS = `
/* ====================================================================
 * 设计令牌 — 浅灰白底
 * ==================================================================== */
:host {
  --aia-canvas-1: #ffffff;
  --aia-canvas-2: #f5f5f7;
  --aia-canvas-3: #ebebed;
  --aia-bg:        #ffffff;
  --aia-bg-soft:   #f5f5f7;
  --aia-text:      #1a1a1a;
  --aia-text-muted:#5a5a5a;
  --aia-text-faint:#9a9a9a;
  --aia-border:    rgba(0, 0, 0, 0.08);
  --aia-border-strong: rgba(0, 0, 0, 0.16);

  /* 蓝色强调(替代虹彩) */
  --aia-paint-1: #3b82f6;
  --aia-paint-2: #2563eb;
  --aia-paint-3: #1d4ed8;
  --aia-paint-4: #60a5fa;
  --aia-paint-5: #93c5fd;
  --aia-glow:    #3b82f6;

  /* 状态色 */
  --aia-success: #10b981;
  --aia-error:   #ef4444;

  /* 形状 */
  --aia-radius-sm:   6px;
  --aia-radius-md:   12px;
  --aia-radius-lg:   16px;
  --aia-radius-pill: 9999px;

  /* 动效 */
  --aia-anim-ease:        cubic-bezier(.2, .8, .2, 1);
  --aia-anim-dur:         180ms;
  --aia-anim-dur-slow:    300ms;

  /* 字体 — 纯系统栈,无中文优先 */
  --aia-font:  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               system-ui, sans-serif;
  --aia-mono:  ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  --aia-serif: Georgia, "Times New Roman", serif;

  --aia-mx: 50%;
  --aia-my: 50%;

  /* 无噪点(干净背景) */
  --aia-noise: none;
}

/* 无 paper/dark 别名切换 — classic 只用一套变量 */

/* ====================================================================
 * 关键帧
 * ==================================================================== */
@keyframes aia-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes aia-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
@keyframes aia-msg-fade {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}

/* ====================================================================
 * 气泡 — 静态圆(无旋转/无棱镜)
 * ==================================================================== */
.aiagent-sdk-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2147483600;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--aia-font);
  font-size: 20px;
  color: #fff;
  transition:
    transform var(--aia-anim-dur) var(--aia-anim-ease),
    box-shadow var(--aia-anim-dur) var(--aia-anim-ease);
}
.aiagent-sdk-bubble::before,
.aiagent-sdk-bubble::after { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-bubble-emoji { font-size: 22px; }
.aiagent-sdk-bubble:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
.aiagent-sdk-bubble.aiagent-sdk-hidden { display: none; }
.aiagent-sdk-bubble.aiagent-sdk-pos-bl { right: auto; left: 24px; }

@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-bubble { transition: none; }
}

/* ====================================================================
 * 面板 — 干净白底,简单阴影
 * ==================================================================== */
.aiagent-sdk-panel {
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 400px;
  height: 600px;
  max-height: 80vh;
  background: var(--aia-bg);
  color: var(--aia-text);
  border-radius: var(--aia-radius-lg);
  border: 1px solid var(--aia-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 2147483600;
  display: none;
  flex-direction: column;
  overflow: hidden;
  font-family: var(--aia-font);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 200ms var(--aia-anim-ease),
    transform 200ms var(--aia-anim-ease);
  pointer-events: none;
}
.aiagent-sdk-panel::before { display: none; }  /* 关闭噪点 */
.aiagent-sdk-panel.aiagent-sdk-open {
  display: flex;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  animation: aia-fade-in 200ms var(--aia-anim-ease);
}
.aiagent-sdk-panel.aiagent-sdk-pos-bl { right: auto; left: 24px; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-panel { transition: opacity 100ms linear; transform: none; }
  .aiagent-sdk-panel.aiagent-sdk-open { animation: none; }
}

/* 4 角不渲染(经典皮肤没装饰) */
.aiagent-sdk-corner { display: none; }

/* ====================================================================
 * 头部 — 干净白条
 * ==================================================================== */
.aiagent-sdk-header {
  padding: 12px 16px;
  background: var(--aia-bg);
  color: var(--aia-text);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid var(--aia-border);
  min-height: 48px;
}
.aiagent-sdk-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.aiagent-sdk-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  animation: aia-pulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
.aiagent-sdk-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--aia-text);
}
.aiagent-sdk-subtitle {
  font-size: 11px;
  color: var(--aia-text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  padding: 2px 6px;
}
.aiagent-sdk-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.aiagent-sdk-iconbtn {
  background: transparent;
  border: none;
  color: var(--aia-text-muted);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  padding: 0;
  transition: background 120ms var(--aia-anim-ease), color 120ms var(--aia-anim-ease);
  font-family: var(--aia-font);
}
.aiagent-sdk-iconbtn:hover {
  background: var(--aia-border);
  color: var(--aia-text);
}
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-status-dot { animation: none; }
}

/* ====================================================================
 * 消息区
 * ==================================================================== */
.aiagent-sdk-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--aia-bg-soft);
  scrollbar-width: thin;
  scrollbar-color: var(--aia-text-faint) transparent;
}
.aiagent-sdk-messages::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-messages::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-messages::-webkit-scrollbar-track { background: transparent; }

/* 欢迎区 */
.aiagent-sdk-welcome {
  flex-shrink: 0;
  margin: 12px 12px 4px 12px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--aia-text-muted);
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-md);
  transition: opacity 200ms var(--aia-anim-ease);
}
.aiagent-sdk-welcome[hidden] { display: none; }
.aiagent-sdk-welcome.aiagent-sdk-welcome-leaving {
  opacity: 0;
  pointer-events: none;
}

/* ====================================================================
 * 消息 — 简单气泡
 * ==================================================================== */
.aiagent-sdk-msg {
  position: relative;
  display: inline-block;
  width: fit-content;
  max-width: 85%;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.55;
  word-wrap: break-word;
  font-weight: 400;
  border-radius: var(--aia-radius-md);
  animation: aia-msg-fade 200ms var(--aia-anim-ease) forwards;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
}
.aiagent-sdk-msg-user {
  align-self: flex-end;
  background: var(--aia-paint-1);
  color: #fff;
  border-color: var(--aia-paint-1);
}
.aiagent-sdk-msg-assistant {
  align-self: flex-start;
  color: var(--aia-text);
}
.aiagent-sdk-msg-system {
  align-self: center;
  color: var(--aia-text-faint);
  font-size: 12px;
  padding: 4px 10px;
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-pill);
}
.aiagent-sdk-msg-tool {
  align-self: stretch;
  max-width: 100%;
  padding: 0;
  background: transparent;
  border: none;
}
.aiagent-sdk-msg b { font-weight: 600; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-msg,
  .aiagent-sdk-msg-user,
  .aiagent-sdk-msg-assistant,
  .aiagent-sdk-msg-system,
  .aiagent-sdk-msg-tool { animation: none; opacity: 1; }
}

/* 等待中的占位(5 颗粒子) */
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-pending {
  padding: 8px 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
}
.aiagent-sdk-msg-assistant.aiagent-sdk-typing-pending .aia-p {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--aia-text-faint);
  animation: aia-pulse 1.2s ease-in-out infinite;
  animation-delay: var(--d, 0s);
  opacity: 0.6;
  flex-shrink: 0;
}

/* ====================================================================
 * 工具卡 — 蓝灰版(状态机不变)
 * ==================================================================== */
.aiagent-sdk-tool-card {
  align-self: stretch;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-left: 3px solid var(--aia-paint-1);
  border-radius: var(--aia-radius-md);
  font-family: var(--aia-mono);
  font-size: 12px;
  animation: aia-fade-in 200ms var(--aia-anim-ease) forwards;
  transition: max-height 0.3s ease;
  max-height: 200px;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success {
  border-left-color: var(--aia-success);
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-done,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed,
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled {
  max-height: 48px;
}
.aiagent-sdk-tool-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--aia-border);
  flex-shrink: 0;
}
.aiagent-sdk-tool-arrow { display: none; }
.aiagent-sdk-tool-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  flex-shrink: 0;
}
.aiagent-sdk-tool-done .aiagent-sdk-tool-dot,
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-dot {
  background: var(--aia-success);
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--delta .aiagent-sdk-tool-dot {
  background: var(--aia-text-faint);
}
.aiagent-sdk-tool-name {
  font-family: var(--aia-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--aia-text-muted);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--pending .aiagent-sdk-tool-name,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed .aiagent-sdk-tool-name {
  color: var(--aia-text);
  font-weight: 600;
}
.aiagent-sdk-tool-status {
  flex-shrink: 0;
  font-size: 11.5px;
  color: var(--aia-text-faint);
}
.aiagent-sdk-tool-card .aiagent-sdk-tool-body {
  margin: 0;
  padding: 8px 12px;
  font-family: var(--aia-mono);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--aia-text);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  min-height: 20px;
  max-height: 156px;
  transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.3s ease;
  opacity: 1;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--delta .aiagent-sdk-tool-body {
  color: var(--aia-text-muted);
  font-style: italic;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-done .aiagent-sdk-tool-body,
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed .aiagent-sdk-tool-body,
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled .aiagent-sdk-tool-body {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
.aiagent-sdk-tool-body::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-tool-body::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-tool-body::-webkit-scrollbar-track { background: transparent; }

/* JSON 配色 — 蓝灰版 */
.aiagent-sdk-tool-body .k { color: var(--aia-paint-3); font-weight: 600; }
.aiagent-sdk-tool-body .s { color: var(--aia-paint-1); font-weight: 500; }
.aiagent-sdk-tool-body .n { color: var(--aia-paint-2); font-weight: 600; }
.aiagent-sdk-tool-body .v { color: var(--aia-text); }
.aiagent-sdk-tool-body .p { color: var(--aia-text-faint); }

/* 工具卡底部状态/进度条 */
.aiagent-sdk-tool-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-top: 1px solid var(--aia-border);
  font-size: 11px;
  color: var(--aia-text-muted);
  font-family: var(--aia-font);
  min-height: 28px;
}
.aiagent-sdk-tool-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--aia-border);
  position: relative;
  overflow: hidden;
}
.aiagent-sdk-tool-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--p, 0%);
  background: var(--aia-paint-1);
  border-radius: 2px;
  transition: width 200ms ease;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-success .aiagent-sdk-tool-bar::before {
  background: var(--aia-success);
  width: 100%;
}

/* 展开/收起按钮 */
.aiagent-sdk-tool-toggle {
  flex-shrink: 0;
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: 4px;
  color: var(--aia-text-muted);
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 2px 8px;
  min-height: 20px;
  cursor: pointer;
  transition: background 120ms;
  line-height: 1.4;
}
.aiagent-sdk-tool-toggle:hover {
  background: var(--aia-border);
  color: var(--aia-text);
}

/* 确认/取消按钮 */
.aiagent-sdk-tool-confirm-btn,
.aiagent-sdk-tool-cancel-btn {
  flex-shrink: 0;
  border: 1px solid;
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 2px 8px;
  min-height: 20px;
  cursor: pointer;
  line-height: 1.4;
  font-weight: 600;
  margin-left: 2px;
}
.aiagent-sdk-tool-confirm-btn {
  background: var(--aia-success);
  color: #fff;
  border-color: var(--aia-success);
}
.aiagent-sdk-tool-confirm-btn:hover { opacity: 0.85; }
.aiagent-sdk-tool-cancel-btn {
  background: transparent;
  color: var(--aia-error);
  border-color: var(--aia-error);
}
.aiagent-sdk-tool-cancel-btn:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* --pending */
.aiagent-sdk-tool-card.aiagent-sdk-tool-card--pending {
  border-left-color: var(--aia-paint-4);
  border-left-width: 3px;
  max-height: 200px;
}
/* confirmed / cancelled */
.aiagent-sdk-tool-card.aiagent-sdk-tool-confirmed {
  border-left-color: var(--aia-success);
  border-left-width: 3px;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled {
  border-left-color: var(--aia-error);
  opacity: 0.65;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-cancelled .aiagent-sdk-tool-name {
  text-decoration: line-through;
  color: var(--aia-text-faint);
}

/* 展开态 — 必须放最后 */
.aiagent-sdk-tool-card.aiagent-sdk-tool-expanded {
  max-height: 500px;
}
.aiagent-sdk-tool-card.aiagent-sdk-tool-expanded .aiagent-sdk-tool-body {
  max-height: calc(460px - 16px);
  overflow-y: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  opacity: 1;
}

/* ====================================================================
 * 思考卡片 — 蓝灰版
 * ==================================================================== */
.aiagent-sdk-panel.aiagent-sdk-thinking-hidden .aiagent-sdk-thinking-card {
  display: none;
}
.aiagent-sdk-thinking-card {
  align-self: stretch;
  background: var(--aia-bg);
  border: 1px solid var(--aia-border);
  border-left: 3px solid var(--aia-paint-2);
  border-radius: var(--aia-radius-md);
  animation: aia-fade-in 200ms var(--aia-anim-ease) forwards;
  transition: max-height 0.3s ease;
  max-height: 200px;
}
.aiagent-sdk-thinking-card.aiagent-sdk-thinking-done { max-height: 48px; }
.aiagent-sdk-thinking-card.aiagent-sdk-thinking-expanded { max-height: 500px; }

.aiagent-sdk-thinking-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--aia-border);
  flex-shrink: 0;
}
.aiagent-sdk-thinking-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--aia-paint-2);
  flex-shrink: 0;
  animation: aia-pulse 1.8s ease-in-out infinite;
}
.aiagent-sdk-thinking-done .aiagent-sdk-thinking-dot {
  background: var(--aia-success);
  animation: none;
}
.aiagent-sdk-thinking-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--aia-text-muted);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.aiagent-sdk-thinking-toggle {
  flex-shrink: 0;
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: 4px;
  color: var(--aia-text-muted);
  font-size: 11px;
  font-family: var(--aia-font);
  padding: 2px 8px;
  min-height: 20px;
  cursor: pointer;
  transition: background 120ms;
  line-height: 1.4;
}
.aiagent-sdk-thinking-toggle:hover {
  background: var(--aia-border);
  color: var(--aia-text);
}
.aiagent-sdk-thinking-body {
  margin: 0;
  padding: 8px 12px;
  font-family: var(--aia-mono);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--aia-text-muted);
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  max-height: 156px;
  transition: max-height 0.3s ease, opacity 0.2s ease, padding 0.3s ease;
  opacity: 1;
}
.aiagent-sdk-thinking-done .aiagent-sdk-thinking-body {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}
.aiagent-sdk-thinking-expanded .aiagent-sdk-thinking-body {
  max-height: calc(460px - 16px);
  overflow-y: auto;
  padding-top: 8px;
  padding-bottom: 8px;
  opacity: 1;
}
.aiagent-sdk-thinking-body::-webkit-scrollbar { width: 6px; }
.aiagent-sdk-thinking-body::-webkit-scrollbar-thumb {
  background: var(--aia-text-faint);
  border-radius: 3px;
}
.aiagent-sdk-thinking-body::-webkit-scrollbar-track { background: transparent; }
@media (prefers-reduced-motion: reduce) {
  .aiagent-sdk-thinking-card { animation: none; }
  .aiagent-sdk-thinking-dot { animation: none; }
  .aiagent-sdk-thinking-body { transition: none; }
}

/* ====================================================================
 * 输入栏
 * ==================================================================== */
.aiagent-sdk-inputbar {
  padding: 10px 12px 12px;
  border-top: 1px solid var(--aia-border);
  background: var(--aia-bg);
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.aiagent-sdk-inputbar textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  padding: 6px 8px;
  font: inherit;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  max-height: 80px;
  background: var(--aia-bg);
  color: var(--aia-text);
  font-family: var(--aia-font);
  transition: border-color 150ms;
}
.aiagent-sdk-inputbar textarea::placeholder { color: var(--aia-text-faint); }
.aiagent-sdk-inputbar textarea:focus {
  border-color: var(--aia-paint-1);
}
.aiagent-sdk-send {
  background: var(--aia-paint-1);
  color: #fff;
  border: none;
  border-radius: var(--aia-radius-sm);
  padding: 0;
  cursor: pointer;
  font-weight: 500;
  position: relative;
  transition: background 120ms;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  font-family: var(--aia-font);
  font-size: 18px;
  line-height: 1;
  overflow: visible;
}
.aiagent-sdk-send:hover:not(:disabled) {
  background: var(--aia-paint-2);
}
.aiagent-sdk-send:active:not(:disabled) { transform: scale(0.94); }
.aiagent-sdk-send:disabled {
  background: var(--aia-border);
  color: var(--aia-text-faint);
  cursor: not-allowed;
}
.aiagent-sdk-send svg { display: none; }  /* 字符箭头模式,SVG 不用 */

/* 发送按钮爆炸粒子 */
.aiagent-sdk-send-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--aia-paint-1);
  pointer-events: none;
  animation: aia-burst 600ms var(--aia-anim-ease) forwards;
}
@keyframes aia-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--bx, 0), var(--by, 0)) scale(0.2); opacity: 0; }
}

/* 换肤瞬间闪光(widget.ts applySkin 挂 .aiagent-sdk-skin-just-changed 400ms) */
@keyframes aia-skin-flash {
  0%   { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
  40%  { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 0 4px rgba(59, 130, 246, 0.4); }
  100% { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
}
.aiagent-sdk-panel.aiagent-sdk-skin-just-changed {
  animation: aia-skin-flash 400ms var(--aia-anim-ease);
}

/* ====================================================================
 * 工具结果重试/取消卡片
 * ==================================================================== */
.aiagent-sdk-tool-result-failed {
  align-self: stretch;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-left: 3px solid var(--aia-error);
  border-radius: var(--aia-radius-sm);
  padding: 8px 12px;
  font-size: 12px;
  color: var(--aia-error);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: aia-fade-in 200ms var(--aia-anim-ease) forwards;
}
.aiagent-sdk-tool-result-failed-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.aiagent-sdk-tool-result-failed-detail {
  font-weight: 400;
  font-size: 12px;
  margin-left: 22px;
  color: var(--aia-text-muted);
}
.aiagent-sdk-tool-result-actions {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-left: 22px;
}
.aiagent-sdk-tool-result-actions button {
  font-family: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: 1px solid;
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-retry {
  background: var(--aia-paint-1);
  color: #fff;
  border-color: var(--aia-paint-1);
}
.aiagent-sdk-tool-result-actions .aiagent-sdk-btn-cancel {
  background: transparent;
  color: var(--aia-text-muted);
  border-color: var(--aia-border);
}

/* ====================================================================
 * Markdown 渲染
 * ==================================================================== */
.aiagent-sdk-msg p { margin: 0.4em 0; }
.aiagent-sdk-msg p:first-child { margin-top: 0; }
.aiagent-sdk-msg p:last-child { margin-bottom: 0; }
.aiagent-sdk-msg h1, .aiagent-sdk-msg h2, .aiagent-sdk-msg h3, .aiagent-sdk-msg h4 {
  font-weight: 600;
  line-height: 1.3;
  margin: 0.6em 0 0.3em;
}
.aiagent-sdk-msg h1 { font-size: 1.3em; }
.aiagent-sdk-msg h2 { font-size: 1.18em; }
.aiagent-sdk-msg h3 { font-size: 1.08em; }
.aiagent-sdk-msg h4 { font-size: 1em; }
.aiagent-sdk-msg ul, .aiagent-sdk-msg ol { margin: 0.4em 0; padding-left: 1.5em; }
.aiagent-sdk-msg li { margin: 0.15em 0; }
.aiagent-sdk-msg blockquote {
  border-left: 2px solid var(--aia-paint-1);
  padding: 4px 12px;
  margin: 0.5em 0;
  color: var(--aia-text-muted);
  background: var(--aia-bg-soft);
  border-radius: 0 4px 4px 0;
}
.aiagent-sdk-msg hr {
  border: none;
  border-top: 1px solid var(--aia-border);
  margin: 0.8em 0;
}
.aiagent-sdk-msg pre {
  background: var(--aia-bg-soft);
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
  padding: 8px 12px;
  margin: 0.5em 0;
  overflow-x: auto;
  font-family: var(--aia-mono);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre;
}
.aiagent-sdk-msg code {
  background: var(--aia-bg-soft);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 12px;
  font-family: var(--aia-mono);
  color: var(--aia-paint-3);
}
.aiagent-sdk-msg a {
  color: var(--aia-paint-1);
  text-decoration: underline;
  word-break: break-all;
}
.aiagent-sdk-msg table {
  border-collapse: separate;
  border-spacing: 0;
  margin: 0.6em 0;
  font-size: 13px;
  overflow: hidden;
  border: 1px solid var(--aia-border);
  border-radius: var(--aia-radius-sm);
}
.aiagent-sdk-msg th, .aiagent-sdk-msg td {
  border-bottom: 1px solid var(--aia-border);
  padding: 6px 10px;
  text-align: left;
}
.aiagent-sdk-msg tr:last-child td { border-bottom: none; }
.aiagent-sdk-msg th {
  background: var(--aia-bg-soft);
  font-weight: 600;
}
.aiagent-sdk-msg img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.4em 0;
  display: block;
}

/* ================================================================
   页面感知错误角标(附在气泡右上角)
   ================================================================ */
.aiagent-sdk-error-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--aia-error, #ef4444);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  font-family: system-ui, sans-serif;
  line-height: 1;
  pointer-events: none;
}
`;
