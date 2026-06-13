/**
 * Markdown 渲染 —— marked + DOMPurify 静态内联版
 *
 * v4 改动:不再走 CDN + 本地 vendor 加载链。marked / DOMPurify 由 Vite 在构建时
 * 打进 bundle,运行时零网络请求、零外部依赖。优势:
 *   - 国内网络环境直接可用,不再受 jsdelivr 抽风影响
 *   - 部署只需 1 个 JS 文件,不再需要 vendor/ 目录
 *   - React/ESM 项目零运行时依赖(无 window.marked 假设)
 *   - 首屏 markdown 渲染无延迟(不再等 lazy 加载)
 *
 * 保留:renderMarkdownFallback —— 极小概率 marked.parse 抛错(版本不兼容?)时兜底
 *       渲染换行 + bold + code。
 *
 * decorateImages:对消息 div 里的 <img> 加懒加载 + 模糊过渡(行为不变)。
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 配置 marked(只跑一次):breaks 让单个 \n 变 <br/>,契合 LLM 流式输出
let _mdConfigured = false;
function configureMarked(): void {
  if (_mdConfigured) return;
  _mdConfigured = true;
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
}

function escapeHtml(s: unknown): string {
  return String(s).replace(/[&<>"']/g, (c) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!;
  });
}

/** marked + DOMPurify 走的安全处理 */
function sanitizeAndDecorate(html: string): string {
  let clean = DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
  });
  // 给所有 <a> 强制加 target=_blank rel=noopener(防 tabnabbing)
  clean = clean.replace(/<a\s+([^>]*?)>/gi, (_m, attrs: string) => {
    if (!/\btarget\s*=/i.test(attrs)) attrs += ' target="_blank"';
    if (!/\brel\s*=/i.test(attrs)) attrs += ' rel="noopener noreferrer"';
    return '<a ' + attrs + '>';
  });
  return clean;
}

/** ensureMarkdown —— 兼容老 API,内联版永远 true */
export function ensureMarkdown(): Promise<boolean> {
  configureMarked();
  return Promise.resolve(true);
}

export function renderMarkdownLite(text: string): string {
  if (!text) return '';
  try {
    configureMarked();
    // async:false 强制走同步分支(marked v9+ 默认 Promise 联合)
    const raw = marked.parse(text, { async: false }) as string;
    return sanitizeAndDecorate(raw);
  } catch (e) {
    console.warn('[AIAgent SDK] marked parse failed, fallback:', e);
    return renderMarkdownFallback(text);
  }
}

/** 极简 fallback:换行 + bold + code(仅在 marked 抛错时用) */
export function renderMarkdownFallback(text: string): string {
  let t = escapeHtml(text);
  t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\n/g, '<br/>');
  return t;
}

/**
 * 把消息 div 里的 <img> 元素挂上"懒加载 + 模糊过渡"行为。
 * - loading="lazy"(浏览器原生懒加载)
 * - 初始 class aiagent-sdk-img-loading,onload/onerror 后切到 aiagent-sdk-img-loaded
 */
export function decorateImages(container: HTMLElement | null): void {
  if (!container) return;
  const imgs = container.querySelectorAll('img');
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i] as HTMLImageElement;
    if (img.dataset.aiagentDecorated === '1') continue;
    img.dataset.aiagentDecorated = '1';
    img.setAttribute('loading', 'lazy');
    img.classList.add('aiagent-sdk-img-loading');
    const done = () => {
      img.classList.remove('aiagent-sdk-img-loading');
      img.classList.add('aiagent-sdk-img-loaded');
    };
    if (img.complete && img.naturalWidth > 0) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  }
}
