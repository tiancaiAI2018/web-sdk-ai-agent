/**
 * 工具注册 + TOOL_SUSPENDED 恢复 —— 1:1 平移原 SDK 的
 * _internalRegister / registerTools / unregisterTools / listTools / _getLocalTool
 * (原文件 705-797) + _postToolResult / _postAbort / _retryToolResult /
 * _cancelToolResult / _onToolResultFailed / _renderToolResultFailedCard /
 * _resumePendingToolResults(原文件 928-1202)
 *
 * 设计:
 *   - `ToolsRegistry` 管本地工具池(纯数据 + register / unregister / get)
 *   - `registerRemote` / `unregisterRemote` / `listRemote` / `postAbort` 是纯 HTTP 函数
 *   - `postToolResult` / `retryToolResult` / `cancelToolResult` /
 *     `renderToolResultFailedCard` / `resumePendingToolResults` 接 `ToolCtx`,
 *     不直接绑 `this`,避免循环依赖
 */

import { consumeSseStream } from './sse';
import { SkinRegistry } from './skin';
import { AIAgent } from './agent';
import {
  markToolCardSuccess,
  markToolCardError,
  updateToolCardProgress,
} from '../ui/components/tool-card';
import type {
  LocalTool,
  PendingToolCall,
  ToolDef,
  ToolCallPayload,
  ToolCallStartPayload,
  ToolCallDeltaPayload,
  MessageRole,
} from './types';

// ====================================================================
// 本地工具池
// ====================================================================

export class ToolsRegistry {
  /** sessionId → name → tool 定义 */
  private _tools = new Map<string, Map<string, LocalTool>>();

  /** 把 tool 定义存到 _tools,返 schema-only 数组(去掉 onCall,后端不需要)。 */
  register(
    sessionId: string,
    toolDefs: ToolDef[]
  ): Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    strict: boolean;
  }> {
    const inner = this._tools.get(sessionId) || new Map<string, LocalTool>();
    const schemaOnly: Array<{
      name: string;
      description: string;
      parameters: Record<string, unknown>;
      strict: boolean;
    }> = [];
    for (const t of toolDefs) {
      const local: LocalTool = {
        description: t.description || '',
        parameters: t.parameters || { type: 'object', properties: {} },
        strict: t.strict !== false,
        onCall: typeof t.onCall === 'function' ? t.onCall : null,
      };
      inner.set(t.name, local);
      schemaOnly.push({
        name: t.name,
        description: local.description,
        parameters: local.parameters,
        strict: local.strict,
      });
    }
    this._tools.set(sessionId, inner);
    return schemaOnly;
  }

  /** 注销本地。names 为空/undefined = 全清。 */
  unregister(sessionId: string, names?: string[] | null): void {
    const inner = this._tools.get(sessionId);
    if (!inner) return;
    if (!names || !names.length) {
      inner.clear();
      this._tools.delete(sessionId);
      return;
    }
    for (const n of names) inner.delete(n);
    if (inner.size === 0) this._tools.delete(sessionId);
  }

  /** 本地查 tool 定义(SSE tool_call 时找 onCall 回调) */
  get(sessionId: string, name: string): LocalTool | null {
    const inner = this._tools.get(sessionId);
    return inner ? inner.get(name) || null : null;
  }
}

// ====================================================================
// 后端 HTTP(纯函数,接 token 由调用方注入)
// ====================================================================

export async function registerRemote(
  endpoint: string,
  token: string,
  sessionId: string,
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    strict: boolean;
  }>
): Promise<unknown> {
  const r = await fetch(
    endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/register',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tools }),
    }
  );
  if (!r.ok) {
    const txt = await r.text();
    throw new Error('register failed: ' + r.status + ' ' + txt);
  }
  return await r.json();
}

