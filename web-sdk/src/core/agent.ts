/**
 * AIAgent 主类 —— 编排器,把 TokenCache / ToolsRegistry / Widget /
 * SSE 消费 / Markdown 渲染 / 录单模式全部串起来。
 *
 * 1:1 平移原 SDK 的 AIAgent.prototype.* 方法(原文件 165-1288),
 * 拆分到 ui/、core/、markdown.ts、sse.ts、tools.ts、extract.ts 等模块;
 * 原型方法保留,只把内部实现委托给模块。
 *
 * 公共 API 保持原样,完全向后兼容:
 *   AIAgent.init({...})        // 工厂
 *   agent.stream({...})        // 不带 UI 的程序化流
 *   agent.registerTools({...}) // 工具注册
 *   agent.unregisterTools({...})
 *   agent.listTools({...})
 *   agent.open() / .close() / .toggle()
 *   agent.setTheme({theme:'dark'})
 *   agent.destroy()
 *
 * 兼容性细节:
 *   - agent._opts 仍是公共字段(host-page.html 第 114 行读取)
 *   - sessionStorage key "pending:{sid}" 形状不变
 *   - 所有 CSS class 名前缀不变
 *   - 浮窗注入位置:document.body,定位 bottom-right/bottom-left
 */

import { TokenCache } from './auth';
import { consumeSseStream } from './sse';
import {
  renderMarkdownLite,
  decorateImages,
  ensureMarkdown,
} from './markdown';
import {
  ToolsRegistry,
  registerRemote,
  appendRemote,
  unregisterRemote,
  listRemote,
  postAbort,
  postToolResult,
  renderToolResultFailedCard,
  resumePendingToolResults,
  type ToolCtx,
} from './tools';
import { Widget } from '../ui/widget';
import { applyTheme, DEFAULT_THEME } from '../ui/theme';
import { Skin, SkinRegistry } from './skin';
import { appendMessage, createMessageEl } from '../ui/components/message';
import {
  appendTyping,
  clearTypingParticles,
  markTypingActive,
  unmarkTypingActive,
} from '../ui/components/typing';
import {
  markToolCardSuccess,
  updateToolCardProgress,
  createThinkingCard,
  setThinkingContent,
  finalizeThinking,
  appendToolCard,
  appendToolCallDelta,
  updateToolCallDelta,
  promoteToConfirmedToolCall,
  addConfirmActions,
} from '../ui/components/tool-card';
import type {
  AIAgentOptions,
  Message,
  PendingToolCall,
  SSEEvent,
  StreamOptions,
  RegisterToolsOptions,
  UnregisterToolsOptions,
  ListToolsOptions,
  ToolDef,
  ToolCallPayload,
  ToolCallDeltaPayload,
  ToolCallStartPayload,
  ToolCallEndPayload,
  RoundEndPayload,
  MessageRole,
} from './types';

/**
 * 换肤快照:扫描 msgEl 里的卡 → 结构化数据 → 新 mount 后重放
 *
 * 为什么需要这个类型:
 *   _messages 数组只存 user/assistant 文字;thinking/tool 卡都是 stream 阶段
 *   直接挂到 DOM 的,没存进 _messages。destroy 时 msgEl 整个被丢,新 mount
 *   后没法从 _messages 恢复。所以 setSkin 走"快照 + 重放"路线:destroy 前
 *   把所有卡的状态提取成 CardSnapshot,新 mount 后用 _renderCardSnapshots 重放。
 */
type CardSnapshot =
  | { kind: 'thinking'; content: string; done: boolean }
  | {
      kind: 'tool';
      tool: string;
      args: Record<string, unknown>;
      state: 'delta' | 'pending' | 'confirmed' | 'cancelled' | 'done' | 'success';
      bodyText: string;
    };

export class AIAgent {
  // ===== init 时填的字段(host-page.html demo 读 agent._opts)=====
  endpoint!: string;
  getAccessToken!: () => Promise<{
    accessToken: string;
    refreshToken?: string;
  }>;
  /** 公共字段:宿主页面可读 agent._opts */
  _opts!: {
    title: string;
    subtitle: string;
    placeholder: string;
    welcomeMessage: string;
    theme: 'ink' | 'paper' | 'dark' | 'light';
    position: 'bottom-right' | 'bottom-left';
    autoOpen: boolean;
    avatar: string;
    clientPrefix: string;
    persistentTools: ToolDef[];
    /** 内置工具开关 */
    builtinTools: { changeSkin?: boolean };
    /** 皮肤名(iridescent-bloom / classic / 自定义) */
    skin: string;
  };

  // ===== 内部状态 =====
  _tokenCache = new TokenCache();
  _tools = new ToolsRegistry();
  _widget: Widget | null = null;
  _isOpen = false;
  _busy = false;
  _messages: Message[] = [];
  _chatSessionId: string | null = null;
  _activeTools: string[] = [];
  /**
   * 持久工具:init 时传入的 persistentTools + 内置工具(如 changeSkin)。
   * 本地缓存,不立即调 Register 接口;每个新会话首次发消息时自动注入。
   * 生命周期跟 agent 实例,新会话不会丢失。
   */
  _persistentTools: ToolDef[] = [];
  /**
   * 临时工具:通过 addEphemeralTools 追加的,仅当前会话生效。
   * 新会话时自动清空,不会跨会话残留。
   */
  _ephemeralTools: ToolDef[] = [];
  /**
   * 内置待注册工具 — 静态 list,接受 registerBuiltinTool 的工具定义。
   * 用户首次 _sendUserMessage 时,SDK 自动把这份 list 里所有工具
   * 注册到 chat session 的 sid 下(后端 schema + 本地 _tools onCall 同步)。
   * 关键点:必须用 chat session 的 sid(由 _chatSessionId 提供),
   * 不能用 demo session 的 sid —— 否则主对话 stream 看不到工具。
   */
  static _builtinTools: ToolDef[] = [];
  _pendingToolCall: PendingToolCall | null = null;
  /** 最近一张工具调用卡片的根元素(供 _postToolResult 标记成功/失败用) */
  _lastToolCard: HTMLElement | null = null;
  /** 当前流式思考卡片的根元素(供 onThinking 追加用) */
  _thinkingCard: HTMLElement | null = null;
  /** 当前流式思考的文本累积缓冲 */
  _thinkingBuf: string = '';
  /**
   * tool_call_delta 累积中的占位卡:toolUseId → 卡片 DOM。
   * 完整 tool_call last 帧来时,从这里取卡 promote 成完整卡。
   * 一个 stream 内多个 tool 并发时才会有 >1 项;正常录单场景 1 项。
   */
  _pendingDelta: Map<string, HTMLElement> = new Map();

  // ====================================================================
  // 公共入口
  // ====================================================================

