/**
 * 浮窗 CSS — 皮肤系统入口
 *
 * v5 之前:这文件是单字符串 WIDGET_CSS 1547 行(IRIDESCENT BLOOM 主题)。
 * v5 之后:皮肤系统引入,CSS 拆到 ui/skins/ 下。本文件只做:
 *   1. re-export IRIDESCENT 皮肤的 CSS(老代码 `import { WIDGET_CSS }` 仍工作)
 *   2. 提供 default 皮肤名常量
 *
 * 新皮肤开发流程:在 ui/skins/<name>.ts 里写 `export const <NAME>_CSS = \`...\``,
 * 然后在 core/skin.ts 注册,用户就能用 `init({ skin: '<name>' })` 切换。
 */
export { IRIDESCENT_BLOOM_CSS as WIDGET_CSS } from './skins/iridescent-bloom';

/** 默认皮肤名(老 theme:'ink' 用户的等价路径) */
export const DEFAULT_SKIN_NAME = 'iridescent-bloom';

/** 内置皮肤名常量(给用户/文档用) */
export const SKIN_NAME = {
  IRIDESCENT_BLOOM: 'iridescent-bloom',
  CLASSIC: 'classic',
} as const;