/** 追加工具到后端(不清空已有),用于临时工具场景 */
export async function appendRemote(
  endpoint: string,
  token: string,
  sessionId: string,
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    strict: boolean;
  }>
): Promise<unknown> {
  const r = await fetch(
    endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/append',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tools }),
    }
  );
  if (!r.ok) {
    const txt = await r.text();
    throw new Error('append failed: ' + r.status + ' ' + txt);
  }
  return await r.json();
}

export async function unregisterRemote(
  endpoint: string,
  token: string,
  sessionId: string,
  names: string[] | null
): Promise<unknown> {
  const r = await fetch(
    endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/unregister',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names }),
    }
  );
  if (!r.ok) throw new Error('unregister failed: ' + r.status);
  return await r.json();
}

export async function listRemote(
  endpoint: string,
  token: string,
  sessionId: string
): Promise<unknown> {
  const r = await fetch(
    endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools',
    {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
    }
  );
  if (!r.ok) throw new Error('list failed: ' + r.status);
  return await r.json();
}

/** 释放后端挂起的 agent。幂等,失败静默 —— best-effort。 */
export async function postAbort(
  endpoint: string,
  token: string,
  sessionId: string
): Promise<void> {
  if (!sessionId) return;
  try {
    await fetch(
      endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/abort',
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
      }
    );
  } catch (e) {
    console.warn('[AIAgent SDK] abort failed:', (e as Error).message);
  }
  try {
    sessionStorage.removeItem('pending:' + sessionId);
  } catch {
    /* 隐私模式可能抛 */
  }
}

// ====================================================================
// 预制工具 schema —— 让用户从 html 一行注册,不用每次手写 description/parameters
// ====================================================================

/**
 * change_skin 工具的 schema 工厂。用户在 html 注册时:
 *
 *   agent.registerTools({
 *     sessionId: 'demo',
 *     tools: [
 *       submitFormTool,           // 自己写 schema
 *       changeSkinTool(agent),    // 用 SDK 预制,只传 agent
 *     ],
 *   });
 *
 * 工厂返回的 ToolDef 自带 onCall(闭包持 agent),在 tool_call 时调 agent.setSkin()。
 * 跟 submitFormTool 走的同一条路径:_internalRegister 把 schema 发给后端,onCall 留前端。
 *
 * description 动态生成:每次调用工厂时扫一次 SkinRegistry,把所有已注册皮肤的
 *   name + aiHint 拼成 markdown 列表。LLM 看到的是"具体有哪些皮肤,每个什么风格",
 *   而不是模糊的"由 SDK 注册表决定"。
 */
export function changeSkinTool(agent: {
  setSkin: (name: string) => void;
  registerSkin?: (skin: unknown) => void;
}): ToolDef {
  // 动态拼接:列出当前所有皮肤 + 各自描述,加上 4 种 name 值的语义
  const all = SkinRegistry.instance().list();
  const allDescribed = all
    .map((name) => {
      const skin = SkinRegistry.instance().get(name);
      const hint = skin && skin.aiHint ? skin.aiHint : '(no description)';
      return `  - \`${name}\`: ${hint}`;
    })
    .join('\n');
  return {
    name: 'change_skin',
    description:
      `切换 AI 助手浮窗的皮肤。\`name\` 字段可传:\n` +
      `  - 具体皮肤名(见下方列表)\n` +
      `  - \`"next"\` 切到下一个(在已注册皮肤列表中循环)\n` +
      `  - \`"prev"\` 切到上一个\n` +
      `  - \`"random"\` 随机切一个\n` +
      `\n当前已注册皮肤:\n${allDescribed}\n` +
      `传不在列表里的名字会返回 unknown_skin 错误(不会乱切)。`,
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            '皮肤名(见 description 列表),或 "next" / "prev" / "random" 之一。',
        },
      },
      required: ['name'],
    },
    strict: false,
    onCall: (args) => {
      const requested = (args && (args as { name?: string }).name) || 'next';
      const all = SkinRegistry.instance().list();
      let target: string;
      // 取当前皮肤(从 agent._widget,这里只能由调用方传入,作为工厂的最小依赖)
      const current = (agent as { _widget?: { getSkin?: () => { name: string } } })._widget?.getSkin?.()?.name || '';
      if (requested === 'random') {
        target = all[Math.floor(Math.random() * all.length)] || current;
      } else if (requested === 'next' || requested === 'prev') {
        const idx = all.indexOf(current);
        const step = requested === 'next' ? 1 : -1;
        target = all[((idx + step) % all.length + all.length) % all.length] || current;
      } else if (all.indexOf(requested) >= 0) {
        target = requested;
      } else {
        return {
          ok: false,
          error: 'unknown_skin',
          requested,
          available: all,
          currentSkin: current,
        };
      }
      try {
        agent.setSkin(target);
        return {
          ok: true,
          currentSkin: target,
          previousSkin: current,
          available: all,
          message: '已切换皮肤:' + current + ' → ' + target,
        };
      } catch (e) {
        return { ok: false, error: (e as Error).message, currentSkin: current };
      }
    },
  };
}