  init(opts: AIAgentOptions): this {
    if (!opts || !opts.endpoint) throw new Error('endpoint required');
    if (typeof opts.getAccessToken !== 'function')
      throw new Error('getAccessToken() required');
    this.endpoint = String(opts.endpoint).replace(/\/+$/, '');
    this.getAccessToken = opts.getAccessToken;

    // ===== 浮窗配置(默认 + 用户覆盖)=====
    this._opts = {
      title: opts.title || 'AI 助手',
      subtitle: opts.subtitle || '在线',
      placeholder:
        opts.placeholder || '输入消息,Enter 发送,Shift+Enter 换行',
      welcomeMessage:
        opts.welcomeMessage || '你好!我是 AI 助手,有什么可以帮你的?',
      theme: opts.theme || 'ink',
      position: opts.position || 'bottom-right',
      autoOpen: !!opts.autoOpen,
      avatar: opts.avatar || '🤖',
      clientPrefix: opts.clientPrefix || 'app',
      persistentTools: opts.persistentTools || [],
      builtinTools: opts.builtinTools || {},
      skin: opts.skin || 'iridescent-bloom',
    };

    // ===== 挂载浮窗 =====
    this._widget = new Widget(this._opts, {
      onSend: () => this._onSend(),
      onNew: () => this._newSession(),
      onClose: () => this.close(),
      onPanelOpen: () => {
        /* no-op,保留钩子 */
      },
      onCycleSkin: (nextName: string) => this.setSkin(nextName),
      onToolPanelToggle: (name: string, isOn: boolean, isAutoManaged: boolean) =>
        this._handleToolPanelToggle(name, isOn, isAutoManaged),
      onToolPanelAction: (name: string) =>
        this._handleToolPanelAction(name),
    });
    this._widget.mount();

    if (this._opts.autoOpen) this.open();

    // 欢迎区(专属 UI,不是消息):init 后显示在 messages 之上
    // 用户发第一条消息后会自动 hideWelcome
    if (this._opts.welcomeMessage) {
      this._widget.setWelcome(this._opts.welcomeMessage);
    }

    // 启动时扫 sessionStorage 续传上次未提交的 tool result(异步,不影响 init)
    setTimeout(() => {
      void this._resumePendingToolResults();
    }, 0);

    // ===== 两层工具模型 =====
    // 持久工具:本地缓存,不立即调 Register 接口;新会话首次发消息时自动注入
    this._persistentTools = this._opts.persistentTools.slice();

    return this;
  }

  destroy(): void {
    if (this._widget) {
      this._widget.destroy();
      this._widget = null;
    }
  }

  // ====================================================================
  // 公共 API — 工具注册(对应原 registerTools / unregisterTools / listTools)
  // ====================================================================

  async registerTools(opts: RegisterToolsOptions): Promise<unknown> {
    if (!opts || !opts.sessionId) throw new Error('sessionId required');
    if (!opts.tools || !opts.tools.length) throw new Error('tools required');
    return this._internalRegister(opts.sessionId, opts.tools);
  }

  async unregisterTools(opts: UnregisterToolsOptions): Promise<unknown> {
    const o = opts || ({} as UnregisterToolsOptions);
    if (!o.sessionId) throw new Error('sessionId required');
    const names = o.names || null; // null = 全清
    // 本地清
    this._tools.unregister(o.sessionId, names);
    // 后端清
    const token = await this._ensureToken();
    return unregisterRemote(this.endpoint, token, o.sessionId, names);
  }

  async listTools(opts: ListToolsOptions): Promise<unknown> {
    const o = opts || ({} as ListToolsOptions);
    if (!o.sessionId) throw new Error('sessionId required');
    const token = await this._ensureToken();
    return listRemote(this.endpoint, token, o.sessionId);
  }

  // 内部:把 tool 定义存到 _tools,后端只接 schema 不接 onCall
  private async _internalRegister(
    sessionId: string,
    toolDefs: ToolDef[]
  ): Promise<unknown> {
    const schemaOnly = this._tools.register(sessionId, toolDefs);
    const token = await this._ensureToken();
    return registerRemote(this.endpoint, token, sessionId, schemaOnly);
  }

  /** 内部:追加工具到 _tools + 后端 append(不清空已有) */
  private async _internalAppend(
    sessionId: string,
    toolDefs: ToolDef[]
  ): Promise<unknown> {
    const schemaOnly = this._tools.register(sessionId, toolDefs);
    const token = await this._ensureToken();
    return appendRemote(this.endpoint, token, sessionId, schemaOnly);
  }

  /**
   * 新会话首次发消息时调用:把持久工具 + 内置工具 + 临时工具 一起注册到 chat session。
   * 流程:先 registerRemote 注册持久工具(全量),再 appendRemote 追加临时工具。
   * 内置工具(changeSkin 等)根据 builtinTools 配置过滤后合并到持久工具。
   */
  private async _syncToolsForSession(sid: string): Promise<void> {
    // 收集持久工具:init 的 persistentTools
    const persistent = this._persistentTools.slice();

    // 收集内置工具,根据 builtinTools 配置过滤
    const builtinCfg = this._opts.builtinTools;
    for (const t of AIAgent._builtinTools) {
      // changeSkin 工具:默认启用,显式传 false 关闭
      if (t.name === 'change_skin' && builtinCfg && builtinCfg.changeSkin === false) {
        continue;
      }
      persistent.push(t);
    }

    // 1) 全量注册持久工具
    if (persistent.length > 0) {
      try {
        await this._internalRegister(sid, persistent);
        for (const t of persistent) {
          if (this._activeTools.indexOf(t.name) < 0) {
            this._activeTools.push(t.name);
          }
        }
        console.log(
          '[AIAgent SDK 🧰 持久工具已注册到 chat session]',
          persistent.map((t) => t.name).join(', ')
        );
      } catch (e) {
        console.warn('[AIAgent SDK] persistent tools register failed:', e);
      }
    }

    // 2) 追加临时工具(不清空持久工具)
    if (this._ephemeralTools.length > 0) {
      try {
        await this._internalAppend(sid, this._ephemeralTools);
        for (const t of this._ephemeralTools) {
          if (this._activeTools.indexOf(t.name) < 0) {
            this._activeTools.push(t.name);
          }
        }
        console.log(
          '[AIAgent SDK 🧰 临时工具已追加到 chat session]',
          this._ephemeralTools.map((t) => t.name).join(', ')
        );
      } catch (e) {
        console.warn('[AIAgent SDK] ephemeral tools append failed:', e);
      }
    }
  }

  /**
   * 追加临时工具。仅当前会话生效,新会话自动清空。
   * 如果当前已有会话,立即追加到后端;否则存入 _ephemeralTools,下次新会话时自动注册。
   */
  async addEphemeralTools(tools: ToolDef[]): Promise<void> {
    if (!tools || !tools.length) return;
    // 存入本地临时工具列表
    for (const t of tools) {
      // 去重:同名覆盖
      this._ephemeralTools = this._ephemeralTools.filter((e) => e.name !== t.name);
      this._ephemeralTools.push(t);
    }
    // 如果当前已有会话,立即追加到后端
    if (this._chatSessionId) {
      try {
        await this._internalAppend(this._chatSessionId, tools);
        for (const t of tools) {
          if (this._activeTools.indexOf(t.name) < 0) {
            this._activeTools.push(t.name);
          }
        }
        console.log(
          '[AIAgent SDK 🧰 临时工具已追加到当前会话]',
          tools.map((t) => t.name).join(', ')
        );
      } catch (e) {
        console.warn('[AIAgent SDK] ephemeral tools append failed:', e);
      }
    }
  }

