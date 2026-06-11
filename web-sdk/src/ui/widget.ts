/**
 * 浮窗 DOM 挂载 —— Shadow DOM 隔离版
 *
 * 挂载结构:
 *   document.body
 *     └── <div class="aiagent-sdk-host">          ← host 元素
 *           └── #shadow-root (mode: open)
 *                 ├── <style>WIDGET_CSS</style>
 *                 ├── <button class="aiagent-sdk-bubble ...">  ← 气泡
 *                 └── <div class="aiagent-sdk-panel ...">     ← 面板
 *                       ├── .aiagent-sdk-header
 *                       ├── .aiagent-sdk-messages
 *                       └── .aiagent-sdk-inputbar
 *
 * 收益:
 *   - 宿主页 CSS 一行都污染不到 SDK(也反过来)
 *   - 主题切换走 :host([data-theme="dark"]) 配合 CSS 变量
 *   - 调试时 devtools 能看到 #shadow-root 内容
 *
 * 对 agent.ts 完全透明 —— 仍通过 getRefs() 拿 msgEl / taEl / sendBtn,
 * 内部 querySelector / appendChild / scrollTop 全部正常。
 */

import { WIDGET_CSS } from './styles';

export interface WidgetOpts {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  avatar?: string;
  demoTools?: boolean;
}

export interface WidgetHandlers {
  onSend: () => void;
  onNew: () => void;
  onClose: () => void;
  onToggleExtract: () => void;
  onPanelOpen: () => void;
}

export interface WidgetRefs {
  host: HTMLDivElement;
  bubble: HTMLButtonElement;
  panel: HTMLDivElement;
  msgEl: HTMLDivElement;
  taEl: HTMLTextAreaElement;
  sendBtn: HTMLButtonElement;
}

export class Widget {
  private host: HTMLDivElement | null = null;
  private shadow: ShadowRoot | null = null;
  private bubble: HTMLButtonElement | null = null;
  private panel: HTMLDivElement | null = null;
  private msgEl: HTMLDivElement | null = null;
  private taEl: HTMLTextAreaElement | null = null;
  private sendBtn: HTMLButtonElement | null = null;
  private isOpen = false;
  private mounted = false;

  constructor(
    private readonly opts: WidgetOpts,
    private readonly handlers: WidgetHandlers
  ) {}

  /** 暴露 DOM 引用(供 agent.ts 写消息、scroll 到底) */
  getRefs(): WidgetRefs | null {
    if (
      !this.host ||
      !this.bubble ||
      !this.panel ||
      !this.msgEl ||
      !this.taEl ||
      !this.sendBtn
    ) {
      return null;
    }
    return {
      host: this.host,
      bubble: this.bubble,
      panel: this.panel,
      msgEl: this.msgEl,
      taEl: this.taEl,
      sendBtn: this.sendBtn,
    };
  }