// ====================================================================
// TOOL_SUSPENDED 恢复流
// ====================================================================

/** TOOL_SUSPENDED 恢复的依赖集合(由 agent 在 init 时构造) */
export interface ToolCtx {
  endpoint: string;
  /** 拉 token(agent 内部走 TokenCache) */
  ensureToken: () => Promise<string>;
  /** 取当前 sessionId(可能为空) */
  getSessionId: () => string | null;
  /** pending 状态读写 */
  getPending: () => PendingToolCall | null;
  setPending: (p: PendingToolCall | null) => void;

  // ===== UI hooks(由 agent 注入)=====
  appendMsg: (
    role: MessageRole,
    text: string,
    data?: { tool: string; args: Record<string, unknown> }
  ) => void;
  setBusy: (busy: boolean) => void;
  sleep: (ms: number) => Promise<void>;
  appendTyping: () => HTMLElement;
  getMsgEl: () => HTMLElement;

  // ===== SSE 事件处理(由 agent 注入,tools/result 流跟 stream 流共用) =====
  /** 处理 thinking 事件 */
  handleThinking?: (text: string) => void;
  /** 处理 tool_call_start 事件 */
  handleToolCallStart?: (parsed: ToolCallStartPayload) => void;
  /** 处理 tool_call_delta 事件 */
  handleToolCallDelta?: (parsed: ToolCallDeltaPayload) => void;
  /** 处理 tool_call 事件(完整帧),返回 true 表示已提交 */
  handleToolCall?: (parsed: ToolCallPayload) => Promise<boolean>;
}

/**
 * 把工具执行结果 POST 到 /chat/{sid}/tools/result,
 * 后端用官方模式 agent.call(toolResultMsg) 恢复 TOOL_SUSPENDED 状态,
 * 把 LLM 的确认回复以 SSE 流式推回。SDK 端按新消息渲染。
 *
 * `card` 可选:本轮工具调用的油彩终端卡根元素,2xx 时标记完成。
 *
 * 可靠性:
 *   - 先持久化 pending 到 sessionStorage,刷新页面后能续传
 *   - 5xx / 429 / 网络错误 指数退避(500/1000/2000ms,共 4 次)
 *   - 409 状态机错配:主动 abort 清后端 + 清本地,不重试
 *   - 4xx 其他 + SSE 消费失败:不再重试,挂"重试/取消"按钮给用户
 */