  /**
   * 移除指定临时工具。仅影响 _ephemeralTools 本地列表 + 后端 unregister。
   * 不影响持久工具。
   */
  async removeEphemeralTools(names: string[]): Promise<void> {
    if (!names || !names.length) return;
    this._ephemeralTools = this._ephemeralTools.filter((t) => !names.includes(t.name));
    // 从 _activeTools 移除
    this._activeTools = this._activeTools.filter((n) => !names.includes(n));
    // 如果当前有会话,从后端也移除
    if (this._chatSessionId) {
      try {
        const token = await this._ensureToken();
        await unregisterRemote(this.endpoint, token, this._chatSessionId, names);
      } catch (e) {
        console.warn('[AIAgent SDK] ephemeral tools remove failed:', e);
      }
    }
  }

  /** 内部:本地查 tool 定义 */
  _getLocalTool(sessionId: string, name: string) {
    return this._tools.get(sessionId, name);
  }

  /**
   * 注册"系统级内置工具"到所有 AIAgent 实例 —— 用户在 html 调用:
   *   AIAgent.registerBuiltinTool(AIAgent.changeSkinTool(agent));
   * 注意:这里接受的是工具定义(带 onCall),SDK 在用户首次发消息时
   *   把它注册到 chat session 的 sid,跟主对话 stream 同步。
   * 跟 registerTools 的区别:registerBuiltinTool 是 SDK 内部机制,
   *   不需要用户自己挑 sid(SDK 自动用 _chatSessionId)。
   */
  static registerBuiltinTool(tool: ToolDef): void {
    if (!tool || !tool.name) {
      console.warn('[AIAgent SDK] registerBuiltinTool: invalid tool');
      return;
    }
    // 同一 name 多次注册覆盖
    AIAgent._builtinTools = AIAgent._builtinTools.filter(
      (t) => t.name !== tool.name
    );
    AIAgent._builtinTools.push(tool);
  }

  // ====================================================================
  // 公共 API — 不带 UI 的流式(老 SDK 兼容)
  // ====================================================================

  async stream(opts: StreamOptions): Promise<void> {
    const o = opts || ({} as StreamOptions);
    return this._postStream({
      sessionId: o.sessionId,
      message: o.message,
      activeTools: o.activeTools || [],
      onChunk: o.onChunk || (() => {}),
      onDone: o.onDone || (() => {}),
      onError: o.onError || ((e) => console.error(e)),
      onToolCall: o.onToolCall,
      onToolCallDelta: o.onToolCallDelta,
      onToolCallStart: o.onToolCallStart,
      onToolCallEnd: o.onToolCallEnd,
    });
  }

  // ====================================================================
  // 公共 API — UI 控制
  // ====================================================================

  open(): void {
    if (this._widget) this._widget.open();
    this._isOpen = true;
  }
  close(): void {
    if (this._widget) this._widget.close();
    this._isOpen = false;
  }
  toggle(): void {
    if (this._widget) this._widget.toggle();
    this._isOpen = this._widget ? this._widget.getIsOpen() : false;
  }

  /** 切换主题(ink/paper/dark/light) */
  setTheme(opts: { theme: 'ink' | 'paper' | 'dark' | 'light' }): void {
    if (this._widget) applyTheme(this._widget, opts.theme);
  }

  /**
   * 运行时切换皮肤(热切换)。语义:
   *   1. 缓存当前 _messages 历史
   *   2. widget.applySkin(name) → 销毁旧 DOM + 用新 skin 重 mount + 保留 isOpen
   *   3. 用 _renderHistory 把消息历史重放
   * 老 theme 字段不动;皮肤和主题正交(theme 改色板,skin 改布局/动画)
   */
  setSkin(name: string): void {
    if (!this._widget) return;
    // 取皮肤验证一下,免得传错名走到默认兜底
    const skin = SkinRegistry.instance().get(name);
    if (!skin) {
      console.warn('[AIAgent SDK] setSkin: skin not found:', name);
      return;
    }
    // 委托给 widget 局部热更新 —— 不再 destroy+mount,所以 msgEl 子树、事件 handler、
    // 思考/工具卡状态 全部保留。
    // 之前在 destroy 前 _snapshotCards + 之后 _renderCardSnapshots 的复杂逻辑全废
    // (那段是 destroy+mount 时代的过渡方案,根上不解决"丢内容"问题)。
    this._widget.applySkin(name);
  }

  /**
   * 注册自定义皮肤(高级用户)。调用后,该皮肤名即可用于 init({skin}) 或 setSkin()。
   * 重复 register 同名皮肤会覆盖。
   */
  registerSkin(skin: Skin): void {
    SkinRegistry.instance().register(skin);
  }

  /** 列出所有已注册皮肤名(含自定义) */
  listSkins(): string[] {
    return SkinRegistry.instance().list();
  }

  /** 列出所有已注册皮肤的详细信息(含 aiHint,供 LLM changeSkin 工具用) */
  listSkinsWithInfo(): Array<{ name: string; aiHint: string }> {
    return SkinRegistry.instance().listWithInfo();
  }

  // ====================================================================
  // 公共 API — 工具面板(ToolPanel)
  // ====================================================================

  /**
   * 注册工具面板条目。调一次,浮窗 header 出现 🔧 按钮,点击展开面板。
   * 可多次调,追加而非覆盖。
   *
   * 混合模式:
   *   - toggle 型:未传 onToggle → SDK 自动管理(addEphemeralTools / removeEphemeralTools)
   *                 传了 onToggle → 手动管理,宿主页面自己决定注入/移除逻辑
   *   - action 型:点一次执行一次 onExecute 回调
   *
   * 示例:
   *   agent.registerToolPanel([
   *     { name: 'query_dict', label: '字典查询', icon: '📖', type: 'toggle',
   *       tool: dictToolDef, defaultOn: false },
   *     { name: 'clear_form', label: '清空表单', icon: '🗑️', type: 'action',
   *       onExecute: () => { document.getElementById('myForm').reset(); } }
   *   ]);
   */
  registerToolPanel(items: import('./types').ToolPanelItem[]): void {
    if (!this._widget) return;
    this._widget.registerToolPanelItems(items);

    // 处理 defaultOn 的 toggle:自动注入工具
    for (const item of items) {
      if (item.type === 'toggle' && item.defaultOn && item.tool && !item.onToggle) {
        // 自动管理模式:defaultOn=true 时立即注入
        void this.addEphemeralTools([item.tool]);
      }
    }
  }

