/**
 * 主题 / 设计令牌 —— Phase A 阶段仅做主题切换(class 切换 + setTheme 入口),
 * Phase C 阶段会在这里引入 CSS 变量 + 6 项动画 polish。
 *
 * 当前实现:由 Widget.setTheme('light' | 'dark') 切换 .aiagent-sdk-theme-dark
 * class(沿用原 SDK 行为)。
 */

import type { Widget } from './widget';

export type ThemeName = 'light' | 'dark';

export function applyTheme(widget: Widget, theme: ThemeName): void {
  widget.setTheme(theme);
}

export const DEFAULT_THEME: ThemeName = 'light';