export async function postToolResult(
  ctx: ToolCtx,
  toolUseId: string,
  result: unknown,
  card?: HTMLElement | null
): Promise<void> {
  if (!toolUseId) return;
  const sessionId = ctx.getSessionId();
  if (!sessionId) {
    console.warn('[AIAgent SDK] no sessionId for tool result');
    return;
  }

  // 先把 pending 存 sessionStorage,刷新页面后 resumePendingToolResults() 能续传
  const pending: PendingToolCall = { toolUseId, result, ts: Date.now() };
  ctx.setPending(pending);
  try {
    sessionStorage.setItem('pending:' + sessionId, JSON.stringify(pending));
  } catch {
    /* 隐私模式可能抛,吞掉 */
  }

  let token: string;
  try {
    token = await ctx.ensureToken();
  } catch (e) {
    ctx.appendMsg('system', '⚠️ ' + (e as Error).message);
    ctx.setBusy(false);
    return;
  }

  await _postToolResultInner(ctx, toolUseId, result, sessionId, token, card);
}

async function _postToolResultInner(
  ctx: ToolCtx,
  toolUseId: string,
  result: unknown,
  sessionId: string,
  token: string,
  card?: HTMLElement | null
): Promise<void> {
  const url =
    ctx.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/tools/result';
  const body = JSON.stringify({
    toolUseId,
    // onCall 没返回值时(JSON.stringify 会整个删掉 undefined 字段,
    // 后端就报 "toolUseId and result required")给个占位
    result:
      result == null
        ? '[Tool executed by client SDK; no result returned]'
        : typeof result === 'string'
        ? result
        : JSON.stringify(result),
  });
  const headers = {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };

  const maxAttempts = 4; // 1 初始 + 3 重试
  let backoff = 500;
  let attempt = 0;
  let r: Response | null = null;
  let fetchErr: Error | null = null;

  while (attempt < maxAttempts) {
    fetchErr = null;
    try {
      r = await fetch(url, { method: 'POST', headers, body });
    } catch (e) {
      fetchErr = e as Error;
    }

    if (fetchErr) {
      if (attempt === maxAttempts - 1) break;
      await ctx.sleep(backoff);
      backoff *= 2;
      attempt++;
      if (card) updateToolCardProgress(card, Math.min(60 + attempt * 10, 90), '重试中…');
      continue;
    }

    // 5xx 重试
    if (
      r &&
      r.status >= 500 &&
      r.status < 600 &&
      attempt < maxAttempts - 1
    ) {
      await ctx.sleep(backoff);
      backoff *= 2;
      attempt++;
      if (card) updateToolCardProgress(card, Math.min(60 + attempt * 10, 90), '重试中…');
      continue;
    }
    // 429:尊重 Retry-After
    if (r && r.status === 429 && attempt < maxAttempts - 1) {
      const ra = parseInt(r.headers.get('Retry-After') || '1', 10);
      await ctx.sleep(Math.max(ra * 1000, backoff));
      backoff *= 2;
      attempt++;
      if (card) updateToolCardProgress(card, Math.min(60 + attempt * 10, 90), '限流中…');
      continue;
    }
    // 其它状态码(2xx / 4xx 非 429)直接跳出循环,不再重试
    break;
  }

  // 所有重试用尽仍网络层失败
  if (fetchErr) {
    if (card) markToolCardError(card, '✕ 网络失败');
    onToolResultFailed(ctx, sessionId, toolUseId, 'network: ' + fetchErr.message);
    return;
  }
  if (!r) {
    if (card) markToolCardError(card, '✕ 无响应');
    onToolResultFailed(ctx, sessionId, toolUseId, 'network: no response');
    return;
  }

  // 409:后端状态机已乱(挂起池已 evict / sid 错 / ttl 过期),
  // 主动 abort 清后端 + 清本地 storage,不让用户卡住
  if (r.status === 409) {
    if (card) markToolCardError(card, '✕ 409 冲突');
    const errText = await r.text();
    ctx.appendMsg('system', '⚠️ ' + (errText || 'session 已被工具调用占用'));
    // 主动 abort(复用当前 token)
    try {
      await postAbort(ctx.endpoint, token, sessionId);
    } catch {
      /* best-effort */
    }
    ctx.setPending(null);
    ctx.setBusy(false);
    return;
  }
  // 4xx 其他 / 重试后仍 5xx —— 不可重试错误,挂按钮
  if (!r.ok || !r.body) {
    if (card) markToolCardError(card, '✕ HTTP ' + r.status);
    onToolResultFailed(ctx, sessionId, toolUseId, 'http ' + r.status);
    return;
  }

  // 2xx:工具结果已接收,标记油彩终端卡为"完成"(后续 SSE 是 LLM 确认)
  if (card) markToolCardSuccess(card, '✓ 已提交');

  // 2xx:消耗 SSE,渲染 LLM 回复 —— 跟 _sendUserMessage 走完全同源的处理逻辑
  // tools/result 的 SSE 跟 /stream 完全一样:可能有 thinking、tool_call、tool_call_delta 等
  const typing = ctx.appendTyping();
  const msgEl = ctx.getMsgEl();
  let submitted = false;
  const lifecycle = AIAgent.buildStreamHandlers({
    typing,
    msgEl,
    onUpgrade: () => {
      // tools/result 流也可能有 thinking 卡片,需要收起
      if (ctx.handleThinking) {
        // finalizeThinking 由 _handleThinking 内部的 _thinkingCard 管理
      }
    },
    onErrorFallback: (msg) => ctx.appendMsg('system', msg),
    onDoneCleanup: () => {
      // 若本轮有 tool_call,_postToolResult 会接管 busy(在它的 onDone 里关)
      if (!submitted) ctx.setBusy(false);
    },
  });
  let consumed = true;
  try {
    await consumeSseStream(
      r.body,
      lifecycle.onChunk,
      lifecycle.onDone,
      lifecycle.onError,
      // onToolCall:跟 _sendUserMessage 完全同源 —— 查本地工具、执行 onCall、POST /tools/result
      async (parsed: ToolCallPayload) => {
        if (ctx.handleToolCall) {
          ctx.setBusy(true);
          const didSubmit = await ctx.handleToolCall(parsed);
          if (didSubmit) submitted = true;
        }
      },
      // onToolCallDelta
      (parsed: ToolCallDeltaPayload) => {
        if (ctx.handleToolCallDelta) ctx.handleToolCallDelta(parsed);
      },
      // onToolCallStart
      (parsed: ToolCallStartPayload) => {
        if (ctx.handleToolCallStart) ctx.handleToolCallStart(parsed);
      },
      // onToolCallEnd
      undefined,
      // onThinking
      (text: string) => {
        if (ctx.handleThinking) ctx.handleThinking(text);
      }
    );
  } catch (e) {
    consumed = false;
  }
  if (consumed) {
    // 成功:清 storage,清 pending
    try {
      sessionStorage.removeItem('pending:' + sessionId);
    } catch {
      /* */
    }
    ctx.setPending(null);
  } else {
    onToolResultFailed(ctx, sessionId, toolUseId, 'sse');
  }
}