  /**
   * 工具面板 toggle 回调处理。
   * 有 tool 字段时始终自动管理(addEphemeralTools / removeEphemeralTools);
   * 如果传了 onToggle 回调,额外调用(用于宿主页面做状态同步等)。
   */
  private _handleToolPanelToggle(name: string, isOn: boolean, _isAutoManaged: boolean): void {
    if (!this._widget) return;

    const items = (this._widget as any)._toolPanelItems as import('./types').ToolPanelItem[] | undefined;
    const item = items?.find((i) => i.name === name);
    if (!item) return;

    // 有 tool 字段 → SDK 自动管理工具注入/移除
    if (item.tool) {
      if (isOn) {
        void this.addEphemeralTools([item.tool]);
      } else {
        void this.removeEphemeralTools([item.tool.name]);
      }
    }

    // 如果用户传了 onToggle,也调一下(额外逻辑,如状态同步)
    if (typeof item.onToggle === 'function') {
      void item.onToggle(isOn);
    }
  }

  /**
   * 工具面板 action 回调处理。
   */
  private _handleToolPanelAction(name: string): void {
    if (!this._widget) return;

    const items = (this._widget as any)._toolPanelItems as import('./types').ToolPanelItem[] | undefined;
    const item = items?.find((i) => i.name === name);
    if (!item || item.type !== 'action') return;

    if (typeof item.onExecute === 'function') {
      void item.onExecute();
    }
  }

  /**
   * 重放消息历史 —— setSkin 热切换时用。复用 appendMessage,保证:
   *   - 跟初次发送走同一条路径(同一份 CSS 类、同一份 layout)
   *   - 流式占位(typing)不会被错误重放(它们不在 _messages 里)
   *   - tool role 由 _snapshotCards/_renderToolSnapshot 走专门路径(因为 _messages 里的
   *     tool message 丢了卡状态,需要从 DOM 快照恢复)
   */
  private _renderHistory(messages: ReadonlyArray<Message>): void {
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    for (const m of messages) {
      if (m.role === 'tool') continue;  // 工具卡由 _snapshotCards → _renderToolSnapshot 处理
      this._renderMsg(m.role, m.text);
    }
  }

  // ====================================================================
  // 换肤快照:扫描当前 msgEl 的卡(思考 + 工具)→ 结构化数据 → 新 mount 后重放
  // ====================================================================

  /** 思考卡快照:body HTML + done 状态 */
  private _snapshotThinkingCard(el: HTMLElement): { content: string; done: boolean } {
    const body = el.querySelector('.aiagent-sdk-thinking-body') as HTMLElement | null;
    return {
      content: body ? body.innerHTML : '',
      done: el.classList.contains('aiagent-sdk-thinking-done'),
    };
  }

  /** 工具卡快照:tool 名 + 完整 args + 状态 + body 文本 */
  private _snapshotToolCard(el: HTMLElement): {
    tool: string;
    args: Record<string, unknown>;
    state: 'delta' | 'pending' | 'confirmed' | 'cancelled' | 'done' | 'success';
    bodyText: string;
  } {
    const tool = el.getAttribute('data-tool') || '';
    // args 优先从 data-args(appendToolCard 时存了);fallback 从 body 文本解析
    const argsAttr = el.getAttribute('data-args');
    let args: Record<string, unknown> = {};
    if (argsAttr) {
      try { args = JSON.parse(argsAttr); } catch { args = {}; }
    } else {
      const bodyText = (el.querySelector('.aiagent-sdk-tool-body') as HTMLElement)?.textContent || '';
      try { args = JSON.parse(bodyText); } catch { args = {}; }
    }
    // 状态机:看 class 列表(状态切换是 class 加/减,所以这里读 class 就能还原)
    // 顺序很关键:--success 必须最先匹配(因为 markToolCardSuccess 会同时加 --success + --confirmed,
    //   --confirmed 是中间过渡态,--success 才是"已完成"的最终态)
    let state: 'delta' | 'pending' | 'confirmed' | 'cancelled' | 'done' | 'success' = 'pending';
    if (el.classList.contains('aiagent-sdk-tool-success')) state = 'success';
    else if (el.classList.contains('aiagent-sdk-tool-card--delta')) state = 'delta';
    else if (el.classList.contains('aiagent-sdk-tool-cancelled')) state = 'cancelled';
    else if (el.classList.contains('aiagent-sdk-tool-done')) state = 'done';
    else if (el.classList.contains('aiagent-sdk-tool-confirmed')) state = 'confirmed';
    else if (el.classList.contains('aiagent-sdk-tool-card--pending')) state = 'pending';
    // body 累积文本(delta 阶段用,其他阶段空)
    const bodyText =
      state === 'delta'
        ? (el.querySelector('.aiagent-sdk-tool-body') as HTMLElement)?.textContent || ''
        : '';
    return { tool, args, state, bodyText };
  }

  /**
   * 扫描当前 msgEl 里所有 .aiagent-sdk-thinking-card / .aiagent-sdk-tool-card,
   * 按 DOM 顺序返回快照列表。setSkin 在 destroy 前调一次。
   */
  private _snapshotCards(): CardSnapshot[] {
    const refs = this._widget?.getRefs();
    if (!refs) return [];
    const out: CardSnapshot[] = [];
    // querySelectorAll 按 DOM 顺序返回,所以穿插的卡能正确捕获
    const all = refs.msgEl.querySelectorAll(
      '.aiagent-sdk-thinking-card, .aiagent-sdk-tool-card'
    );
    all.forEach((el) => {
      if (el.classList.contains('aiagent-sdk-thinking-card')) {
        const s = this._snapshotThinkingCard(el as HTMLElement);
        out.push({ kind: 'thinking', ...s });
      } else {
        const s = this._snapshotToolCard(el as HTMLElement);
        out.push({ kind: 'tool', ...s });
      }
    });
    return out;
  }

  /**
   * 重放快照:换肤后新 mount,把所有卡按原顺序追加到 msgEl 末尾。
   * 简化策略:_renderHistory 先渲染 user/assistant 文字,再按卡顺序追加卡。
   * 位置精度:卡会被追加在消息流末尾(而不是穿插位置),但内容/状态全在。
   *   后续如果用户嫌位置不对,再升级 _messages 加 type 标记精确还原。
   */
  private _renderCardSnapshots(snapshots: ReadonlyArray<CardSnapshot>): void {
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    for (const snap of snapshots) {
      if (snap.kind === 'thinking') {
        const card = createThinkingCard(refs.msgEl);
        const body = card.querySelector('.aiagent-sdk-thinking-body') as HTMLElement | null;
        if (body) body.innerHTML = snap.content;
        if (snap.done) finalizeThinking(card);
      } else {
        // tool 卡:根据 state 选择正确的创建入口
        if (snap.state === 'delta' && Object.keys(snap.args).length === 0) {
          // 还在流式累积阶段(没完整 args)—— 走 delta 卡 + body 文本
          const card = appendToolCallDelta(refs.msgEl, snap.tool || '...', snap.tool);
          if (snap.bodyText) updateToolCallDelta(card, snap.bodyText);
        } else {
          // 完整 args 阶段:appendToolCard 重建 + 按 state 切 class
          const card = appendToolCard(refs.msgEl, snap.tool, snap.args);
          if (snap.state === 'pending') {
            // 默认就是 pending(appendToolCard 没用 --delta 也没用 --pending,
            // 但 --pending 才有蓝色左边线高亮)—— 显式加一下
            card.classList.add('aiagent-sdk-tool-card--pending');
          } else if (snap.state === 'confirmed' || snap.state === 'success') {
            // confirmed(用户点确认)或 success(工具结果已 2xx 提交)都走 markToolCardSuccess
            // 它的内部判断:有 --pending 时转 --confirmed,加 --success 改 status 文字
            // —— 这是我们要的"已完成"视觉
            markToolCardSuccess(card, '✓ 完成');
          } else if (snap.state === 'cancelled') {
            card.classList.add('aiagent-sdk-tool-cancelled');
            const status = card.querySelector('.aiagent-sdk-tool-status');
            if (status) status.textContent = '✕ 已取消';
          } else if (snap.state === 'done') {
            // done 是折叠态(48px),用 markToolCardSuccess 触发折叠
            markToolCardSuccess(card, '✓ 完成');
          }
        }
      }
    }
  }

