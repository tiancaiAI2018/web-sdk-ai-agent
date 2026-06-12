/**
 * 皮肤系统 — 可插拔视觉/布局方案
 *
 * 设计要点:
 *   - Skin = CSS + 6 个布局开关 + 调色板 hint
 *   - SkinRegistry:register(name, skin)/ get(name)/ list() / remove(name)
 *   - 内置 2 个:iridescent-bloom(原 v5)+ classic(极简白底)
 *   - 老的 theme:'ink'/'paper'/'dark'/'light' 走 skinForTheme() 映射,行为不变
 *
 * 为什么不引入"事件总线/状态机库":
 *   - CLAUDE.md "Simplicity First"
 *   - 皮肤切换只是个 Map<name, Skin> 替换,不需要响应式
 *   - 真要监听切换,SDK 内部 agent.setSkin() 已经回调通知 widget 了
 */

import { IRIDESCENT_BLOOM_CSS } from '../ui/skins/iridescent-bloom';
import { CLASSIC_CSS } from '../ui/skins/classic';

/** 布局开关 —— 6 个维度,Widget 按这些决定生成什么 DOM / 走什么 CSS。全部可选,有默认值 */
export interface SkinLayout {
  /** 4 角是否要油彩飞溅(iridescent=true,classic=false)。默认 true */
  cornerGlow?: boolean;
  /** 顶部 status dot 风格。默认 'rainbow' */
  statusDotStyle?: 'rainbow' | 'solid' | 'pulse';
  /** 发送按钮样式。默认 'svg' */
  sendIcon?: 'svg' | 'arrow' | 'circle';
  /** 消息入场动画。默认 'paint' */
  messageEnter?: 'paint' | 'fade' | 'none';
  /** 气泡呼吸动画。默认 'rotate' */
  bubbleAnimation?: 'rotate' | 'breathe' | 'none';
  /** 字体优先。默认 'mixed' */
  fontStack?: 'mixed' | 'serif' | 'mono' | 'system';
}

/** 默认布局(跟 IRIDESCENT BLOOM 一致),deriveSkin 和直接构造 Skin 时可展开覆盖 */
export const DEFAULT_LAYOUT: Required<SkinLayout> = {
  cornerGlow: true,
  statusDotStyle: 'rainbow',
  sendIcon: 'svg',
  messageEnter: 'paint',
  bubbleAnimation: 'rotate',
  fontStack: 'mixed',
};

/** 调色板 hint —— 主题切换时用(IRIDESCENT 用,classic 不需要) */
export type Palette = 'ink' | 'paper' | 'dark' | 'light';

/** 皮肤定义 */
export interface Skin {
  /** 唯一名字,用于 init({skin: name}) 和 setSkin(name) */
  name: string;
  /** 注入到 shadow root 的 CSS(必须含 :host[data-theme] 等所有变量) */
  css: string;
  /** 布局开关(可选字段,缺省值取 DEFAULT_LAYOUT) */
  layout?: SkinLayout;
  /** 调色板 hint(可选,classic 皮肤一般不指定) */
  palette?: Palette;
  /**
   * 简短描述(给 AI / 用户看的)。例如:
   *   '油彩/毛玻璃/虹彩动画,默认皮肤,适合深色系场景'
   * 不传则 changeSkinTool 工厂会用默认 'no description' 占位。
   */
  aiHint?: string;
}

/**
 * 将 SkinLayout 解析为完整布局(缺省字段填 DEFAULT_LAYOUT)。
 * Widget 内部统一调这个,保证 layout 字段一定完整。
 */
export function resolveLayout(layout?: SkinLayout): Required<SkinLayout> {
  return { ...DEFAULT_LAYOUT, ...layout };
}

/**
 * 从已有皮肤派生新皮肤 —— 最常用的自定义方式。
 *
 * 只需覆盖差异部分:CSS 追加覆盖段、layout 只改需要变的字段。
 * 典型用法(在 iridescent-bloom 上换色板):
 * ```ts
 * const mySkin = deriveSkin(IRIDESCENT_BLOOM, {
 *   name: 'my-ocean',
 *   css: IRIDESCENT_BLOOM.css + '\n' + oceanOverrideCSS,
 *   layout: { fontStack: 'serif' },  // 只改字体,其余继承
 *   aiHint: '海洋蓝绿主题',
 * });
 * agent.registerSkin(mySkin);
 * ```
 *
 * @param base    基础皮肤(通常是内置的 IRIDESCENT_BLOOM / CLASSIC / AURORA)
 * @param override 要覆盖的字段(css 会拼接,layout 会合并)
 */
export function deriveSkin(
  base: Skin,
  override: Partial<Omit<Skin, 'layout'>> & { layout?: SkinLayout }
): Skin {
  return {
    ...base,
    ...override,
    layout: resolveLayout({ ...base.layout, ...override.layout }),
  };
}

// ====================================================================
// 内置皮肤
// ====================================================================

/** IRIDESCENT BLOOM —— 原 v5 默认皮肤(油彩/毛玻璃/虹彩) */
export const IRIDESCENT_BLOOM: Skin = {
  name: 'iridescent-bloom',
  css: IRIDESCENT_BLOOM_CSS,
  palette: 'ink',
  aiHint: '深色油彩画布 + 4 角油彩飞溅 + 虹彩动画 + 毛玻璃。视觉强烈,默认皮肤。',
  layout: {
    cornerGlow: true,
    statusDotStyle: 'rainbow',
    sendIcon: 'svg',
    messageEnter: 'paint',
    bubbleAnimation: 'rotate',
    fontStack: 'mixed',
  },
};