/** 失败后用户点"重试"按钮 —— 用 _pendingToolCall 缓存的 result 再发一次。 */
export async function retryToolResult(ctx: ToolCtx): Promise<void> {
  const p = ctx.getPending();
  if (!p) return;
  const sid = ctx.getSessionId();
  if (!sid) return;
  ctx.setBusy(true);
  let token: string;
  try {
    token = await ctx.ensureToken();
  } catch (e) {
    ctx.appendMsg('system', '⚠️ ' + (e as Error).message);
    ctx.setBusy(false);
    return;
  }
  // 重试时无对应 card(ref 未持有);不更新进度,沿用 retry 卡片
  await _postToolResultInner(ctx, p.toolUseId, p.result, sid, token);
}

/** 失败后用户点"取消"按钮 —— 主动调 /tools/abort 释放后端 agent。 */
export async function cancelToolResult(ctx: ToolCtx): Promise<void> {
  const sid = ctx.getSessionId();
  if (!sid) {
    ctx.setBusy(false);
    return;
  }
  let token = '';
  try {
    token = await ctx.ensureToken();
  } catch {
    /* best-effort,无 token 也尝试 abort */
  }
  await postAbort(ctx.endpoint, token, sid);
  ctx.appendMsg('system', '已放弃本次工具调用,可继续对话。');
  ctx.setBusy(false);
}

