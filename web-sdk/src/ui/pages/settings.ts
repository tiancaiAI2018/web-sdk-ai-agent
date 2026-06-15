/**
 * 设置页 —— 把现有 header 上的换肤 / 工具面板 / 记忆开关 集中到一页。
 *
 * <p>职责:
 * <ul>
 *   <li>外观:主题(ink/paper)切换 + 皮肤(已注册的所有)切换
 *   <li>工具:内置工具开关(changeSkin / pageErrors / memory),状态反映在 chip 上
 *   <li>记忆:启用/禁用 + 自动注入开关 + 跳转记忆浏览页
 *   <li>关于:SDK 版本 + 记忆数 + 会话数
 * </ul>
 */

import type { MemoryEngine } from '../../core/memory';
import { SkinRegistry } from '../../core/skin';

export interface SettingsPageContext {
  /** 当前主题 */
  getTheme(): 'ink' | 'paper' | 'dark' | 'light';
  setTheme(t: 'ink' | 'paper' | 'dark' | 'light'): void;
  /** 当前皮肤名 */
  getCurrentSkin(): string;
  setSkin(name: string): void;
  /** 记忆系统引用(若启用) */
  memory: MemoryEngine | null;
  /** 记忆启用/禁用回调 */
  onToggleMemory?: (enabled: boolean) => void;
  /** 跳转到记忆页 */
  onGoToMemory?: () => void;
  /** SDK 版本号(可选) */
  sdkVersion?: string;
  /** 当前会话 ID(可选) */
  sessionId?: string | null;
}

export interface SettingsPageHandle {
  refresh(): void;
  destroy(): void;
}

export function mountSettingsPage(
  host: HTMLElement,
  ctx: SettingsPageContext
): SettingsPageHandle {
  let unsub: (() => void) | null = null;

  host.innerHTML = [
    '<div class="aia-set-page">',
    '  <section class="aia-set-section">',
    '    <h3 class="aia-set-h3">外观</h3>',
    '    <div class="aia-set-row">',
    '      <label>主题</label>',
    '      <div class="aia-set-theme-group" role="radiogroup"></div>',
    '    </div>',
    '    <div class="aia-set-row">',
    '      <label>皮肤</label>',
    '      <div class="aia-set-skin-group" role="radiogroup"></div>',
    '    </div>',
    '  </section>',
    '  <section class="aia-set-section">',
    '    <h3 class="aia-set-h3">记忆</h3>',
    '    <div class="aia-set-row aia-set-row-toggle" data-row="memory-enabled">',
    '      <label>启用记忆系统</label>',
    '      <button class="aia-set-switch" data-toggle="memory-enabled" aria-pressed="false"></button>',
    '    </div>',
    '    <div class="aia-set-row aia-set-row-link">',
    '      <label>浏览记忆</label>',
    '      <button class="aia-set-link" data-go="memory">浏览 →</button>',
    '    </div>',
    '  </section>',
    '  <section class="aia-set-section">',
    '    <h3 class="aia-set-h3">关于</h3>',
    '    <div class="aia-set-about"></div>',
    '  </section>',
    '</div>',
  ].join('');

  const themeGroup = host.querySelector('.aia-set-theme-group') as HTMLElement;
  const skinGroup = host.querySelector('.aia-set-skin-group') as HTMLElement;
  const aboutEl = host.querySelector('.aia-set-about') as HTMLElement;

  // ----------------------------------------------------------------
  // 主题(ink / paper,简化版)
  // ----------------------------------------------------------------
  function renderThemes(): void {
    const themes: Array<{ value: 'ink' | 'paper'; label: string }> = [
      { value: 'ink', label: '暗色 (ink)' },
      { value: 'paper', label: '亮色 (paper)' },
    ];
    const current = ctx.getTheme();
    const activeVal: 'ink' | 'paper' =
      current === 'paper' || current === 'light' ? 'paper' : 'ink';

    themeGroup.innerHTML = themes
      .map(
        (t) =>
          `<button class="aia-set-chip ${t.value === activeVal ? 'aia-set-chip-active' : ''}" data-theme="${t.value}">${t.label}</button>`
      )
      .join('');

    themeGroup.querySelectorAll('.aia-set-chip').forEach((el) => {
      el.addEventListener('click', () => {
        const v = (el as HTMLElement).dataset.theme as 'ink' | 'paper';
        ctx.setTheme(v);
        renderThemes();
      });
    });
  }

  // ----------------------------------------------------------------
  // 皮肤(列出所有已注册)
  // ----------------------------------------------------------------
  function renderSkins(): void {
    const all = SkinRegistry.instance().list();
    const current = ctx.getCurrentSkin();
    skinGroup.innerHTML = all
      .map(
        (name) =>
          `<button class="aia-set-chip ${name === current ? 'aia-set-chip-active' : ''}" data-skin="${name}">${name}</button>`
      )
      .join('');

    skinGroup.querySelectorAll('.aia-set-chip').forEach((el) => {
      el.addEventListener('click', () => {
        const name = (el as HTMLElement).dataset.skin!;
        ctx.setSkin(name);
        renderSkins();
      });
    });
  }

  // ----------------------------------------------------------------
  // 记忆开关
  // ----------------------------------------------------------------
  function renderMemoryToggle(): void {
    const btn = host.querySelector('[data-toggle="memory-enabled"]') as HTMLButtonElement;
    const enabled = ctx.memory?.isEnabled() ?? false;
    btn.setAttribute('aria-pressed', String(enabled));
    btn.classList.toggle('aia-set-switch-on', enabled);

    if (!ctx.memory) {
      btn.disabled = true;
      btn.title = '初始化时未启用记忆系统';
    }
  }

  host.querySelector('[data-toggle="memory-enabled"]')!.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (btn.disabled || !ctx.memory) return;
    const next = btn.getAttribute('aria-pressed') !== 'true';
    if (ctx.onToggleMemory) {
      ctx.onToggleMemory(next);
    } else if (next) {
      ctx.memory.enable();
    } else {
      ctx.memory.disable();
    }
    renderMemoryToggle();
  });

  host.querySelector('[data-go="memory"]')!.addEventListener('click', () => {
    if (ctx.onGoToMemory) ctx.onGoToMemory();
  });

  // ----------------------------------------------------------------
  // 关于
  // ----------------------------------------------------------------
  function renderAbout(): void {
    const memCount = ctx.memory?.size() ?? 0;
    aboutEl.innerHTML = [
      `<div class="aia-set-about-row"><span>SDK 版本</span><span>${ctx.sdkVersion || '5.x'}</span></div>`,
      `<div class="aia-set-about-row"><span>当前会话</span><span>${ctx.sessionId ? ctx.sessionId.slice(0, 8) + '…' : '—'}</span></div>`,
      `<div class="aia-set-about-row"><span>记忆条数</span><span>${memCount}</span></div>`,
    ].join('');
  }

  // ----------------------------------------------------------------
  // 订阅记忆变更 → 刷新 about 区
  // ----------------------------------------------------------------
  if (ctx.memory) {
    unsub = ctx.memory.onChange(() => renderAbout());
  }

  function refresh(): void {
    renderThemes();
    renderSkins();
    renderMemoryToggle();
    renderAbout();
  }
  refresh();

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
