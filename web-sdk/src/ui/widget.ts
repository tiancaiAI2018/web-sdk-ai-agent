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
import { Skin, SkinRegistry, skinForTheme } from '../core/skin';

export interface WidgetOpts {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  theme?: 'light' | 'dark' | 'paper' | 'ink';
  position?: 'bottom-right' | 'bottom-left';
  avatar?: string;
  demoTools?: boolean;
  /** 皮肤名(从 SkinRegistry 取,默认 'iridescent-bloom') */
  skin?: string;
}

export interface WidgetHandlers {
  onSend: () => void;
  onNew: () => void;
  onClose: () => void;
  onToggleExtract: () => void;
  onPanelOpen: () => void;
  /**
   * 用户在浮窗点了换肤按钮(>1 个皮肤时出现)。
   * agent 接到后:widget.applySkin(name) + 重放消息历史(因为 destroy 时 DOM 丢了)。
   * 不传 = widget 自己循环,不做消息重放(适合 demo)。
   */
  onCycleSkin?: (nextName: string) => void;
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
  /** 当前皮肤(可在 mount 后由 applySkin 切换) */
  private skin: Skin;
  /** 用户已输入但未发送的文本 —— applySkin 重 mount 时恢复 */
  private _pendingInput = '';

  constructor(
    private readonly opts: WidgetOpts,
    private readonly handlers: WidgetHandlers
  ) {
    // 按 skin 名取皮肤,没取到则用 skinForTheme(theme) 兜底
    const name = opts.skin || 'iridescent-bloom';
    this.skin = SkinRegistry.instance().get(name) || skinForTheme(opts.theme || 'ink');
  }

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
    // 皮肤相关属性挂到 host(因为 :host() CSS 选择器只匹配 host 元素,不匹配 panel)
    host.setAttribute('data-skin', this.skin.name);
    host.setAttribute('data-status-dot', this.skin.layout.statusDotStyle);
    host.setAttribute('data-send-icon', this.skin.layout.sendIcon);
    host.setAttribute('data-message-enter', this.skin.layout.messageEnter);
    host.setAttribute('data-bubble-anim', this.skin.layout.bubbleAnimation);
    document.body.appendChild(host);
    this.host = host;

    const shadow = host.attachShadow({ mode: 'open' });
    this.shadow = shadow;

