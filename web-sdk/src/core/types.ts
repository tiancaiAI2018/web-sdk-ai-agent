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
  builtinTools?: { changeSkin?: boolean; pageErrors?: boolean; memory?: boolean };
  /**
   * 皮肤名。可选:
   *   - 'iridescent-bloom' (默认,油彩/毛玻璃)
   *   - 'classic'           (极简白底)
   *   - 自定义注册名(registerSkin 后可用)
   * 跟 theme 不冲突:skin 决定"布局/动画",theme 决定"色板"(主题切换仍走 setTheme)
   */
  skin?: string;
  /** 页面感知:捕获宿主页面的 JS 报错、接口错误、错误弹窗,注入给 AI 主动感知。 */
  pageAwareness?: PageAwarenessOptions;
  /**
   * 记忆系统:纯前端 localStorage 持久化,让 AI 跨会话记住用户偏好/事实/历史。
   * 详见 web-sdk/docs/sdk-api.md 记忆章节。
   */
  memory?: import('./memory').MemoryOptions;
  /**
   * 浮窗导航开关(决定哪些页面可见)。
   * 不传:chat/settings=true,memory=跟随 memory.enabled,history=false。
   */
  pages?: {
    chat?: boolean;
    memory?: boolean;
    settings?: boolean;
    history?: boolean;
  };
  /**
   * 快捷指令列表(输入 `/` 触发下拉)。
   * SDK 自带 /new、/clear、/help 三个内置指令,同 name 时用户指令覆盖内置。
   * 详见 web-sdk/docs/sdk-api.md 快捷指令章节。
   */
  quickCommands?: QuickCommand[];
}

// ====================================================================
// 快捷指令(Quick Commands)
// ====================================================================

/**
 * 快捷指令定义 — 输入 `/` 时弹出下拉,选中后执行 action 或填充 expandsTo。
 *
 * 内置指令:
 *   - `/new`   → 新会话
 *   - `/clear` → 清空聊天
 *   - `/help`  → 列出所有指令
 *
 * 行为优先级:action 优先于 expandsTo。两者都不传时,选中后在输入框填充 `/{name} `。
 */
export interface QuickCommand {
  /** 命令名,不含前导 `/`。如 'new'、'help'。同名时后注册覆盖先注册。 */
  name: string;
  /** 显示标签(中文友好),下拉中显示。 */
  label: string;
  /** 描述文本,下拉右侧显示。 */
  description?: string;
  /** 图标(emoji 或文字),如 '🆕'。 */
  icon?: string;
  /**
   * 展开文本:选中后替换输入框中的斜杠命令为此值。
   * 适合模板类命令,如 `/report` → '请帮我生成一份关于 ___ 的报告'。
   */
  expandsTo?: string;
  /**
   * 即时执行回调:选中后立即调用,不清空输入框(SDK 自动清除斜杠文本)。
   * 与 expandsTo 互斥;若两者都传,action 优先。
   * 参数为 agent 实例(用 unknown 避免 types.ts 循环依赖,使用方自行 cast 为 AIAgent)。
   */
  action?: (agent: unknown) => void | Promise<void>;
}

// ====================================================================
// 工具面板(ToolPanel)
// ====================================================================

/**
 * 工具面板条目 — 宿主页面通过 registerToolPanel 注入,
 * SDK 浮窗内渲染为可交互的按钮/开关。
 *
 * 两种类型:
 *   - toggle: 开关型(如"字典查询"),开=注入工具,关=移除工具
 *   - action: 即时执行型(如"清空表单"),点一次执行一次
 *
 * 混合模式:
 *   - toggle 型:SDK 始终自动管理(addEphemeralTools / removeEphemeralTools)
 *   - 如果传了 onToggle 回调,SDK 在自动管理之后额外调用(用于状态同步等)
 *   - action 型:点一次执行一次 onExecute 回调
 */