  // ====================================================================
  // 内部:token / 新会话 / 发送
  // ====================================================================

  /** 内部:拉 token(委托给 TokenCache) */
  async _ensureToken(): Promise<string> {
    return this._tokenCache.get(this.getAccessToken);
  }

  /** 新会话:abort 旧 sid + 清消息 + 重置 */
  private _newSession(): void {
    const oldSid = this._chatSessionId;
    if (oldSid) postAbort(this.endpoint, '', oldSid).catch(() => {});
    if (this._widget) this._widget.clearMessages();
    this._messages = [];
    this._activeTools = [];
    this._chatSessionId = null;
    this._thinkingCard = null;
    this._pendingDelta.clear();
    // 临时工具仅当前会话生效,新会话清空;持久工具保留
    this._ephemeralTools = [];
    // 新会话:重新显示 welcome 区(如果是新会话)
    if (this._widget && this._opts.welcomeMessage) {
      this._widget.setWelcome(this._opts.welcomeMessage);
    }
  }

  /**
   * Stream 通用文本 lifecycle 工厂 —— _sendUserMessage 和 _postToolResultInner 共用
   *
   * 解决的问题:
   *   chat/stream 和 tools/result 的 SSE 都是"LLM 流式输出",协议一样;
   *   文本渲染、typing 光标、空 div 删除、滚底、错误转 system 消息 —— 都该走同一份逻辑。
   *   之前 tools.ts 自己写了一份几乎一样的内联代码,导致两边行为漂移(比如某天
   *   onDone 改了空 div 处理,resume 漏改就会出 bug)。
   *
   * 用法:
   *   const handlers = buildAgentStreamHandlers({
   *     typing, msgEl,
   *     onUpgrade: () => { /* 主 stream 才有的事情,如 finalizeThinking *\/ },
   *     onSubmitted: () => submitted,  // 主 stream 用来判断 tool_call 是否已提交
   *     markBusyDone: () => self._setBusy(false),
   *     appendSystem: (text) => self._appendMsg('system', text),
   *   });
   *   return consumeSseStream(r.body, handlers.onChunk, handlers.onDone,
   *                           handlers.onError, onToolCall);
   *
   * 注:onThinking / onToolCall* 留在 caller 内部,因为不同 stream 差异太大
   *   (主 stream 完整决策点 + thinking 卡片;resume 简化版 + 无 thinking 卡片)。
   */
  static buildStreamHandlers(opts: {
    typing: HTMLElement;
    msgEl: HTMLElement;
    /** 第一次有内容到达时调(主 stream 用来收思考卡片) */
    onUpgrade?: () => void;
    /** 错误兜底 — 默认 clearTypingParticles + 删 typing + appendSystem('⚠️ ...') */
    onErrorFallback?: (msg: string) => void;
    /** stream 结束时调(主 stream 用来关 busy,resume 也用来关 busy) */
    onDoneCleanup?: () => void;
    /**
     * onDone 时把 assistant 累积文本写回 _messages(主 stream 用,resume 留空)
     * 不传 = 不写回。**关键**:之前 _sendUserMessage 写死了 typing 里 HTML 不会进 _messages,
     *   换肤 destroy 后 DOM 丢了,assistant 文字就消失。setSkin 重放时拿不到。
     */
    onAssistantText?: (text: string) => void;
  }): {
    onChunk: (ev: SSEEvent) => void;
    onDone: () => void;
    onError: (e: Error) => void;
    /** 闭包状态 —— 暴露给 caller 看"是否已经替换 typing" */
    isReplaced: () => boolean;
    /** 取当前累积文本 —— resume 流不替换 typing 但可能用 */
    getAssistantBuf: () => string;
  } {
    let assistantBuf = '';
    let replaced = false;

    function upgrade() {
      if (replaced) return;
      replaced = true;
      clearTypingParticles(opts.typing);
      markTypingActive(opts.typing);
      if (opts.onUpgrade) opts.onUpgrade();
    }

    return {
      onChunk: (ev) => {
        assistantBuf += ev.data || '';
        upgrade();
        opts.typing.innerHTML = renderMarkdownLite(assistantBuf);
        decorateImages(opts.typing);
        opts.msgEl.scrollTop = opts.msgEl.scrollHeight;
      },
      onDone: () => {
        if (!replaced && !assistantBuf) {
          // 整个 stream 没文字(只有 thinking + tool_call)→ 删 typing 避免空框
          opts.typing.remove();
        } else {
          upgrade();
          unmarkTypingActive(opts.typing);
          opts.typing.innerHTML = renderMarkdownLite(assistantBuf);
          decorateImages(opts.typing);
        }
        // 把累积的 assistant 文本写回 _messages(主 stream 用,resume 不传就不写)
        if (opts.onAssistantText) opts.onAssistantText(assistantBuf);
        opts.msgEl.scrollTop = opts.msgEl.scrollHeight;
        if (opts.onDoneCleanup) opts.onDoneCleanup();
      },
      onError: (e) => {
        clearTypingParticles(opts.typing);
        if (replaced) {
          unmarkTypingActive(opts.typing);
          opts.typing.className = 'aiagent-sdk-msg aiagent-sdk-msg-system';
          opts.typing.textContent = '⚠️ ' + e.message;
        } else {
          opts.typing.remove();
          if (opts.onErrorFallback) opts.onErrorFallback('⚠️ ' + e.message);
        }
        if (opts.onDoneCleanup) opts.onDoneCleanup();
      },
      isReplaced: () => replaced,
      getAssistantBuf: () => assistantBuf,
    };
  }

  /** 内部:输入栏发送 */
  private _onSend(): void {
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    const text = refs.taEl.value.trim();
    if (!text || this._busy) return;
    refs.taEl.value = '';
    refs.taEl.style.height = 'auto';
    void this._sendUserMessage(text);
  }

