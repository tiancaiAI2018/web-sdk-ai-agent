/**
 * 智能录单 —— 1:1 平移原 SDK 的
 * _toggleExtractMode (原文件 802-822) + startExtractSession (827-850) +
 * stopExtractSession (852-856)
 *
 * "录单模式" 流程:
 *   - 浮窗右上角 📋 按钮 toggle(agent.ts 在 _mount 时绑事件)
 *   - 开启时激活 submit_form 工具(让 LLM 看到 schema)
 *   - LLM 多轮收集字段,最终调 submit_form 工具
 *   - SDK 端的 onCall 回调把字段推回第三方页面(原 host-page.html demo)
 *
 * 也可以通过 startExtractSession(opts) 显式启动(由第三方在 page-level 触发)。
 */

import type { StartExtractOptions } from './types';

export interface ExtractCtx {
  clientPrefix: string;
  /** 拿 demo sessionId(demoTools=true 时 init 时设置) */
  getDemoSessionId: () => string | null;
  getChatSessionId: () => string | null;
  setChatSessionId: (sid: string | null) => void;
  getActiveTools: () => string[];
  setActiveTools: (tools: string[]) => void;
  getExtractOnCall: () => ((payload: Record<string, unknown>) => unknown) | null;
  setExtractOnCall: (
    fn: ((payload: Record<string, unknown>) => unknown) | null
  ) => void;
  /** 本地查 tool 定义(看 sid 下有没有 submit_form) */
  hasLocalTool: (sid: string, name: string) => boolean;
  /** 调后端 register */
  registerTools: (sid: string, tools: StartExtractOptions['tools']) => Promise<unknown>;
  /** 发引导消息 */
  sendUserMessage: (text: string) => void;
  appendMsg: (role: 'system', text: string) => void;
}

/** 浮窗 📋 按钮 toggle(原文件 802-822) */
export function toggleExtractMode(ctx: ExtractCtx): void {
  if (ctx.getActiveTools().indexOf('submit_form') >= 0) {
    ctx.setActiveTools([]);
    ctx.setExtractOnCall(null);
    ctx.appendMsg('system', '📋 录单模式已关闭(普通聊天)');
  } else {
    let sid = ctx.getChatSessionId();
    if (!sid) {
      // 还没 session,先发"开始录单"提示
      sid = ctx.getDemoSessionId() || ctx.clientPrefix + ':order-' + Date.now();
    }
    // 如果当前 chatSessionId 下没注册 submit_form 工具,用 demoSessionId(已在 init 时注册过)
    // 让 stream 在 demoSessionId 上发,模型能看到 submit_form
    if (!ctx.hasLocalTool(sid, 'submit_form')) {
      sid = ctx.getDemoSessionId()!;
    }
    ctx.setChatSessionId(sid);
    ctx.setActiveTools(['submit_form']);
    ctx.setExtractOnCall(null); // 用户没传 onFormSubmit → 工具调用只在 UI 上显示
    ctx.appendMsg(
      'system',
      '📋 录单模式已开启。请粘订单文本,模型会多轮收集字段。'
    );
  }
}

/**
 * 第三方显式启动录单(原文件 827-850)
 *   - opts.tools 必须有;没有时仅警告并 return
 *   - 找到第一个 tool 的 onCall 作为 _extractOnCall(SSE tool_call 时调)
 *   - 内部调 registerTools 走 backend,成功后才发引导消息
 */
export function startExtractSession(
  ctx: ExtractCtx,
  opts: StartExtractOptions
): void {
  const sessionId =
    opts.sessionId || ctx.clientPrefix + ':order-' + Date.now();
  const tools = opts.tools || [];
  const activeTools = opts.activeTools || (tools.length ? [tools[0].name] : []);
  if (!tools.length) {
    console.warn('[AIAgent SDK] startExtractSession: tools required');
    return;
  }

  // 兼容老 demo 字段 onFormSubmit
  if (opts.onFormSubmit && !tools[0].onCall) {
    tools[0].onCall = opts.onFormSubmit as never;
  }

  ctx
    .registerTools(sessionId, tools)
    .then(() => {
      ctx.setChatSessionId(sessionId);
      ctx.setActiveTools(activeTools);
      // 找到 onCall 回调(传给 _extractOnCall,SSE tool_call 时调)
      const first = tools[0];
      ctx.setExtractOnCall(
        first && typeof first.onCall === 'function' ? first.onCall : null
      );
      ctx.appendMsg(
        'system',
        '📋 智能录单已开启(' +
          sessionId +
          '),激活工具: ' +
          activeTools.join(',')
      );
      // 3) 发引导消息
      ctx.sendUserMessage(
        opts.initialMessage || '请开始按工具定义收集字段,或直接让我粘订单文本。'
      );
    })
    .catch((e) => {
      ctx.appendMsg('system', '⚠️ 工具注册失败:' + (e as Error).message);
    });
}

/** 关闭录单模式(原文件 852-856) */
export function stopExtractSession(ctx: ExtractCtx): void {
  ctx.setActiveTools([]);
  ctx.setExtractOnCall(null);
  ctx.appendMsg('system', '📋 录单模式已关闭');
}