/** /tools/result 不可重试失败时调用:展示"重试/取消"按钮给用户。 */
function onToolResultFailed(
  ctx: ToolCtx,
  sessionId: string,
  toolUseId: string,
  reason: string
): void {
  console.warn('[AIAgent SDK] tool result failed:', reason);
  renderToolResultFailedCard(ctx, reason);
  ctx.setBusy(false);
}

/** 渲染"工具结果提交失败"卡片:错误描述 + 重试/取消按钮。 */
export function renderToolResultFailedCard(
  ctx: ToolCtx,
  reason: string
): void {
  const msgEl = ctx.getMsgEl();
  // 防御:已存在错误卡片就不再插
  if (msgEl.querySelector('.aiagent-sdk-tool-result-failed')) return;

  const card = document.createElement('div');
  card.className = 'aiagent-sdk-tool-result-failed';

  const header = document.createElement('div');
  header.className = 'aiagent-sdk-tool-result-failed-header';
  header.textContent = '提交工具结果失败';

  const detail = document.createElement('div');
  detail.className = 'aiagent-sdk-tool-result-failed-detail';
  detail.textContent =
    '原因:' + (reason || '未知') + '。可重试,或取消本次调用以继续对话。';

  const bar = document.createElement('div');
  bar.className = 'aiagent-sdk-tool-result-actions';

  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'aiagent-sdk-btn-retry';
  retryBtn.textContent = '↻ 重试';
  retryBtn.addEventListener('click', () => {
    if (card.parentNode) card.parentNode.removeChild(card);
    void retryToolResult(ctx);
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'aiagent-sdk-btn-cancel';
  cancelBtn.textContent = '✕ 取消';
  cancelBtn.addEventListener('click', () => {
    if (card.parentNode) card.parentNode.removeChild(card);
    void cancelToolResult(ctx);
  });

  bar.appendChild(retryBtn);
  bar.appendChild(cancelBtn);
  card.appendChild(header);
  card.appendChild(detail);
  card.appendChild(bar);
  msgEl.appendChild(card);
  msgEl.scrollTop = msgEl.scrollHeight;
}

/**
 * SDK 启动时调:扫 sessionStorage,续传上次未提交的 tool result。
 * 后端用 409 回应就视为 TTL 过期,主动 abort 清掉,不让用户感知残留。
 */
export async function resumePendingToolResults(
  ctx: ToolCtx
): Promise<void> {
  if (typeof sessionStorage === 'undefined') return;
  let pendingKey: string | null = null;
  let pending: PendingToolCall | null = null;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.indexOf('pending:') === 0) {
        pendingKey = k;
        pending = JSON.parse(sessionStorage.getItem(k) || 'null');
        break; // 一次只处理一个
      }
    }
  } catch {
    return;
  }
  if (!pendingKey || !pending || !pending.toolUseId) {
    if (pendingKey) sessionStorage.removeItem(pendingKey);
    return;
  }
  const sid = pendingKey.substring('pending:'.length);
  ctx.appendMsg('system', '检测到上次未完成的工具调用,正在重试提交…');
  ctx.setPending(pending);
  // 直接复用 _postToolResult(走完整流程,失败的话会显示重试/取消)
  let token: string;
  try {
    token = await ctx.ensureToken();
  } catch (e) {
    ctx.appendMsg('system', '⚠️ ' + (e as Error).message);
    return;
  }
  await _postToolResultInner(ctx, pending.toolUseId, pending.result, sid, token);
}