  /**
   * 内部:用户发消息 → 调后端 → 渲染。
   * 渲染策略:复用 typing div 作为"正在写"的助手消息 —
   * onChunk 一直改它,onDone 时它已经是最新的最终内容,不再 append 新 div。
   * 这样不会"页面显示少一段"。
   */
  async _sendUserMessage(text: string): Promise<void> {
    // 用户开始对话 → 隐藏 welcome 区(它的工作已经完成)
    if (this._widget) this._widget.hideWelcome();
    this._appendMsg('user', text);
    this._setBusy(true);
    const refs = this._widget!.getRefs()!;
    // assistant 消息占位(内部是 5 颗粒子,等第一次 onChunk 到达时清空填文本)
    const typing = appendTyping(refs.msgEl);
    this._thinkingBuf = '';
    const self = this;
    const activeSnapshot = this._activeTools.slice();
    let submitted = false;

    // typing 引用包装:round_end 时需要替换为新 typing(onThinking 需要用)
    const typingRef: { typing: HTMLElement } = { typing };

    // 共用 lifecycle 工厂:onChunk / onDone / onError 跟 _postToolResultInner 完全同源
    // 用可变包装对象,round_end 时可以替换内部回调
    const lifecycle: {
      onChunk: (ev: SSEEvent) => void;
      onDone: () => void;
      onError: (e: Error) => void;
      getAssistantBuf: () => string;
    } = (() => {
      const built = AIAgent.buildStreamHandlers({
        typing,
        msgEl: refs.msgEl,
        onUpgrade: () => {
          if (self._thinkingCard) {
            finalizeThinking(self._thinkingCard);
            self._thinkingCard = null;
          }
        },
        onErrorFallback: (msg) => self._appendMsg('system', msg),
        onAssistantText: (text) => {
          if (!text) return;
          self._messages.push({ role: 'assistant', text });
        },
        onDoneCleanup: () => {
          if (!submitted) self._setBusy(false);
          if (self._thinkingCard) {
            finalizeThinking(self._thinkingCard);
            self._thinkingCard = null;
          }
        },
      });
      return {
        onChunk: built.onChunk,
        onDone: built.onDone,
        onError: built.onError,
        getAssistantBuf: built.getAssistantBuf,
      };
    })();

    const postOpts: {
      sessionId?: string;
      message: string;
      activeTools?: string[];
      onChunk: (ev: SSEEvent) => void;
      onDone: () => void;
      onError: (e: Error) => void;
      onThinking: (text: string) => void;
      onToolCall: (parsed: ToolCallPayload) => Promise<void>;
      onToolCallDelta: (parsed: ToolCallDeltaPayload) => void;
      onToolCallStart: (parsed: ToolCallStartPayload) => void;
      onToolCallEnd: (parsed: ToolCallEndPayload) => void;
      onRoundEnd: (parsed: RoundEndPayload) => void;
      onText: (text: string) => void;
    } = {
      message: text,
      // onChunk/onDone/onError 必须通过间接引用调用,不能直接传 lifecycle 的方法!
      // 因为 round_end 会替换 lifecycle.onChunk/onDone/onError 为 newLifecycle 的版本,
      // 如果直接传值,consumeSseStream 持有的是旧引用,id:last 时调不到新 onDone,
      // onChunk 也写不到新 typing,导致最后一轮 round_end 创建的空 typing 无法被清理。
      onChunk: (ev: SSEEvent) => lifecycle.onChunk(ev),
      onDone: () => lifecycle.onDone(),
      onError: (e: Error) => lifecycle.onError(e),
      onThinking: (text: string) => {
        self._handleThinking(text, refs.msgEl, typingRef.typing);
      },
      onToolCallStart: (parsed: ToolCallStartPayload) => {
        self._handleToolCallStart(parsed, refs.msgEl, typingRef.typing);
      },
      onToolCallDelta: (parsed: ToolCallDeltaPayload) => {
        self._handleToolCallDelta(parsed, refs.msgEl, typingRef.typing);
      },
      onToolCallEnd: (parsed: ToolCallEndPayload) => {
        console.log('[AIAgent SDK 🏁 onToolCallEnd] 流式工具参数传输结束', parsed);
        // tool_call_end 表示流式参数传输结束,但不要从 _pendingDelta 中删除!
        // 后续会有 tool_call(完整帧)或 tool_call(server_executed) 来做最终处理,
        // 那时才会 promote delta 卡为 confirmed 卡 + markSuccess。
        // 如果这里删除了,后续 onToolCall 就找不到 delta 卡,会创建重复的新卡片。
      },
      onRoundEnd: (parsed: RoundEndPayload) => {
        // ReAct 一轮 LLM 调用结束(REASONING+isLast=true),重置思考缓冲区,
        // 清理旧 typing 占位,为下一轮创建新的 typing 占位。
        // 这样多轮推理(思考→工具→思考→对话)不会合并到同一个气泡。
        self._thinkingBuf = '';
        if (self._thinkingCard) {
          finalizeThinking(self._thinkingCard);
          self._thinkingCard = null;
        }
        // 提交当前 lifecycle 的 assistant 文本到 _messages
        const buf = lifecycle.getAssistantBuf();
        if (buf) {
          self._messages.push({ role: 'assistant', text: buf });
        }
        // 清理旧 typing:如果旧 typing 没有被 upgrade(没有 assistant 文本),
        // 说明这轮只有思考+工具调用,旧 typing 是空的占位框,需要移除
        const oldTyping = typingRef.typing;
        if (oldTyping && oldTyping.parentNode) {
          // 检查 typing 是否仍为粒子状态(未被 upgrade)
          const hasParticles = oldTyping.querySelector('.aiagent-sdk-typing-particle');
          const hasNoText = !oldTyping.textContent?.trim();
          if (hasParticles || hasNoText) {
            oldTyping.remove();
          } else {
            // typing 已有内容,标记为非活跃
            unmarkTypingActive(oldTyping);
          }
        }
        // 为下一轮创建新的 typing 占位
        const newTyping = appendTyping(refs.msgEl);
        // 重建 lifecycle,让下一轮的 onChunk 写入新 typing
        const newLifecycle = AIAgent.buildStreamHandlers({
          typing: newTyping,
          msgEl: refs.msgEl,
          onUpgrade: () => {
            if (self._thinkingCard) {
              finalizeThinking(self._thinkingCard);
              self._thinkingCard = null;
            }
          },
          onErrorFallback: (msg) => self._appendMsg('system', msg),
          onAssistantText: (text) => {
            if (!text) return;
            self._messages.push({ role: 'assistant', text });
          },
          onDoneCleanup: () => {
            if (!submitted) self._setBusy(false);
            if (self._thinkingCard) {
              finalizeThinking(self._thinkingCard);
              self._thinkingCard = null;
            }
          },
        });
        // 替换 lifecycle 引用(后续 onChunk/onDone 走新 lifecycle)
        lifecycle.onChunk = newLifecycle.onChunk;
        lifecycle.onDone = newLifecycle.onDone;
        lifecycle.onError = newLifecycle.onError;
        // 替换 typing 引用(onThinking 需要用)
        typingRef.typing = newTyping;
      },
      onToolCall: async (parsed: ToolCallPayload) => {
        self._setBusy(true);
        const didSubmit = await self._handleToolCall(parsed, refs.msgEl, typingRef.typing);
        if (didSubmit) submitted = true;
      },
      // text 事件:后端发送的助手文本内容,渲染到 typing 区域
      // 跟 onChunk 处理助手文本的逻辑一致,但 text 事件是独立的事件类型
      onText: (text: string) => {
        if (!text) return;
        // 复用 lifecycle.onChunk 把文本写入 typing 区域
        lifecycle.onChunk({ event: 'text', data: text });
      },
    };

    if (!this._chatSessionId) {
      this._chatSessionId = this._opts.clientPrefix + ':user-' + Date.now();
      // 首次 stream:把持久工具 + 内置工具 + 临时工具 一起注册到 chat session
      await this._syncToolsForSession(this._chatSessionId);
    }
    postOpts.sessionId = this._chatSessionId;
    postOpts.activeTools = activeSnapshot;

    try {
      await this._postStream(postOpts);
    } catch (e) {
      /* _postStream 内部已 onError */
    }
  }