    const styleEl = document.createElement('style');
    styleEl.textContent = this.skin.css || WIDGET_CSS;
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
    // 注:data-skin / data-layout-* 属性都挂在 host 上(见上面 mount 头部),
    //   因为 CSS 的 :host([data-skin="aurora"]) 选择器只匹配 host 元素。
    const demoToolsBtn = this.opts.demoTools
      ? '<button class="aiagent-sdk-iconbtn aiagent-sdk-extract" title="开/关 录单模式" aria-label="录单模式">⊕</button>'
      : '';
    // 4 角装饰:只有 skin.layout.cornerGlow=true 才生成 DOM
    const cornerHTML = this.skin.layout.cornerGlow
      ? [
          '<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>',
          '<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>',
          '<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>',
          '<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>',
        ].join('')
      : '';
    // 换肤按钮:只有注册表里 ≥2 个皮肤时才显示(避免单皮肤时点了反而迷惑)
    const allSkins = SkinRegistry.instance().list();
    const skinBtnHTML = allSkins.length >= 2
      ? `<button class="aiagent-sdk-iconbtn aiagent-sdk-cycle-skin" title="切换皮肤 (当前:${this.skin.name})" aria-label="切换皮肤">🎨</button>`
      : '';
    // 发送按钮内容:svg / arrow 字符 / circle 空
    const sendIconHTML = (() => {
      switch (this.skin.layout.sendIcon) {
        case 'svg': return SEND_ICON_SVG;
        case 'arrow': return '→';
        case 'circle': return '';
        default: return SEND_ICON_SVG;
      }
    })();
    panel.innerHTML = [
      cornerHTML,
      // 极简头部
      '<div class="aiagent-sdk-header">',
      '  <div class="aiagent-sdk-header-info">',
      '    <span class="aiagent-sdk-status-dot" aria-hidden="true"></span>',
      '    <span class="aiagent-sdk-title"></span>',
      '  </div>',
      '  <div class="aiagent-sdk-header-actions">',
      '    <span class="aiagent-sdk-subtitle"></span>',
      demoToolsBtn,
      skinBtnHTML,
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
      `  <button class="aiagent-sdk-send" aria-label="发送">${sendIconHTML}</button>`,
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
    const skinBtn = panel.querySelector('.aiagent-sdk-cycle-skin') as HTMLElement | null;

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
    if (skinBtn) {
      skinBtn.addEventListener('click', () => {
        const all = SkinRegistry.instance().list();
        if (all.length < 2) return;
        const cur = this.skin.name;
        const idx = all.indexOf(cur);
        const next = all[(idx + 1) % all.length];
        // 优先让 agent 接管:它能重放消息历史
        if (typeof this.handlers.onCycleSkin === 'function') {
          this.handlers.onCycleSkin(next);
          return;
        }
        // 兜底:agent 没传 handler,widget 自己切换(无消息重放)
        this.applySkin(next);
        if (this.panel) {
          this.panel.classList.add('aiagent-sdk-skin-just-changed');
          setTimeout(() => {
            if (this.panel) this.panel.classList.remove('aiagent-sdk-skin-just-changed');
          }, 400);
        }
        console.log('[AIAgent SDK 🎨 换肤]', cur, '→', next);
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

    // 10. 恢复 pendingInput(applySkin 走的路径:destroy → mount 会保留)
    if (this._pendingInput && this.taEl) {
      this.taEl.value = this._pendingInput;
      this._pendingInput = '';
    }

    this.mounted = true;
  }

  destroy(): void {
    if (!this.mounted) return;
    // 缓存当前 input(让 applySkin 重 mount 后能恢复)
    if (this.taEl) {
      this._pendingInput = this.taEl.value;
    }
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
    // isOpen 留着 —— applySkin 会用,决定新 mount 后是否要 open
    this.onMouseMove = null;
  }

  /**
   * 运行时切换皮肤(热切换,局部更新版本)。
   *
   * 之前的设计:destroy 整个 panel + mount 新的。导致:
   *   1. msgEl 子树全丢(用户消息/助手回复/思考卡/工具卡都没了)
   *   2. 卡片上的按钮(展开/收起/确认/取消)事件 handler 也没了
   *   3. 需要 agent 层做"快照 + 重放"机制,代码复杂且容易漏状态
   *
   * 现在的设计:只换样式,不动内容。
   *   - 替换 shadow root 里的 <style> 元素 textContent(新 CSS)
   *   - 重建 panel 顶部的 4 角装饰(根据新 skin.layout.cornerGlow 决定存在/缺失)
   *   - 更新 host/panel 上的 data-* 属性(CSS 选不同状态用)
   *   - msgEl 整个子树保留 → 所有 DOM 节点 + 事件 handler 都在
   *
   * 关键点:用 querySelector('style') 找到已注入的 style 元素,直接改 textContent
   *   比 removeChild+appendChild 更稳,引用不变。
   */
  applySkin(skinOrName: string | Skin): void {
    const newSkin =
      typeof skinOrName === 'string'
        ? SkinRegistry.instance().get(skinOrName)
        : skinOrName;
    if (!newSkin) {
      console.warn('[AIAgent SDK] applySkin: skin not found');
      return;
    }
    if (!this.mounted || !this.host || !this.shadow || !this.panel) {
      // 还没 mount —— 这次 applySkin 实际上会被 init 后的第一次 mount 覆盖
      this.skin = newSkin;
      return;
    }
    this.skin = newSkin;

    // 1) 替换 CSS(找到已注入的 <style> 元素,改 textContent,引用不变)
    const styleEl = this.shadow.querySelector('style');
    if (styleEl) styleEl.textContent = this.skin.css || WIDGET_CSS;

    // 2) 更新 host 上的 data-* 属性
    this.host.setAttribute('data-skin', this.skin.name);
    this.host.setAttribute('data-status-dot', this.skin.layout.statusDotStyle);
    this.host.setAttribute('data-send-icon', this.skin.layout.sendIcon);
    this.host.setAttribute('data-message-enter', this.skin.layout.messageEnter);
    this.host.setAttribute('data-bubble-anim', this.skin.layout.bubbleAnimation);

    // 3) 重建 4 角:有 → 无(老 4 角保留也无害,会按旧 CSS 不显示;但新 skin 不应有 → 删)
    //    无 → 有(插入 4 个 div)
    const existingCorners = this.panel.querySelectorAll('.aiagent-sdk-corner');
    if (!this.skin.layout.cornerGlow) {
      // 新 skin 不需要 4 角 → 全删
      existingCorners.forEach((c) => c.remove());
    } else if (existingCorners.length === 0) {
      // 新 skin 需要 4 角但旧 skin 没有 → 插入 4 个,放在 panel 最前面
      const cornerHTML = [
        '<div class="aiagent-sdk-corner aiagent-sdk-corner-tl" aria-hidden="true"></div>',
        '<div class="aiagent-sdk-corner aiagent-sdk-corner-tr" aria-hidden="true"></div>',
        '<div class="aiagent-sdk-corner aiagent-sdk-corner-bl" aria-hidden="true"></div>',
        '<div class="aiagent-sdk-corner aiagent-sdk-corner-br" aria-hidden="true"></div>',
      ].join('');
      // 用 DOM 解析而非 innerHTML 拼接(避免破坏现有子节点引用)
      const tmp = document.createElement('div');
      tmp.innerHTML = cornerHTML;
      while (tmp.firstChild) {
        this.panel.insertBefore(tmp.firstChild, this.panel.firstChild);
      }
    }
    // 4) 切换瞬间闪光 + 鼠标光斑重置
    this.panel.classList.add('aiagent-sdk-skin-just-changed');
    setTimeout(() => {
      if (this.panel) this.panel.classList.remove('aiagent-sdk-skin-just-changed');
    }, 400);
    this.panel.style.setProperty('--aia-mx', '50%');
    this.panel.style.setProperty('--aia-my', '50%');
  }

  /** 暴露当前皮肤(agent 调) */
  getSkin(): Skin {
    return this.skin;
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
