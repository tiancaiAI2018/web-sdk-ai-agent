/**
 * 公共类型定义 — AI Agent SDK
 *
 * 这些类型同时被 core/、ui/、adapters/ 引用,放最底层避免循环依赖。
 *
 * 注意:严格保留原 UMD SDK 的对外 API 形状(选项键名、回调签名、返回类型),
 * 只做类型化,逻辑零变化。
 */

// ====================================================================
// init 选项
// ====================================================================

/** 第三方自定义的工具 schema,传给 persistentTools 或 addEphemeralTools。 */
export interface ToolDef {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
  strict?: boolean;
  /** SDK 端 onCall(收到 tool_call 时被调,结果 POST 回 /tools/result) */
  onCall?: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}

/** `AIAgent.init(opts)` 入参。 */
export interface AIAgentOptions {
  /** 后端 base URL,不带尾斜杠 */
  endpoint: string;
  /** 第三方自家的 token 拉取钩子,返 { accessToken, refreshToken? } */
  getAccessToken: () => Promise<{ accessToken: string; refreshToken?: string }>;

  // ===== 浮窗配置(全部可选)=====
  title?: string;
  subtitle?: string;
  placeholder?: string;
  welcomeMessage?: string;
  theme?: 'ink' | 'paper' | 'dark' | 'light';
  position?: 'bottom-right' | 'bottom-left';
  autoOpen?: boolean;
  avatar?: string;
  clientPrefix?: string;
  /**
   * 主题(默认 'ink')。
   *  - 'ink'   :OLED 黑底 + 虹彩油彩(推荐,毛玻璃 + 油彩在深色下最出彩)
   *  - 'paper' :暖米底 + 油彩(适合亮色宿主页)
   *  - 'dark'  :'ink' 的别名(向后兼容,推荐用 'ink')
   *  - 'light' :'paper' 的别名(向后兼容,推荐用 'paper')
   */
  /** 持久工具列表。每个新会话自动注入,生命周期跟 agent 实例。 */
  persistentTools?: ToolDef[];
  /**
   * 内置工具开关。控制 SDK 预制工具(如 changeSkin)是否启用。
   * 不传或 undefined = 全部启用;显式传 false 可关闭指定内置工具。
   * 示例:builtinTools: { changeSkin: false } 关闭换肤工具。
   */
  builtinTools?: { changeSkin?: boolean };
  /**
   * 皮肤名。可选:
   *   - 'iridescent-bloom' (默认,油彩/毛玻璃)
   *   - 'classic'           (极简白底)
   *   - 自定义注册名(registerSkin 后可用)
   * 跟 theme 不冲突:skin 决定"布局/动画",theme 决定"色板"(主题切换仍走 setTheme)
   */
  skin?: string;
}

// ====================================================================
// 消息 + 会话
// ====================================================================

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  role: MessageRole;
  text: string;
  /** tool 角色时携带 {tool, args};其他角色通常 undefined */
  data?: { tool: string; args: Record<string, unknown> };
}

// ====================================================================
// SSE 事件
// ====================================================================

/**
 * 单条 SSE 帧解析后的形态。
 * AgentScope 推的事件类型(原 SDK 不做枚举,保持 string 开放性)。
 */
export interface SSEEvent {
  event?: string;
  data?: string;
  id?: string;
}

/** tool_call 帧的载荷 */
export interface ToolCallPayload {
  tool: string;
  args?: Record<string, unknown>;
  id?: string;
}

/** tool_call_delta 帧的载荷(LLM 流式分片 args 增量) */
export interface ToolCallDeltaPayload {
  id: string;
  delta: string;
  /** 后端给的真实 tool 名(LLM 在 __fragment__ 中间帧也会带,这里始终是真实名) */
  name?: string;
}

/** tool_call_start 帧的载荷(宣告,让前端先建占位卡 + 记 tool 名) */
export interface ToolCallStartPayload {
  id: string;
  name: string;
}

/** tool_call_end 帧的载荷(流式结束标记,data 为空) */
export interface ToolCallEndPayload {
  id?: string;
}

// ====================================================================
// 公共 API 入参形状
// ====================================================================

export interface RegisterToolsOptions {
  sessionId: string;
  tools: ToolDef[];
}

export interface UnregisterToolsOptions {
  sessionId: string;
  names?: string[] | null;
}

export interface ListToolsOptions {
  sessionId: string;
}

export interface StreamOptions {
  sessionId: string;
  message: string;
  onChunk?: (ev: SSEEvent) => void;
  onDone?: () => void;
  onError?: (e: Error) => void;
  onToolCall?: (parsed: ToolCallPayload) => void;
  onToolCallDelta?: (parsed: ToolCallDeltaPayload) => void;
  onToolCallStart?: (parsed: ToolCallStartPayload) => void;
  onToolCallEnd?: (parsed: ToolCallEndPayload) => void;
  onThinking?: (text: string) => void;
  activeTools?: string[];
}

// ====================================================================
// 内部状态
// ====================================================================

/** 工具池条目(本地存,后端只存 schema) */
export interface LocalTool {
  description: string;
  parameters: Record<string, unknown>;
  strict: boolean;
  onCall: ((args: Record<string, unknown>) => unknown | Promise<unknown>) | null;
}

/** sessionStorage 中 `pending:{sid}` 的形状 */
export interface PendingToolCall {
  toolUseId: string;
  result: unknown;
  ts: number;
}
