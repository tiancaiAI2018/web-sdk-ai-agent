/**
 * 字体加载 —— 副作用函数,UMD 入口调一次
 *
 * 加载 3 套字体(都是 Google Fonts,免费开源):
 *   - Inter          :主字体(UI、消息)
 *   - JetBrains Mono :等宽(工具调用、代码)
 *   - Fraunces       :衬线(目前未直接用,留作将来扩展)
 *
 * 策略:
 *   - 用 <link rel="preconnect"> + <link rel="stylesheet"> 动态加载
 *   - font-display: swap 保证不阻塞首屏
 *   - 失败 fallback 走 :host 内的 font-family 链
 *     (Inter -> system-ui / JetBrains Mono -> ui-monospace / Fraunces -> Georgia)
 *
 * SDK 体积影响:UMD/ESM 包 +0 KB(字体走外链)
 * 首屏影响:首次 LCP 可能多 100-200ms(Google Fonts 加载),可接受
 */

const FONT_HREFS = [
  'https://fonts.googleapis.com/css2?' +
    'family=Inter:wght@400;500;600&' +
    'family=JetBrains+Mono:wght@400;500;600&' +
    'family=Fraunces:opsz,wght@9..144,400;9..144,500&' +
    'display=swap',
];

/** 已加载标记(防止重复挂 link) */
let loaded = false;

/** 注入字体 link 到 document.head(幂等) */
export function loadFonts(): void {
  if (loaded) return;
  if (typeof document === 'undefined') return;
  try {
    // preconnect(必须在 link 之前,加速 TLS 握手)
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    for (const href of FONT_HREFS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    loaded = true;
  } catch (e) {
    // 隐私模式 / CSP 严格时 link 注入可能失败,fallback 走 system-ui
    console.warn('[AIAgent SDK] loadFonts failed, fallback to system fonts:', e);
  }
}