/** CLASSIC —— 极简白底,系统字体,无装饰(证明皮肤系统能跳布局) */
export const CLASSIC: Skin = {
  name: 'classic',
  css: CLASSIC_CSS,
  aiHint: '浅灰白底 + 蓝色强调 + 系统字体 + 无装饰动画。商务/简洁风格,亮色环境。',
  layout: {
    cornerGlow: false,
    statusDotStyle: 'pulse',
    sendIcon: 'arrow',
    messageEnter: 'fade',
    bubbleAnimation: 'none',
    fontStack: 'system',
  },
};

/**
 * AURORA —— 极光绿青紫主题,用 deriveSkin 从 IRIDESCENT BLOOM 派生。
 * 只需覆盖 CSS 变量 + 改 fontStack,零新 CSS 结构。
 */
const AURORA_OVERRIDE = `
/* 极光主题 — 覆盖 :host 变量(只在挂 data-skin="aurora" 时生效) */
:host([data-skin="aurora"]),
:host([data-skin="aurora"]) [data-skin="aurora"] {
  --aia-canvas-1: #050a14;
  --aia-canvas-2: #0a1426;
  --aia-canvas-3: #0e1a32;
  --aia-bg:        #050a14;
  --aia-text:      #e6f1ff;
  --aia-text-muted:#8ba0bf;
  --aia-text-faint:#5a6a85;
  --aia-border:    rgba(120, 200, 255, 0.10);
  --aia-border-strong: rgba(120, 200, 255, 0.18);
  --aia-paint-1: #4ade80;  /* 极光绿 */
  --aia-paint-2: #22d3ee;  /* 青 */
  --aia-paint-3: #a78bfa;  /* 紫 */
  --aia-paint-4: #60a5fa;  /* 蓝 */
  --aia-paint-5: #2dd4bf;  /* 蓝绿 */
  --aia-glow:    #22d3ee;
  --aia-success: #4ade80;
  --aia-error:   #fb7185;
  --aia-font:    -apple-system, "Source Han Serif SC", "Songti SC", Georgia, serif;
  --aia-serif:   "Source Han Serif SC", "Songti SC", Georgia, serif;
}
`;

export const AURORA: Skin = deriveSkin(IRIDESCENT_BLOOM, {
  name: 'aurora',
  css: IRIDESCENT_BLOOM_CSS + '\n' + AURORA_OVERRIDE,
  layout: { fontStack: 'serif' },
  aiHint: '极光绿/青/紫 + 衬线字体 + 4 角油彩 + 深绿底。夜读/文艺风格。',
});

// ====================================================================
// 皮肤注册表
// ====================================================================

/**
 * 全局皮肤注册表 —— 简单 Map,get/has/list/register/remove。
 * 默认注册 3 个内置皮肤,用户可 register() 加自定义。
 *
 * register 时自动 resolveLayout,确保 layout 字段完整。
 */
export class SkinRegistry {
  private static _instance: SkinRegistry | null = null;
  private readonly _skins = new Map<string, Skin>();

  private constructor() {
    this._skins.set(IRIDESCENT_BLOOM.name, IRIDESCENT_BLOOM);
    this._skins.set(CLASSIC.name, CLASSIC);
    this._skins.set(AURORA.name, AURORA);
  }

  static instance(): SkinRegistry {
    if (!SkinRegistry._instance) {
      SkinRegistry._instance = new SkinRegistry();
    }
    return SkinRegistry._instance;
  }

  /** 注册皮肤(layout 缺省字段自动补 DEFAULT_LAYOUT) */
  register(skin: Skin): void {
    if (!skin || !skin.name || !skin.css) {
      throw new Error('[AIAgent SDK] SkinRegistry.register: invalid skin');
    }
    // 确保 layout 完整,用户构造 Skin 时可以只写差异字段
    this._skins.set(skin.name, {
      ...skin,
      layout: resolveLayout(skin.layout),
    });
  }

  /** 取皮肤。找不到时返回 IRIDESCENT_BLOOM(兜底) */
  get(name: string): Skin {
    return this._skins.get(name) || IRIDESCENT_BLOOM;
  }

  has(name: string): boolean {
    return this._skins.has(name);
  }

  /** 列出所有已注册皮肤名 */
  list(): string[] {
    return Array.from(this._skins.keys());
  }

  /** 列出所有已注册皮肤的详细信息(含 aiHint) */
  listWithInfo(): Array<{ name: string; aiHint: string }> {
    return Array.from(this._skins.values()).map((s) => ({
      name: s.name,
      aiHint: s.aiHint || 'no description',
    }));
  }

  /** 不允许删内置皮肤 */
  remove(name: string): boolean {
    if (name === IRIDESCENT_BLOOM.name || name === CLASSIC.name) {
      console.warn('[AIAgent SDK] cannot remove built-in skin:', name);
      return false;
    }
    return this._skins.delete(name);
  }
}

// ====================================================================
// 老 API 兼容
// ====================================================================

/** 主题 → 默认皮肤映射(老 setTheme({theme}) 用户走这里) */
export function skinForTheme(theme: Palette): Skin {
  // 老的 4 主题都用 iridescent-bloom,只是 palette 不一样
  // (palette 字段由 widget.setTheme 处理 CSS 变量,皮肤名仍是 iridescent-bloom)
  return IRIDESCENT_BLOOM;
}

/** 主题名 → data-theme 属性值(老 setTheme 内部用) */
export function paletteAttr(theme: Palette): Palette {
  // 'dark' → 'ink', 'light' → 'paper' (老 API 别名)
  if (theme === 'dark') return 'ink';
  if (theme === 'light') return 'paper';
  return theme;
}
