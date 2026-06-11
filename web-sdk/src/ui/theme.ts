/**
 * 主题 / 设计令牌 —— IRIDESCENT BLOOM
 *
 * 主题名:
 *   - 'ink'   :OLED 黑底 + 虹彩油彩(默认,毛玻璃 + 油彩在深色下最出彩)
 *   - 'paper' :暖米底 + 油彩(适合亮色宿主页)
 *   - 'dark'  :'ink' 的别名(向后兼容,推荐用 'ink')
 *   - 'light' :'paper' 的别名(向后兼容,推荐用 'paper')
 *
 * 切换走 host.setAttribute('data-theme', theme) + CSS 变量覆盖。
 * 视觉细节(面板 28px 毛玻璃、4 角油彩、油彩终端卡、粒子思考)全部在 styles.ts。
 */

import type { Widget } from './widget';

export type ThemeName = 'ink' | 'paper' | 'dark' | 'light';

export function applyTheme(widget: Widget, theme: ThemeName): void {
  widget.setTheme(theme);
}

export const DEFAULT_THEME: ThemeName = 'ink';