export interface ToolPanelItem {
  /** 唯一标识,同时作为 toggle 型的工具名 */
  name: string;
  /** 显示文本 */
  label: string;
  /** 图标(emoji 或文字),如 "📖"、"🗑️" */
  icon?: string;
  /** 提示文本(hover 时显示) */
  description?: string;
  /** 条目类型:toggle=开关,action=即时执行 */
  type: 'toggle' | 'action';
  /**
   * toggle 专用:初始状态是否开启。默认 false。
   * 如果为 true,SDK 在注册时自动 addEphemeralTools。
   */
  defaultOn?: boolean;
  /**
   * toggle 专用:工具定义。
   * SDK 自动用此定义调 addEphemeralTools / removeEphemeralTools。
   * 传了 onToggle 时,SDK 仍自动管理,同时额外调 onToggle 回调。
   */
  tool?: ToolDef;
  /**
   * toggle 专用:额外回调(在 SDK 自动管理之后调用)。
   * 传了此回调 → SDK 仍自动管理工具注入/移除(如果有 tool 字段),
   *              同时额外调此回调(用于宿主页面做状态同步、日志等)。
   * 不传 → SDK 只做自动管理,无额外回调。
   */
  onToggle?: (isOn: boolean) => void | Promise<void>;
  /**
   * action 专用:执行回调。
   */
  onExecute?: () => void | Promise<void>;
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
  /** 服务端工具(AgentTool)标记:后端已自动执行,前端只需展示结果 */
  server_executed?: boolean;
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

/** tool_call_end 帧的载荷(流式结束标记) */
export interface ToolCallEndPayload {
  /** 工具调用 ID,用于匹配 tool_call_start / tool_call_delta */
  id?: string;
  /** 工具名,方便前端不依赖 id 也能识别 */
  name?: string;
}

/** round_end 帧的载荷(ReAct 一轮 LLM 调用结束) */
export interface RoundEndPayload {
  /** 本轮是否包含工具调用(前端据此决定是否需要等待 TOOL_RESULT) */
  hasToolCalls?: boolean;
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
  onRoundEnd?: (parsed: RoundEndPayload) => void;
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

// ====================================================================
// 页面感知 (Page Awareness)
// ====================================================================

/** 错误来源 */
export type PageErrorSource = 'global' | 'network' | 'dom_popup';

/** 错误严重级别 */
export type PageErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/** 页面感知捕获的单条错误 */
export interface PageError {
  /** 去重用 ID */
  id: string;
  /** 来源类别 */
  source: PageErrorSource;
  /** 严重级别 */
  severity: PageErrorSeverity;
  /** ISO 时间戳 */
  timestamp: string;
  /** 人可读摘要 */
  message: string;
  /** 来源相关的结构化细节 */
  details: Record<string, unknown>;
  /** 是否已注入过消息前缀(内部标记,避免重复注入) */
  surfaced?: boolean;
}

/**
 * `AIAgent.init({ pageAwareness })` 配置项。
 *
 * 页面感知让 SDK 自动捕获宿主页面的 JS 异常、HTTP 错误、UI 错误弹窗,
 * 注入到 AI 的上下文中,让 AI 能主动发现并帮助用户解决问题。
 *
 * 默认关闭(enabled: false),开启后三个采集源全部启用。
 */
export interface PageAwarenessOptions {
  /** 总开关。默认 false(opt-in)。 */
  enabled?: boolean;

  /** 采集源开关(enabled=true 时全部默认开启) */
  capture?: {
    /** window.onerror + unhandledrejection */
    globalErrors?: boolean;
    /** fetch / XMLHttpRequest 拦截(HTTP 4xx/5xx + 网络失败) */
    networkErrors?: boolean;
    /** MutationObserver 监听 UI 库的错误弹窗/Toast */
    domErrorPopups?: boolean;
  };

  /** 隐私与过滤 */
  filter?: {
    /** 忽略的 URL 正则(如埋点、CDN、第三方脚本) */
    ignoreUrls?: RegExp[];
    /** 忽略的错误消息正则 */
    ignoreMessages?: RegExp[];
    /** 脱敏正则(匹配到的内容替换为 [REDACTED]) */
    redactPatterns?: RegExp[];
    /** 错误消息最大长度,超出截断。默认 500 */
    maxMessageLength?: number;
  };

  /** 行为配置 */
  behavior?: {
    /** 环形缓冲区大小。默认 50 */
    maxBufferSize?: number;
    /** 去重窗口(ms),同一错误在此时间内不重复入库。默认 5000 */
    dedupeWindowMs?: number;
    /** 每条消息最多注入几条错误。默认 5 */
    maxErrorsPerMessage?: number;
    /** 是否自动注入消息前缀。默认 true */
    autoInject?: boolean;
    /** 是否注册 get_page_errors 虚拟工具。默认 true */
    registerTool?: boolean;
  };

  /** 采集到错误时的回调(宿主页面集成用,在过滤/脱敏之前调用) */
  onError?: (error: PageError) => void;
}

// ====================================================================
// 记忆系统(Memory) — 转发 re-export
// ====================================================================

export type {
  MemoryEntry,
  MemoryCategory,
  MemoryScope,
  MemoryOptions,
  MemorySaveInput,
  CapacityErrorResult,
  ForgetCandidate,
  CompressCandidate,
} from './memory';
