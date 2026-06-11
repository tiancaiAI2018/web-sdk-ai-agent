/**
 * SSE 帧解析器 —— 1:1 平移原 SDK 的 _consumeSseStream(原文件 1211-1268)
 *
 * 设计选择:继续用最简的 indexOf('\n\n') 切帧。原因见 memory `sse-parse-pitfall.md`:
 *   - Spring WebFlux 把 data 里的 \n 转义成 \n(字符串),每帧必然是
 *     `event:X\ndata:单行\nid:(可选)\n\n` 形态,不会跨多 data 行
 *   - EventSource 自动重连/事件名解析对我们用不上(手动 fetch 控流)
 *   - 改用别的事件流方案会引入更多依赖和解析歧义
 *
 * data 字段可能因为 Spring 拆分多行,这里按 \n 拼起来再用 .replace(/\\n/g, '\n') 还原。
 */
import type { SSEEvent, ToolCallPayload } from './types';

export async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (ev: SSEEvent) => void,
  onDone: () => void,
  onError: (e: Error) => void,
  onToolCall?: (parsed: ToolCallPayload) => void
): Promise<void> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let doneCalled = false;
  function fireDone() {
    if (!doneCalled) {
      doneCalled = true;
      onDone();
    }
  }

  function flushFrames() {
    // 循环切帧,直到 buf 里没有完整的 \n\n
    while (true) {
      const idx = buf.indexOf('\n\n');
      if (idx < 0) return;
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      if (!frame) continue;
      // 解析单帧
      const ev: SSEEvent = {};
      const lines = frame.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const colon = line.indexOf(':');
        if (colon < 0) continue;
        const k = line.slice(0, colon).trim();
        let v = line.slice(colon + 1);
        if (v.length > 0 && v.charAt(0) === ' ') v = v.slice(1);
        // data 字段可能多行(Spring 拆过),用 \n 拼起来,再还原 \\n → \n
        if (k === 'data') {
          ev.data = (ev.data ? ev.data + '\n' : '') + v;
        } else {
          (ev as Record<string, string>)[k] = v;
        }
      }
      if (ev.data) ev.data = ev.data.replace(/\\n/g, '\n');

      if (ev.id === 'last') {
        fireDone();
        return;
      }
      if (ev.event === 'tool_call' && typeof onToolCall === 'function') {
        try {
          onToolCall(JSON.parse(ev.data || '{}'));
        } catch (e) {
          console.error('[AIAgent SDK] tool_call parse failed', e, ev.data);
        }
        continue;
      }
      if (ev.data !== undefined) onChunk(ev);
    }
  }

  try {
    while (true) {
      const step = await reader.read();
      if (step.done) break;
      buf += dec.decode(step.value, { stream: true });
      flushFrames();
    }
    // 流关闭
    flushFrames();
    fireDone();
  } catch (e) {
    onError(e as Error);
  }
}