  // ====================================================================
  // SSE 事件处理 —— _sendUserMessage 和 _postToolResultInner 共用
  // ====================================================================

  /** 处理 thinking 事件:累积文本 + 渲染思考卡片 */
  _handleThinking(text: string, msgEl: HTMLElement, typing: HTMLElement): void {
    if (!this._thinkingBuf) this._thinkingBuf = '';
    this._thinkingBuf += text;
    if (!this._thinkingCard) {
      msgEl.insertBefore(createThinkingCard(msgEl), typing);
      const cards = msgEl.querySelectorAll('.aiagent-sdk-thinking-card');
      this._thinkingCard = cards.length ? (cards[cards.length - 1] as HTMLElement) : null;
    }
    if (this._thinkingCard) {
      setThinkingContent(this._thinkingCard, this._thinkingBuf);
    }
  }

  /** 处理 tool_call_start 事件:创建占位卡,插入到 typing 之前 */
  _handleToolCallStart(parsed: ToolCallStartPayload, msgEl: HTMLElement, typing?: HTMLElement): void {
    if (!parsed || !parsed.id || !parsed.name) return;
    const card = appendToolCallDelta(msgEl, parsed.id, parsed.name, typing || null);
    this._pendingDelta.set(parsed.id, card);
  }

  /** 处理 tool_call_delta 事件:累积到占位卡 */
  _handleToolCallDelta(parsed: ToolCallDeltaPayload, msgEl: HTMLElement, typing?: HTMLElement): void {
    if (!parsed || !parsed.id) return;
    let card = this._pendingDelta.get(parsed.id);
    if (!card) {
      card = appendToolCallDelta(msgEl, parsed.id, parsed.name || '...', typing || null);
      this._pendingDelta.set(parsed.id, card);
    }
    updateToolCallDelta(card, parsed.delta || '');
  }

  /**
   * 处理 tool_call 事件(完整帧):查找本地工具 → 执行 onCall → POST /tools/result
   * 服务端工具(server_executed=true):仅展示结果,不执行 onCall,不 POST /tools/result
   * @returns true 表示本 stream 已提交工具结果(调用方据此决定是否关 busy)
   */
  async _handleToolCall(
    parsed: ToolCallPayload,
    msgEl: HTMLElement,
    typing?: HTMLElement
  ): Promise<boolean> {
    if (!parsed || !parsed.tool) return false;
    if (parsed.tool.indexOf('__') === 0) return false;

    // 服务端工具(AgentTool):后端已自动执行,只需展示结果卡片,不需要前端干预
    const isServerExecuted = !!(parsed as { server_executed?: boolean }).server_executed;
    if (isServerExecuted) {
      // promote 占位卡为完成状态
      const existing = parsed.id ? this._pendingDelta.get(parsed.id) : null;
      if (existing) {
        promoteToConfirmedToolCall(existing, parsed.args || {}, parsed.tool);
        this._pendingDelta.delete(parsed.id!);
        // 服务端工具已执行完毕,直接标记成功
        markToolCardSuccess(existing);
      } else {
        // 没有占位卡,创建一个已完成的卡片,插入到 typing 之前
        const card = appendToolCard(msgEl, parsed.tool, parsed.args || {}, typing || null);
        promoteToConfirmedToolCall(card, parsed.args || {}, parsed.tool);
        markToolCardSuccess(card);
      }
      this._messages.push({ role: 'tool', text: '', data: { tool: parsed.tool, args: parsed.args || {} } });
      // 服务端工具不需要 POST /tools/result,agent 不会 TOOL_SUSPENDED
      return false;
    }

    // 以下为 SDK 前端工具的逻辑
    if (!parsed.args || typeof parsed.args !== 'object') return false;
    if (Object.keys(parsed.args).length === 0) return false;

    // promote 占位卡为完整卡
    const existing = parsed.id ? this._pendingDelta.get(parsed.id) : null;
    const card: HTMLElement = existing
      ? (promoteToConfirmedToolCall(existing, parsed.args, parsed.tool),
        this._pendingDelta.delete(parsed.id!), existing)
      : (() => {
          const fb = appendToolCard(msgEl, parsed.tool, parsed.args, typing || null);
          promoteToConfirmedToolCall(fb, parsed.args, parsed.tool);
          return fb;
        })();
    this._lastToolCard = card;
    this._messages.push({ role: 'tool', text: '', data: { tool: parsed.tool, args: parsed.args } });

    // 决策:SDK 有 onCall → 直接执行;无 onCall → 弹确认框
    const localTool = this._getLocalTool(this._chatSessionId!, parsed.tool);
    const hasOnCall = !!(localTool && localTool.onCall);
    if (!hasOnCall) {
      const ok = await addConfirmActions(card);
      if (!ok) {
        this._appendMsg('system', `🚫 已取消工具调用:${parsed.tool}`);
        await this._postAbort();
        return true;
      }
    }

    // 执行 onCall + POST /tools/result
    let toolResult: unknown = hasOnCall ? undefined : { confirmed: true };
    if (hasOnCall) {
      try {
        toolResult = await Promise.resolve(localTool!.onCall!(parsed.args));
      } catch (e) {
        console.error('[AIAgent SDK] onCall threw:', e);
        this._appendMsg('system', '⚠️ onCall 失败: ' + (e as Error).message);
      }
    }
    if (parsed.id) {
      await this._postToolResult(parsed.id, toolResult, card);
    }
    return true;
  }

  _setBusy(busy: boolean): void {
    this._busy = busy;
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    refs.sendBtn.disabled = busy;
    refs.sendBtn.textContent = busy ? '...' : '发送';
  }

  /** 简单 sleep —— _postToolResult 指数退避用 */
  _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ====================================================================
  // 内部:消息渲染(委托给 ui/components/message)
  // ====================================================================