  mount(): void {
    if (this.mounted) return;
    if (typeof document === 'undefined') return;

    // 1. host 元素(挂在 body 下,自身没样式,只作 shadow root 容器)
    const host = document.createElement('div');
    host.className = 'aiagent-sdk-host';
    // data-position 供 CSS 做 :host([data-position='bottom-left']) 选择器
    host.setAttribute('data-position', this.opts.position || 'bottom-right');
    // data-theme 切换主题
    host.setAttribute('data-theme', this.opts.theme || 'light');
    document.body.appendChild(host);
    this.host = host;

    // 2. attachShadow — open 模式,devtools 可检查
    const shadow = host.attachShadow({ mode: 'open' });
    this.shadow = shadow;

    // 3. 注入 CSS 到 shadow root
    const styleEl = document.createElement('style');
    styleEl.textContent = WIDGET_CSS;
    shadow.appendChild(styleEl);

    // 4. 气泡按钮
    const pos = this.opts.position === 'bottom-left' ? ' aiagent-sdk-pos-bl' : '';
    const bubble = document.createElement('button');
    bubble.className = 'aiagent-sdk-bubble' + pos;
    bubble.setAttribute('aria-label', this.opts.title || 'AI 助手');
    bubble.title = this.opts.title || 'AI 助手';
    bubble.innerHTML = this.opts.avatar || '🤖';
    bubble.addEventListener('click', () => this.toggle());
    shadow.appendChild(bubble);
    this.bubble = bubble;

    // 5. 面板
    const panel = document.createElement('div');
    panel.className = 'aiagent-sdk-panel' + pos;
    const demoToolsBtn = this.opts.demoTools
      ? '<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式">📋</button>'
      : '';
    panel.innerHTML = [
      '<div class="aiagent-sdk-header">',
      '  <div class="aiagent-sdk-header-info">',
      '    <div class="aiagent-sdk-title"></div>',
      '    <div class="aiagent-sdk-subtitle"></div>',
      '  </div>',
      '  <div class="aiagent-sdk-header-actions">',
      demoToolsBtn,
      '    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话">＋</button>',
      '    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭">✕</button>',
      '  </div>',
      '</div>',
      '<div class="aiagent-sdk-messages"></div>',
      '<div class="aiagent-sdk-inputbar">',
      '  <textarea rows="1" placeholder=""></textarea>',
      '  <button class="aiagent-sdk-send">发送</button>',
      '</div>',
    ].join('');
    shadow.appendChild(panel);
    this.panel = panel;

    // 6. 填文本
    const titleEl = panel.querySelector('.aiagent-sdk-title') as HTMLElement;
    const subEl = panel.querySelector('.aiagent-sdk-subtitle') as HTMLElement;
    titleEl.textContent = this.opts.title || 'AI 助手';
    subEl.textContent = this.opts.subtitle || '在线';
    const ta = panel.querySelector('textarea') as HTMLTextAreaElement;
    ta.placeholder = this.opts.placeholder || '输入消息,Enter 发送,Shift+Enter 换行';

    // 7. 引用 + 事件绑定(全部在 shadow root 内)
    this.msgEl = panel.querySelector('.aiagent-sdk-messages') as HTMLDivElement;
    this.taEl = ta;
    this.sendBtn = panel.querySelector('.aiagent-sdk-send') as HTMLButtonElement;
    const closeBtn = panel.querySelector('.aiagent-sdk-close') as HTMLElement;
    const newBtn = panel.querySelector('.aiagent-sdk-new') as HTMLElement;
    const extractBtn = panel.querySelector('.aiagent-sdk-extract') as HTMLElement | null;

    closeBtn.addEventListener('click', () => this.handlers.onClose());
    newBtn.addEventListener('click', () => this.handlers.onNew());
    if (extractBtn) {
      extractBtn.addEventListener('click', () =>
        this.handlers.onToggleExtract()
      );
    }
    this.sendBtn.addEventListener('click', () => this.handlers.onSend());
    ta.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handlers.onSend();
      }
    });
    // 自适应高度
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
    });

    // 8. 初始 data-theme(配合 CSS 变量)
    this.setTheme(this.opts.theme || 'light');

    this.mounted = true;
  }

  destroy(): void {
    if (!this.mounted) return;
    if (this.host && this.host.parentNode) {
      this.host.parentNode.removeChild(this.host);
    }
    this.host = null;
    this.shadow = null;
    this.bubble = null;
    this.panel = null;
    this.msgEl = null;
    this.taEl = null;
    this.sendBtn = null;
    this.mounted = false;
    this.isOpen = false;
  }

  open(): void {
    if (!this.panel) return;
    this.panel.classList.add('aiagent-sdk-open');
    this.isOpen = true;
    setTimeout(() => {
      if (this.taEl) this.taEl.focus();
    }, 50);
    this.handlers.onPanelOpen();
  }

  close(): void {
    if (!this.panel) return;
    this.panel.classList.remove('aiagent-sdk-open');
    this.isOpen = false;
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }

  /** 切主题(走 :host([data-theme='dark']) 选择器 + CSS 变量覆盖) */
  setTheme(theme: 'light' | 'dark'): void {
    if (!this.host) return;
    this.host.setAttribute('data-theme', theme);
  }

  /** 清空消息区 */
  clearMessages(): void {
    if (this.msgEl) this.msgEl.innerHTML = '';
  }
}
