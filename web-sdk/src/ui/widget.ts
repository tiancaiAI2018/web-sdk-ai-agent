/**
 * 浮窗 DOM 挂载 —— Shadow DOM 隔离版(IRIDESCENT BLOOM v5 重做)
 *
 * 上版问题:
 *   - 发送按钮 "↑" + ::after 白点 渲染成 "Ai+",乱
 *   - 4 角只有 2 个(走 ::before/::after),另外 2 个没生效
 *   - 鼠标光斑跟随没做
 *
 * 本版修正:
 *   - 发送按钮 = 真 SVG 箭头,无文字,无 ::after
 *   - 4 角 = 4 个独立 div(.aiagent-sdk-corner-tl/tr/bl/br)
 *   - mousemove 时光斑跟随(更新 --aia-mx/--aia-my)
 *   - 气泡 = ::before 棱镜 + ::after 内核高光
 */

import { WIDGET_CSS } from './styles';

export interface WidgetOpts {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  theme?: 'light' | 'dark' | 'paper' | 'ink';
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

const SEND_ICON_SVG = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12 L19 12 M13 6 L19 12 L13 18"/>
</svg>
`.trim();

export class Widget {
  private host: HTMLDivElement | null = null;
  private shadow: ShadowRoot | null = null;
  private bubble: HTMLButtonElement | null = null;
  private panel: HTMLDivElement | null = null;
  private msgEl: HTMLDivElement | null = null;
  private taEl: HTMLTextAreaElement | null = null;
  private sendBtn: HTMLButtonElement | null = null;
  private welcomeEl: HTMLDivElement | null = null;
  private isOpen = false;
  private mounted = false;
  private avatarRaw = '🤖';
  private onMouseMove: ((e: MouseEvent) => void) | null = null;

  constructor(
    private readonly opts: WidgetOpts,
    private readonly handlers: WidgetHandlers
  ) {}

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

    const host = document.createElement('div');
    host.className = 'aiagent-sdk-host';
    host.setAttribute('data-position', this.opts.position || 'bottom-right');
    host.setAttribute('data-theme', this.opts.theme || 'ink');
    document.body.appendChild(host);
    this.host = host;

    const shadow = host.attachShadow({ mode: 'open' });
    this.shadow = shadow;

    const styleEl = document.createElement('style');
    styleEl.textContent = WIDGET_CSS;
    shadow.appendChild(styleEl);

    // 4. 气泡(默认走"棱镜"路径;emoji 头像走简单文本)
    const pos = this.opts.position === 'bottom-left' ? ' aiagent-sdk-pos-bl' : '';
    this.avatarRaw = this.opts.avatar || '🤖';
    // 只在 avatar 长度 <= 2 时认为是 emoji(🤖 代理对 = 2;汉字 1;SVG 字符串 > 2)
    const isEmoji = this.avatarRaw.length <= 2;
    const bubble = document.createElement('button');
    if (isEmoji) {
      bubble.className = 'aiagent-sdk-bubble aiagent-sdk-bubble-emoji' + pos;
      bubble.textContent = this.avatarRaw;
    } else {
      bubble.className = 'aiagent-sdk-bubble' + pos;
    }
    bubble.setAttribute('aria-label', this.opts.title || 'AI 助手 - 点击打开对话');
    bubble.title = this.opts.title || 'AI 助手';
    bubble.addEventListener('click', () => this.toggle());
    shadow.appendChild(bubble);
    this.bubble = bubble;

    // 5. 面板
    const panel = document.createElement('div');
    panel.className = 'aiagent-sdk-panel' + pos;
    const demoToolsBtn = this.opts.demoTools
      ? '<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式" aria-label="录单模式">⊕</button>'
      : '';
    panel.innerHTML = [
      // 4 角油彩飞溅
      '<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>',
      '<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>',
      '<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>',
      '<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>',
      // 极简头部
      '<div class="aiagent-sdk-header">',
      '  <div class="aiagent-sdk-header-info">',
      '    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>',
      '    <span class="aiagent-sdk-title"></span>',
      '  </div>',
      '  <div class="aiagent-sdk-header-actions">',
      '    <span class="aiagent-sdk-subtitle"></span>',
      demoToolsBtn,
      '    <button class="aiagent-sdk-iconbtn aiagent-sdk-toggle-thinking" title="显示/隐藏 思考过程" aria-label="思考">🧠</button>',
      '    <button class="aiagent-sdk-iconbtn aiagent-sdk-new" title="新会话" aria-label="新会话">＋</button>',
      '    <button class="aiagent-sdk-iconbtn aiagent-sdk-close" title="关闭" aria-label="关闭">✕</button>',
      '  </div>',
      '</div>',
      // 欢迎区(专属,非消息,默认隐藏)
      '<div class="aiagent-sdk-welcome" hidden></div>',
      // 消息区
      '<div class="aiagent-sdk-messages" role="log" aria-live="polite"></div>',
      // 输入栏(SVG 箭头)
      '<div class="aiagent-sdk-inputbar">',
      '  <textarea rows="1" placeholder="" aria-label="输入消息"></textarea>',
      `  <button class="aiagent-sdk-send" aria-label="发送">${SEND_ICON_SVG}</button>`,
      '</div>',
    ].join('');
    shadow.appendChild(panel);
    this.panel = panel;

    // 6. 填文本
    const titleEl = panel.querySelector('.aiagent-sdk-title') as HTMLElement;
    const subEl = panel.querySelector('.aiagent-sdk-subtitle') as HTMLElement;
    titleEl.textContent = this.opts.title || 'AI 助手';
    subEl.textContent = this.opts.subtitle || '';
    const ta = panel.querySelector('textarea') as HTMLTextAreaElement;
    ta.placeholder = this.opts.placeholder || '输入消息,Enter 发送,Shift+Enter 换行';

    // 7. 引用 + 事件
    this.msgEl = panel.querySelector('.aiagent-sdk-messages') as HTMLDivElement;
    this.taEl = ta;
    this.sendBtn = panel.querySelector('.aiagent-sdk-send') as HTMLButtonElement;
    this.welcomeEl = panel.querySelector('.aiagent-sdk-welcome') as HTMLDivElement;
    const closeBtn = panel.querySelector('.aiagent-sdk-close') as HTMLElement;
    const newBtn = panel.querySelector('.aiagent-sdk-new') as HTMLElement;
    const extractBtn = panel.querySelector('.aiagent-sdk-extract') as HTMLElement | null;
    const thinkingBtn = panel.querySelector('.aiagent-sdk-toggle-thinking') as HTMLElement | null;

    closeBtn.addEventListener('click', () => this.handlers.onClose());
    newBtn.addEventListener('click', () => this.handlers.onNew());
    if (extractBtn) {
      extractBtn.addEventListener('click', () => this.handlers.onToggleExtract());
    }
    if (thinkingBtn) {
      thinkingBtn.addEventListener('click', () => {
        this.panel!.classList.toggle('aiagent-sdk-thinking-hidden');
        const hidden = this.panel!.classList.contains('aiagent-sdk-thinking-hidden');
        thinkingBtn.style.opacity = hidden ? '0.4' : '1';
      });
    }
    this.sendBtn.addEventListener('click', () => {
      this._burstSend();
      this.handlers.onSend();
    });
    ta.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._burstSend();
        this.handlers.onSend();
      }
    });
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 80) + 'px';
    });

    // 8. 鼠标光斑跟随(mousemove → CSS 变量)
    this.onMouseMove = (e: MouseEvent) => {
      if (!this.panel) return;
      const rect = this.panel.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      this.panel.style.setProperty('--aia-mx', x + '%');
      this.panel.style.setProperty('--aia-my', y + '%');
    };
    this.panel.addEventListener('mousemove', this.onMouseMove);
    this.panel.addEventListener('mouseleave', () => {
      if (this.panel) {
        this.panel.style.setProperty('--aia-mx', '50%');
        this.panel.style.setProperty('--aia-my', '50%');
      }
    });

    // 9. 初始主题
    this.setTheme(this.opts.theme || 'ink');

    this.mounted = true;
  }

  destroy(): void {
    if (!this.mounted) return;
    if (this.panel && this.onMouseMove) {
      this.panel.removeEventListener('mousemove', this.onMouseMove);
    }
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
    this.welcomeEl = null;
    this.mounted = false;
    this.isOpen = false;
    this.onMouseMove = null;
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

  setTheme(theme: 'light' | 'dark' | 'paper' | 'ink'): void {
    if (!this.host) return;
    this.host.setAttribute('data-theme', theme);
  }

  clearMessages(): void {
    if (this.msgEl) this.msgEl.innerHTML = '';
  }

  /**
   * 设置欢迎区文字(显示在消息区上方,不是"消息")
   * 第一次发消息后会被 hideWelcome 淡出
   */
  setWelcome(text: string): void {
    if (!this.welcomeEl) return;
    if (!text) {
      this.welcomeEl.hidden = true;
      return;
    }
    this.welcomeEl.hidden = false;
    this.welcomeEl.textContent = text;
  }

  /** 隐藏欢迎区(用户发第一条消息后调) */
  hideWelcome(): void {
    if (!this.welcomeEl) return;
    if (this.welcomeEl.hidden) return;
    this.welcomeEl.classList.add('aiagent-sdk-welcome-leaving');
    setTimeout(() => {
      if (this.welcomeEl) {
        this.welcomeEl.hidden = true;
        this.welcomeEl.classList.remove('aiagent-sdk-welcome-leaving');
      }
    }, 280);
  }

  /** 发送按钮点击:5 颗油彩色粒子向四周飞 */
  private _burstSend(): void {
    if (!this.sendBtn) return;
    const N = 5;
    const colors = ['#5eead4', '#a78bfa', '#f0abfc', '#93c5fd', '#fcd34d'];
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i) / N + Math.random() * 0.5;
      const dist = 22 + Math.random() * 14;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const dot = document.createElement('span');
      dot.className = 'aiagent-sdk-send-burst';
      dot.style.setProperty('--bx', dx + 'px');
      dot.style.setProperty('--by', dy + 'px');
      const c = colors[i];
      dot.style.setProperty('--c', c);
      dot.style.background = c;
      this.sendBtn.appendChild(dot);
      setTimeout(() => dot.remove(), 750);
    }
  }
}