  _appendMsg(
    role: MessageRole,
    text: string,
    data?: { tool: string; args: Record<string, unknown> }
  ): void {
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    // stagger 索引 = 当前消息总数
    appendMessage(refs.msgEl, role, text, this._messages.length, data);
    this._messages.push({ role, text, data });
  }

  /**
   * 纯 DOM 渲染,不写 _messages(给 setSkin 重放用)。
   * 关键:不 push,否则换一次皮肤历史翻倍,反复换会指数级累加(用户实测 bug)。
   * text 为空时(典型 case:tool role 的 placeholder),跳过 —— 不然会出现空消息框。
   */
  private _renderMsg(
    role: MessageRole,
    text: string,
    data?: { tool: string; args: Record<string, unknown> }
  ): void {
    if (!this._widget) return;
    const refs = this._widget.getRefs();
    if (!refs) return;
    // 空 text + 非 system 角色的就别渲染了(空 div 既不显示内容也占位)
    if (!text && role !== 'system') return;
    appendMessage(refs.msgEl, role, text, this._messages.length, data);
  }

  _appendTyping(): HTMLDivElement {
    if (!this._widget) return document.createElement('div');
    const refs = this._widget.getRefs();
    if (!refs) return document.createElement('div');
    return appendTyping(refs.msgEl);
  }

  // ====================================================================
  // 内部:POST + SSE(无 tool_call)
  // ====================================================================

  async _postStream(opts: {
    sessionId?: string;
    message?: string;
    activeTools?: string[];
    onChunk?: (ev: SSEEvent) => void;
    onDone?: () => void;
    onError?: (e: Error) => void;
    onToolCall?: (parsed: ToolCallPayload) => void;
    onToolCallDelta?: (parsed: ToolCallDeltaPayload) => void;
    onToolCallStart?: (parsed: ToolCallStartPayload) => void;
    onToolCallEnd?: (parsed: ToolCallEndPayload) => void;
    onThinking?: (text: string) => void;
    onRoundEnd?: (parsed: RoundEndPayload) => void;
    onText?: (text: string) => void;
  }): Promise<void> {
    const sessionId = opts.sessionId;
    const message = opts.message;
    const activeTools = opts.activeTools;
    const onChunk = opts.onChunk || (() => {});
    const onDone = opts.onDone || (() => {});
    const onError = opts.onError || ((e: Error) => console.error(e));
    const onToolCall = opts.onToolCall;
    const onToolCallDelta = opts.onToolCallDelta;
    const onToolCallStart = opts.onToolCallStart;
    const onToolCallEnd = opts.onToolCallEnd;
    const onThinking = opts.onThinking;
    const onRoundEnd = opts.onRoundEnd;
    const onText = opts.onText;

    if (!sessionId) {
      onError(new Error('sessionId required'));
      return;
    }
    if (message == null) {
      onError(new Error('message required'));
      return;
    }

    let token: string;
    try {
      token = await this._ensureToken();
    } catch (e) {
      onError(e as Error);
      return;
    }

    const url =
      this.endpoint + '/chat/' + encodeURIComponent(sessionId) + '/stream';
    const body: { message: string; activeTools?: string[] } = { message };
    if (activeTools && activeTools.length) body.activeTools = activeTools;

    let r: Response;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      onError(e as Error);
      return;
    }
    if (!r.ok || !r.body) {
      onError(new Error('http ' + r.status));
      return;
    }
    return consumeSseStream(
      r.body, onChunk, onDone, onError,
      onToolCall, onToolCallDelta, onToolCallStart, onToolCallEnd, onThinking, onRoundEnd, onText
    );
  }

  // ====================================================================
  // 内部:TOOL_SUSPENDED 恢复(委托给 tools.ts)
  // ====================================================================

  /** 暴露一个 postToolResult 包装,供 _sendUserMessage 的 onToolCall 调 */
  async _postToolResult(
    toolUseId: string,
    result: unknown,
    card?: HTMLElement | null
  ): Promise<void> {
    const ctx = this._toolCtx();
    return postToolResult(ctx, toolUseId, result, card);
  }

  /**
   * 用户取消工具确认 → 调后端 /tools/abort 释放挂起的 agent。
   * 必须先 setBusy(false),否则用户会以为应用卡死。
   */
  async _postAbort(): Promise<void> {
    const sid = this._chatSessionId;
    if (!sid) return;
    try {
      await postAbort(this.endpoint, await this._ensureToken(), sid);
    } catch (e) {
      console.warn('[AIAgent SDK] abort failed:', (e as Error).message);
    }
    this._setBusy(false);
  }

  /** 启动时续传 — 委托 tools.ts */
  private async _resumePendingToolResults(): Promise<void> {
    return resumePendingToolResults(this._toolCtx());
  }

  // ====================================================================
  // 内部:构造 ctx(给 tools.ts / extract.ts 注入依赖)
  // ====================================================================

  private _toolCtx(): ToolCtx {
    const self = this;
    return {
      endpoint: this.endpoint,
      ensureToken: () => self._ensureToken(),
      getSessionId: () => self._chatSessionId,
      getPending: () => self._pendingToolCall,
      setPending: (p) => {
        self._pendingToolCall = p;
      },
      appendMsg: (role, text, data) => self._appendMsg(role, text, data),
      setBusy: (b) => self._setBusy(b),
      sleep: (ms) => self._sleep(ms),
      appendTyping: () => self._appendTyping(),
      getMsgEl: () => {
        const refs = self._widget?.getRefs();
        return refs?.msgEl || document.createElement('div');
      },
      // SSE 事件处理:tools/result 流跟 stream 流共用同一套逻辑
      handleThinking: (text) => {
        const refs = self._widget?.getRefs();
        if (!refs) return;
        const typing = refs.msgEl.querySelector('.aiagent-sdk-typing') as HTMLElement | null;
        if (typing) self._handleThinking(text, refs.msgEl, typing);
      },
      handleToolCallStart: (parsed) => {
        const refs = self._widget?.getRefs();
        if (!refs) return;
        const typing = refs.msgEl.querySelector('.aiagent-sdk-typing') as HTMLElement | null;
        self._handleToolCallStart(parsed, refs.msgEl, typing || undefined);
      },
      handleToolCallDelta: (parsed) => {
        const refs = self._widget?.getRefs();
        if (!refs) return;
        const typing = refs.msgEl.querySelector('.aiagent-sdk-typing') as HTMLElement | null;
        self._handleToolCallDelta(parsed, refs.msgEl, typing || undefined);
      },
      handleToolCall: async (parsed) => {
        const refs = self._widget?.getRefs();
        if (!refs) return false;
        const typing = refs.msgEl.querySelector('.aiagent-sdk-typing') as HTMLElement | null;
        return self._handleToolCall(parsed as ToolCallPayload, refs.msgEl, typing || undefined);
      },
    };
  }
}

/** 工厂函数 — 暴露 init(opts) 用法(老 SDK 完全兼容) */
export function createAIAgent(): { init: (opts: AIAgentOptions) => AIAgent } {
  return {
    init: (opts: AIAgentOptions) => new AIAgent().init(opts),
  };
}
