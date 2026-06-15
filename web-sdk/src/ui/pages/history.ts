/**
 * 历史会话页 —— v1 占位(不实装)。
 *
 * <p>未来 v2 会接入后端的会话历史 API,列出该用户过往的 chat sessions。
 * 当前只渲染一个"即将推出"占位插画。
 */

export interface HistoryPageHandle {
  refresh(): void;
  destroy(): void;
}

export function mountHistoryPage(host: HTMLElement): HistoryPageHandle {
  host.innerHTML = [
    '<div class="aia-hist-page">',
    '  <div class="aia-hist-empty">',
    '    <div class="aia-hist-empty-icon">📜</div>',
    '    <div class="aia-hist-empty-title">历史会话</div>',
    '    <div class="aia-hist-empty-hint">即将推出 — 后续版本会列出该用户过往对话</div>',
    '  </div>',
    '</div>',
  ].join('');

  return {
    refresh() {
      /* no-op */
    },
    destroy() {
      host.innerHTML = '';
    },
  };
}
