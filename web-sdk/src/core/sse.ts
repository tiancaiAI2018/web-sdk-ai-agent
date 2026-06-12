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
import type {
  SSEEvent,
  ToolCallPayload,
  ToolCallDeltaPayload,
  ToolCallStartPayload,
  ToolCallEndPayload,
} from './types';

export async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (ev: SSEEvent) => void,
  onDone: () => void,
  onError: (e: Error) => void,
  onToolCall?: (parsed: ToolCallPayload) => void,
  onToolCallDelta?: (parsed: ToolCallDeltaPayload) => void,
  onToolCallStart?: (parsed: ToolCallStartPayload) => void,
  onToolCallEnd?: (parsed: ToolCallEndPayload) => void,
  onThinking?: (text: string) => void
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

      // 关键:tool_call* 路由必须在 id:last 路由**之前**。
      // 用户实测:流末尾帧序列是
      //   1) 最后一个 tool_call_delta(无 id)
      //   2) id:last + event:thinking
      //   3) event:tool_call_end(无 id)
      //   4) id:last 空 data 哨兵
      //   5) id:last + event:tool_call(完整 args)
      // 第 5 帧**也带 id:last**,如果先检查 id:last,onCall 永远不被触发。
      // 解法:具体业务事件路由在前面;id:last 只作为兜底 fireDone 触发器。
      if (ev.event === 'tool_call_start' && typeof onToolCallStart === 'function') {
        try {
          const parsed = JSON.parse(ev.data || '{}');
          console.log('[AIAgent SDK 🚀 tool_call_start]', parsed);
          onToolCallStart(parsed);
        } catch (e) {
          console.error('[AIAgent SDK] tool_call_start parse failed', e, ev.data);
        }
        continue;
      }
      if (ev.event === 'tool_call' && typeof onToolCall === 'function') {
        try {
          const parsed = JSON.parse(ev.data || '{}');
          console.log('[AIAgent SDK 🔧 tool_call]', parsed);
          onToolCall(parsed);
        } catch (e) {
          console.error('[AIAgent SDK] tool_call parse failed', e, ev.data);
        }
        continue;
      }
      if (ev.event === 'tool_call_delta' && typeof onToolCallDelta === 'function') {
        try {
          const parsed = JSON.parse(ev.data || '{}');
          console.log('[AIAgent SDK 🔧 tool_call_delta]', parsed);
          onToolCallDelta(parsed);
        } catch (e) {
          console.error('[AIAgent SDK] tool_call_delta parse failed', e, ev.data);
        }
        continue;
      }
      if (ev.event === 'tool_call_end' && typeof onToolCallEnd === 'function') {
        try {
          const parsed = ev.data ? JSON.parse(ev.data) : {};
          console.log('[AIAgent SDK 🏁 tool_call_end]', parsed);
          onToolCallEnd(parsed);
        } catch (e) {
          // data 可能是空字符串,允许解析失败
          console.log('[AIAgent SDK 🏁 tool_call_end] (no data)');
          onToolCallEnd({});
        }
        continue;
      }
      if (ev.id === 'last') {
        // 兜底:任何带 id:last 的帧(thinking / 纯文字 / 空哨兵)都触发 fireDone。
        // 幂等保护由 doneCalled 标志位保证。
        // 用 continue 而非 return —— 切本帧后继续 while,buf 后续帧还要处理。
        fireDone();
        continue;
      }
      if (ev.event === 'thinking' && typeof onThinking === 'function') {
        onThinking(ev.data || '');
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
