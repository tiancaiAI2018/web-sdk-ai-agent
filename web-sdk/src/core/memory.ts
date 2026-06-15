/**
 * 前端记忆引擎 —— 纯本地存储,不上传云端。
 *
 * <p>架构:
 * <ul>
 *   <li>localStorage 持久化 global 记忆,key = 'aia-memories-v1'
 *   <li>内存 Map 运行时索引(启动时 parse,写入时 stringify)
 *   <li>模糊搜索走 ./fuzzy 模块
 * </ul>
 *
 * <p>用法:
 * <pre>
 *   const engine = new MemoryEngine({ enabled: true });
 *   engine.enable();
 *   engine.save({ key: 'city', value: '北京', category: 'fact', scope: 'global', pinned: true });
 *   const hits = engine.search('北京');
 * </pre>
 */

import { matchScore, rankMatches, tokenize, type MatchInput } from './fuzzy';

// ====================================================================
// 类型定义
// ====================================================================

/** 记忆类别 */
export type MemoryCategory = 'preference' | 'fact' | 'history' | 'note';

/** 作用域:global 持久化到 localStorage,session 仅内存(关浏览器丢) */
export type MemoryScope = 'global' | 'session';

/** 单条记忆 */
export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  tags?: string[];
  scope: MemoryScope;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  hitCount: number;
  lastHitAt?: string;
}

/** MemoryEngine 构造选项 */
export interface MemoryOptions {
  /** 总开关,默认 false */
  enabled?: boolean;
  /** localStorage key,默认 'aia-memories-v1' */
  storageKey?: string;
  /** 最大记忆条数,默认 1000(达到时 save 返回 capacity_full) */
  maxEntries?: number;
  /** localStorage 序列化字节上限,默认 4MB(留 1MB 余量给宿主其它数据) */
  maxBytes?: number;
  /** 是否自动注入 [Memory Index] 目录到消息前缀,默认 true */
  autoInject?: boolean;
  /** 注入非 pinned 记忆的 key 上限,默认 10(目录模式,体积小) */
  maxInjectCount?: number;
  /** 注入字符上限(目录总长),默认 200 */
  maxIndexChars?: number;
  /** 记忆变化回调(给 UI / agent 订阅) */
  onMemoryChange?: (entries: MemoryEntry[]) => void;
}

/** 单条遗忘候选(供 AI 决定保留/删除) */
export interface ForgetCandidate {
  id: string;
  key: string;
  value: string;
  category: MemoryCategory;
  /** 距上次命中天数(null=从未命中) */
  daysSinceLastHit: number | null;
  /** 距上次更新天数 */
  daysSinceUpdate: number;
}

/** 单组压缩候选(同 category+key 前缀,可合并) */
export interface CompressCandidate {
  /** 同 key 的多条记忆 id 列表 */
  ids: string[];
  keys: string[];
  category: MemoryCategory;
  reason: string;
}

/** 容量错误返回体(save / saveFromTool 失败时给 AI 用) */
export interface CapacityErrorResult {
  ok: false;
  error: 'capacity_full';
  /** 当前条目数 */
  current: number;
  /** 条目上限 */
  capacity: number;
  /** 当前序列化字节数(localStorage 实际占) */
  bytes: number;
  /** 字节上限 */
  maxBytes: number;
  suggestions: {
    /** 5 条最久未用的非 pinned 记忆,供 AI 决定删除哪些 */
    forgetCandidates: ForgetCandidate[];
    /** 1-2 组可合并的记忆(同 category+key 前缀),供 AI 决定压缩 */
    compressCandidates: CompressCandidate[];
  };
  message: string;
}

/** save 的入参(自动生成 id/时间/hitCount) */
export type MemorySaveInput = Omit<
  MemoryEntry,
  'id' | 'createdAt' | 'updatedAt' | 'hitCount' | 'lastHitAt' | 'pinned'
> & { pinned?: boolean };

/** 存储格式 */
interface StoragePayload {
  version: 1;
  entries: MemoryEntry[];
}

// ====================================================================
// 工具函数
// ====================================================================

function genId(): string {
  // 优先 crypto.randomUUID;兜底时间戳 + 随机串
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return 'mem-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

function toMatchInput(e: MemoryEntry): MatchInput {
  return {
    key: e.key,
    value: e.value,
    tags: e.tags,
    pinned: e.pinned,
    lastHitAt: e.lastHitAt,
  };
}

// ====================================================================
// MemoryEngine
// ====================================================================

export class MemoryEngine {
  private _enabled = false;
  private _opts: Required<MemoryOptions>;
  private _entries = new Map<string, MemoryEntry>();
  private _listeners = new Set<(entries: MemoryEntry[]) => void>();

  /**
   * 倒排索引:token → entryId 集合。搜索时先 tokenize(query) → 取所有 token 的
   * entryId 并集 → 在候选上跑 matchScore,避免全表扫。
   *
   * 维护点:_indexAdd / _indexRemove 必须在 _entries 增删后同步调用。
   * 持久化:不持久化(纯运行时,启动时从 _entries 重建)。
   */
  private _index = new Map<string, Set<string>>();

  /**
   * 容量错误死循环保护:key → 最近的 capacity_full 命中时间戳列表。
   * 同 key 5 分钟内连续触发 3 次 → 自动 LRU 淘汰 1 条 + 强制保存,避免 AI 走不出来。
   */
  private _recentCapacityHits = new Map<string, number[]>();
  private static readonly CAPACITY_HIT_WINDOW_MS = 5 * 60 * 1000;
  private static readonly CAPACITY_HIT_THRESHOLD = 3;

  /** 启动时一次性计算好的字节数缓存(避免每次 _persist 都重算) */
  private _lastSerializedBytes = 0;

  constructor(opts: MemoryOptions = {}) {
    this._opts = {
      enabled: !!opts.enabled,
      storageKey: opts.storageKey || 'aia-memories-v1',
      maxEntries: opts.maxEntries ?? 1000,
      maxBytes: opts.maxBytes ?? 4 * 1024 * 1024, // 4MB
      autoInject: opts.autoInject !== false,
      maxInjectCount: opts.maxInjectCount ?? 10,
      maxIndexChars: opts.maxIndexChars ?? 200,
      onMemoryChange: opts.onMemoryChange || (() => {}),
    };
    if (opts.onMemoryChange) this._listeners.add(opts.onMemoryChange);
  }

  // ----------------------------------------------------------------
  // 生命周期
  // ----------------------------------------------------------------

  enable(): void {
    if (this._enabled) return;
    this._enabled = true;
    this._loadFromStorage();
  }

  disable(): void {
    if (!this._enabled) return;
    this._enabled = false;
    this._entries.clear();
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  // ----------------------------------------------------------------
  // CRUD
  // ----------------------------------------------------------------

  /**
   * 保存一条新记忆。**v2 行为变更**:
   * 当条目数或字节数达到上限时,不再静默 LRU 淘汰,改为 throw CapacityError。
   * 调用方(agent / saveFromTool)应 catch 后把错误返回给 AI,让 AI 决定怎么处理。
   * 死循环保护:同 key 5 分钟内连续触发 3 次,自动 LRU 淘汰 1 条 + 强制保存。
   */
  save(input: MemorySaveInput): MemoryEntry {
    this._assertEnabled();

    // 容量检查(条目数 + 字节数任一超限)
    if (this._isCapacityFull()) {
      const key = `${input.category}:${input.key}`;
      if (this._trackCapacityHit(key) === 'fallback') {
        // 死循环兜底:自动 LRU 1 条 + 强制保存
        try {
          console.warn(
            `[AIAgent SDK] memory: same key "${key}" hit capacity_full 3+ times in 5min. ` +
              'Auto-evicting 1 LRU entry to break the loop.'
          );
        } catch {
          /* 静默 */
        }
        this._evictOneLRU();
      } else {
        throw this._buildCapacityError();
      }
    }

    const now = isoNow();
    const entry: MemoryEntry = {
      id: genId(),
      category: input.category,
      key: input.key,
      value: input.value,
      tags: input.tags,
      scope: input.scope || 'global',
      pinned: !!input.pinned,
      createdAt: now,
      updatedAt: now,
      hitCount: 0,
    };

    this._entries.set(entry.id, entry);
    this._indexAdd(entry);
    this._persist();
    this._notify();
    // 成功后清掉该 key 的死循环计数
    this._recentCapacityHits.delete(`${input.category}:${input.key}`);
    return entry;
  }

  /**
   * save 或 update:如果已存在同 (category, key) 的非 session 记忆,合并更新;否则新增。
   *
   * update 路径不抛 CapacityError(覆盖写,容量只会减少),只有新增路径可能抛。
   */
  upsert(input: MemorySaveInput): MemoryEntry {
    this._assertEnabled();
    for (const e of this._entries.values()) {
      if (
        e.scope !== 'session' &&
        e.category === input.category &&
        e.key === input.key
      ) {
        return this.update(e.id, {
          value: input.value,
          tags: input.tags,
          pinned: input.pinned,
        })!;
      }
    }
    return this.save(input);
  }

  get(id: string): MemoryEntry | null {
    return this._entries.get(id) || null;
  }

  update(id: string, patch: Partial<MemoryEntry>): MemoryEntry | null {
    this._assertEnabled();
    const e = this._entries.get(id);
    if (!e) return null;

    // 索引维护:key/value/tags 变了 → 先移除旧索引
    const indexedFields: (keyof MemoryEntry)[] = ['key', 'value', 'tags'];
    const indexChanged = indexedFields.some((f) => patch[f] !== undefined && patch[f] !== e[f]);
    if (indexChanged) this._indexRemove(e);

    const updated: MemoryEntry = {
      ...e,
      ...patch,
      id: e.id,
      createdAt: e.createdAt,
      updatedAt: isoNow(),
    };
    this._entries.set(id, updated);
    if (indexChanged) this._indexAdd(updated);
    this._persist();
    this._notify();
    return updated;
  }

  delete(id: string): boolean {
    this._assertEnabled();
    const e = this._entries.get(id);
    if (!e) return false;
    this._entries.delete(id);
    this._indexRemove(e);
    this._persist();
    this._notify();
    return true;
  }

  list(filter?: { category?: MemoryCategory; pinned?: boolean; scope?: MemoryScope }): MemoryEntry[] {
    const arr = Array.from(this._entries.values());
    if (!filter) return arr.slice().sort(byCreatedAtDesc);
    return arr
      .filter((e) => {
        if (filter.category && e.category !== filter.category) return false;
        if (filter.pinned !== undefined && e.pinned !== filter.pinned) return false;
        if (filter.scope && e.scope !== filter.scope) return false;
        return true;
      })
      .sort(byCreatedAtDesc);
  }

  clear(): void {
    this._assertEnabled();
    if (this._entries.size === 0) return;
    this._entries.clear();
    this._index.clear();
    this._persist();
    this._notify();
  }

  size(): number {
    return this._entries.size;
  }

  // ----------------------------------------------------------------
  // 搜索
  // ----------------------------------------------------------------

  search(
    query: string,
    opts?: {
      limit?: number;
      threshold?: number;
      category?: MemoryCategory;
      tags?: string[];
      touch?: boolean; // 默认 true:命中时 bump hitCount + lastHitAt
    }
  ): MemoryEntry[] {
    if (!this._enabled || !query) return [];

    const touch = opts?.touch !== false;
    const limit = opts?.limit ?? 5;

    // === 倒排索引取候选(性能优化) ===
    // tokenize query → 取所有 token 的 entryId 集合作为初始候选
    const queryTokens = tokenize(query);
    let candidates: MemoryEntry[];

    if (queryTokens.length > 0 && this._index.size > 0) {
      // 收集所有 token 命中的 entryId(去重)
      const idSet = new Set<string>();
      for (const t of queryTokens) {
        const ids = this._index.get(t);
        if (ids) for (const id of ids) idSet.add(id);
      }

      if (idSet.size >= 3) {
        // 候选够多,信任倒排
        candidates = [];
        for (const id of idSet) {
          const e = this._entries.get(id);
          if (e) candidates.push(e);
        }
      } else {
        // 候选太少(可能是同义词/拼写差异/缩写),回退全表扫
        // 仍走 matchScore,只是来源是全集
        candidates = Array.from(this._entries.values());
      }
    } else {
      // 索引空或 query 无 token,全表扫
      candidates = Array.from(this._entries.values());
    }

    // === 应用 category / tags 过滤(在候选上做,O(k)) ===
    if (opts?.category) candidates = candidates.filter((e) => e.category === opts.category);
    if (opts?.tags && opts.tags.length > 0) {
      const want = new Set(opts.tags.map((t) => t.toLowerCase()));
      candidates = candidates.filter(
        (e) => e.tags && e.tags.some((t) => want.has(t.toLowerCase()))
      );
    }

    // === 精排(matchScore + 加权评分) ===
    const ranked = rankMatches(candidates, query, {
      limit,
      threshold: opts?.threshold ?? 0.15,
    });
    const hits = ranked.map((r) => r.item);

    // touch:命中时 bump hitCount + lastHitAt
    if (touch && hits.length > 0) {
      const now = isoNow();
      for (const e of hits) {
        const hit = this._entries.get(e.id);
        if (hit) {
          hit.hitCount = (hit.hitCount || 0) + 1;
          hit.lastHitAt = now;
        }
      }
      this._persist();
      this._notify();
    }

    return hits;
  }

  // ----------------------------------------------------------------
  // 工具回调入口(AI 调 save_memory / recall_memory)
  // ----------------------------------------------------------------

  saveFromTool(args: Record<string, unknown>): unknown {
    try {
      const key = String(args.key || '').trim();
      const value = String(args.value || '').trim();
      const category = normalizeCategory(args.category);
      if (!key || !value || !category) {
        return {
          ok: false,
          error: 'missing_field',
          message: 'key、value、category 是必填字段',
        };
      }
      const entry = this.upsert({
        key,
        value,
        category,
        tags: Array.isArray(args.tags) ? args.tags.map(String) : undefined,
        pinned: !!args.pinned,
        scope: (args.scope === 'session' ? 'session' : 'global') as MemoryScope,
      });
      return {
        ok: true,
        id: entry.id,
        entry: sanitizeEntry(entry),
        message: `已保存记忆「${entry.key}」:${entry.value}`,
      };
    } catch (e) {
      // 容量错误:直接返回结构化错误给 AI(带候选列表)
      if (e && typeof e === 'object' && (e as { name?: string }).name === 'CapacityError') {
        return e; // 已经是 CapacityErrorResult 形态
      }
      return { ok: false, error: (e as Error).message };
    }
  }

  recallFromTool(args: Record<string, unknown>): unknown {
    try {
      const query = String(args.query || '').trim();
      if (!query) {
        return { ok: false, error: 'missing_query', message: 'query 是必填字段' };
      }
      const category = normalizeCategory(args.category);
      const tags = Array.isArray(args.tags) ? args.tags.map(String) : undefined;
      const limit = Number(args.limit) > 0 ? Number(args.limit) : 5;

      const hits = this.search(query, { limit, category, tags });
      if (hits.length === 0) {
        return {
          ok: true,
          count: 0,
          items: [],
          message: '未找到匹配的记忆。试试换个关键词,或检查类别过滤。',
        };
      }
      return {
        ok: true,
        count: hits.length,
        items: hits.map(sanitizeEntry),
        formatted: hits
          .map(
            (h) =>
              `- [${h.category}] ${h.key}: ${h.value}` +
              (h.tags && h.tags.length ? ` (tags: ${h.tags.join(',')})` : '') +
              (h.pinned ? ' 📌' : '')
          )
          .join('\n'),
      };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // ----------------------------------------------------------------
  // 上下文注入(消息前缀) — 轻量目录模式
  // ----------------------------------------------------------------

  /**
   * 构建注入到用户消息头部的 [Memory Index] 区块(轻量目录模式)。
   *
   * <p>设计原则:
   * <ul>
   *   <li>只列 key,不展开 value — 节省 token,避免记忆数膨胀时爆上下文
   *   <li>pinned 全部展示 + 标 📌(超过 5 条时控制台警告)
   *   <li>非 pinned:有 userQuery 时走模糊匹配,无则按 updatedAt desc
   *   <li>总字符数受 maxIndexChars 限制,超出截断
   *   <li>AI 真要看具体内容 → 调 recall_memory({query})
   * </ul>
   *
   * @param userQuery 当前用户输入(可选)。若提供,会对非 pinned 记忆做模糊匹配,
   *                  优先列出与 query 相关的 key(而不是只按时间)。
   * @returns 注入字符串,无记忆时返回 null
   */
  buildContextBlock(userQuery?: string): string | null {
    if (!this._enabled || !this._opts.autoInject) return null;
    if (this._entries.size === 0) return null;

    const all = Array.from(this._entries.values()).filter((e) => e.scope !== 'session');
    if (all.length === 0) return null;

    // 1. pinned 全部展示(但有硬上限 5 条,超出时控制台警告)
    const PINNED_HARD_CAP = 5;
    const pinned = all.filter((e) => e.pinned).sort(byCategory);
    if (pinned.length > PINNED_HARD_CAP) {
      try {
        console.warn(
          `[AIAgent SDK] memory: ${pinned.length} pinned entries (cap=${PINNED_HARD_CAP}). ` +
            `Recommend unpinning old ones. Auto-injection shows first ${PINNED_HARD_CAP}.`
        );
      } catch {
        /* 静默 */
      }
    }
    const pinnedToShow = pinned.slice(0, PINNED_HARD_CAP);

    // 2. 非 pinned:有 userQuery 就走模糊匹配;没就按 updatedAt desc 取最近
    const rest = all.filter((e) => !e.pinned);
    let restKeys: string[];
    if (userQuery && userQuery.trim()) {
      const ranked = rankMatches(rest, userQuery, {
        limit: this._opts.maxInjectCount * 2,
        threshold: 0.15,
      });
      restKeys = ranked.map((r) => r.item.key);
    } else {
      restKeys = rest.sort(byUpdatedAtDesc).slice(0, this._opts.maxInjectCount).map((e) => e.key);
    }

    // 3. 拼装目录
    const pinnedLine = pinnedToShow.length
      ? 'pinned: ' + pinnedToShow.map((e) => `📌 ${e.key}`).join(', ')
      : '';
    const restLine =
      restKeys.length > 0
        ? (pinnedLine ? '\n' : '') +
          (rest.length > restKeys.length
            ? `其他 (前 ${restKeys.length}/${rest.length}): `
            : '其他: ') +
          restKeys.join(', ')
        : '';
    const totalEntries = pinned.length + rest.length;
    const omitted = rest.length - restKeys.length;

    let block =
      `[Memory Index - 共 ${totalEntries} 条记忆]\n` +
      `可调 recall_memory({query:"..."}) 检索详情。` +
      (omitted > 0 ? ` (另有 ${omitted} 条未列出,可用 recall 检索)` : '') +
      '\n' +
      (pinnedLine + restLine).trim();

    // 4. 截断到 maxIndexChars
    if (block.length > this._opts.maxIndexChars) {
      block = block.slice(0, this._opts.maxIndexChars - 3) + '...';
    }

    return block;
  }

  // ----------------------------------------------------------------
  // 导入 / 导出
  // ----------------------------------------------------------------

  export(): string {
    const payload: StoragePayload = {
      version: 1,
      entries: Array.from(this._entries.values()),
    };
    return JSON.stringify(payload);
  }

  /**
   * 导入 JSON。按 id 去重(已存在则跳过)。
   * @returns 实际导入的条数
   */
  import(json: string): number {
    this._assertEnabled();
    let payload: StoragePayload;
    try {
      payload = JSON.parse(json) as StoragePayload;
    } catch (e) {
      throw new Error('JSON 解析失败: ' + (e as Error).message);
    }
    if (!payload || !Array.isArray(payload.entries)) {
      throw new Error('格式不正确:缺少 entries 数组');
    }

    let imported = 0;
    for (const raw of payload.entries) {
      if (!raw || typeof raw !== 'object') continue;
      if (!raw.id || !raw.key || !raw.value || !raw.category) continue;
      if (this._entries.has(raw.id)) continue;
      if (this._entries.size >= this._opts.maxEntries) break;

      const entry: MemoryEntry = {
        id: raw.id,
        category: normalizeCategory(raw.category) ?? 'note',
        key: String(raw.key),
        value: String(raw.value),
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : undefined,
        scope: raw.scope === 'session' ? 'session' : 'global',
        pinned: !!raw.pinned,
        createdAt: raw.createdAt || isoNow(),
        updatedAt: raw.updatedAt || isoNow(),
        hitCount: Number(raw.hitCount) || 0,
        lastHitAt: raw.lastHitAt,
      };
      this._entries.set(entry.id, entry);
      imported++;
    }

    if (imported > 0) {
      this._persist();
      this._notify();
    }
    return imported;
  }

  // ----------------------------------------------------------------
  // 事件
  // ----------------------------------------------------------------

  /** 订阅变更事件,返回取消订阅函数 */
  onChange(cb: (entries: MemoryEntry[]) => void): () => void {
    this._listeners.add(cb);
    return () => {
      this._listeners.delete(cb);
    };
  }

  // ----------------------------------------------------------------
  // 内部
  // ----------------------------------------------------------------

  private _assertEnabled(): void {
    if (!this._enabled) {
      throw new Error('MemoryEngine 未启用,请传 memory: { enabled: true }');
    }
  }

  /** 旧版容量强制 LRU 淘汰,已废弃。v2 改为 save() 抛 CapacityError,AI 主导 */
  private _enforceCapacity(): void {
    // no-op:保留方法签名防止外部旧引用,实际逻辑移到 save() 的 _evictOneLRU
  }

  private _loadFromStorage(): void {
    this._entries.clear();
    try {
      const raw = localStorage.getItem(this._opts.storageKey);
      if (!raw) return;
      const payload = JSON.parse(raw) as StoragePayload;
      if (!payload || !Array.isArray(payload.entries)) return;
      for (const e of payload.entries) {
        if (e && typeof e === 'object' && e.id) {
          this._entries.set(e.id, e as MemoryEntry);
        }
      }
    } catch {
      // 坏数据 → 忽略
    }
    // 启动后一次性建倒排索引(从 localStorage 加载的 entries 不在 _index 里)
    this._rebuildIndex();
  }

  private _persist(): void {
    try {
      const globalEntries = Array.from(this._entries.values()).filter(
        (e) => e.scope === 'global'
      );
      const payload: StoragePayload = { version: 1, entries: globalEntries };
      localStorage.setItem(this._opts.storageKey, JSON.stringify(payload));
    } catch (e) {
      // 满盘 / 隐私模式 → 降级:仅保留内存
      try {
        console.warn('[AIAgent SDK] memory persist failed:', (e as Error).message);
      } catch {
        // 静默
      }
    }
  }

  private _notify(): void {
    const arr = Array.from(this._entries.values());
    for (const cb of this._listeners) {
      try {
        cb(arr);
      } catch {
        // 吞掉回调异常,不影响主流程
      }
    }
  }

  // ====================================================================
  // 倒排索引(性能优化)
  // ====================================================================

  /** 把 entry 的 key/value/tags tokenize 后加入倒排表 */
  private _indexAdd(entry: MemoryEntry): void {
    const tokens = this._entryTokens(entry);
    for (const t of tokens) {
      let s = this._index.get(t);
      if (!s) {
        s = new Set();
        this._index.set(t, s);
      }
      s.add(entry.id);
    }
  }

  /** 从倒排表移除 entry(在 delete / update-key-change 时调用) */
  private _indexRemove(entry: MemoryEntry): void {
    const tokens = this._entryTokens(entry);
    for (const t of tokens) {
      const s = this._index.get(t);
      if (!s) continue;
      s.delete(entry.id);
      if (s.size === 0) this._index.delete(t);
    }
  }

  /** 提取 entry 的索引 token(key + value 截前 500 字符 + tags) */
  private _entryTokens(entry: MemoryEntry): string[] {
    const out = new Set<string>();
    for (const t of tokenize(entry.key)) out.add(t);
    // value 太长时截断,避免索引爆炸(value=100KB 时 tokenize 出几万个 token)
    const v = entry.value.length > 500 ? entry.value.slice(0, 500) : entry.value;
    for (const t of tokenize(v)) out.add(t);
    if (entry.tags) {
      for (const tag of entry.tags) {
        for (const t of tokenize(tag)) out.add(t);
      }
    }
    return Array.from(out);
  }

  /** 启动时从 _entries 全量重建倒排 */
  private _rebuildIndex(): void {
    this._index.clear();
    for (const e of this._entries.values()) this._indexAdd(e);
  }

  // ====================================================================
  // 容量管理
  // ====================================================================

  /** 容量是否已满(条目数 or 字节数任一超限) */
  private _isCapacityFull(): boolean {
    if (this._entries.size >= this._opts.maxEntries) return true;
    if (this._getSerializedBytes() >= this._opts.maxBytes) return true;
    return false;
  }

  /** 估算当前 localStorage 序列化字节数(用缓存避免每次重算) */
  private _getSerializedBytes(): number {
    // 简单估算:_entries 数 × 平均 500B;1000 条 ≈ 500KB。
    // 实际想精确可以 JSON.stringify 一次,但 1000 条要 5-10ms,不划算。
    // 留接口给未来要精确计算时切换。
    if (this._lastSerializedBytes === 0 && this._entries.size > 0) {
      this._lastSerializedBytes = this._entries.size * 500;
    }
    return Math.max(this._lastSerializedBytes, this._entries.size * 500);
  }

  /** 死循环保护:同 key 5 分钟内 hit 计数,达到阈值返回 'fallback' */
  private _trackCapacityHit(key: string): 'allow' | 'fallback' {
    const now = Date.now();
    const window = MemoryEngine.CAPACITY_HIT_WINDOW_MS;
    let arr = this._recentCapacityHits.get(key);
    if (!arr) {
      arr = [];
      this._recentCapacityHits.set(key, arr);
    }
    arr.push(now);
    // 清理窗口外的时间戳
    while (arr.length > 0 && now - arr[0] > window) arr.shift();
    return arr.length >= MemoryEngine.CAPACITY_HIT_THRESHOLD ? 'fallback' : 'allow';
  }

  /** 兜底:LRU 淘汰 1 条非 pinned 记忆 */
  private _evictOneLRU(): void {
    let oldest: MemoryEntry | null = null;
    for (const e of this._entries.values()) {
      if (e.pinned) continue;
      if (!oldest) {
        oldest = e;
        continue;
      }
      // 优先 lastHitAt 升序(null 视为最久);其次 updatedAt 升序
      const a = oldest.lastHitAt || '0';
      const b = e.lastHitAt || '0';
      if (b < a) oldest = e;
      else if (b === a && e.updatedAt < oldest.updatedAt) oldest = e;
    }
    if (oldest) {
      this._entries.delete(oldest.id);
      this._indexRemove(oldest);
    }
  }

  /** 构建容量错误结构(返回给 AI 用的结构化数据) */
  private _buildCapacityError(): object {
    const now = Date.now();
    const MS_PER_DAY = 86_400_000;
    const dayDiff = (iso: string) =>
      Math.max(0, Math.floor((now - new Date(iso).getTime()) / MS_PER_DAY));

    // === 遗忘候选:5 条最久未用(非 pinned)===
    // 排序:null lastHitAt 优先(从未命中),然后 lastHitAt 升序,再 updatedAt 升序
    const sortedForEvict = Array.from(this._entries.values())
      .filter((e) => !e.pinned)
      .sort((a, b) => {
        const aHit = a.lastHitAt || '';
        const bHit = b.lastHitAt || '';
        // null/空 视为最旧(优先淘汰)
        if (!aHit && bHit) return -1;
        if (aHit && !bHit) return 1;
        if (aHit !== bHit) return aHit.localeCompare(bHit);
        return a.updatedAt.localeCompare(b.updatedAt);
      });
    const forgetCandidates: ForgetCandidate[] = sortedForEvict.slice(0, 5).map((e) => ({
      id: e.id,
      key: e.key,
      value: e.value.length > 200 ? e.value.slice(0, 200) + '…' : e.value,
      category: e.category,
      daysSinceLastHit: e.lastHitAt ? dayDiff(e.lastHitAt) : null,
      daysSinceUpdate: dayDiff(e.updatedAt),
    }));

    // === 压缩候选:同 category+key 前缀的条目组(>1 条)===
    // 简化版:按 (category, key 第一个词) 分组
    const groups = new Map<string, MemoryEntry[]>();
    for (const e of this._entries.values()) {
      const keyPrefix = e.key.split(/[._\s]/)[0] || e.key;
      const gk = `${e.category}::${keyPrefix.toLowerCase()}`;
      let arr = groups.get(gk);
      if (!arr) {
        arr = [];
        groups.set(gk, arr);
      }
      arr.push(e);
    }
    const compressCandidates: CompressCandidate[] = [];
    for (const [, arr] of groups) {
      if (arr.length < 2) continue;
      compressCandidates.push({
        ids: arr.map((e) => e.id),
        keys: arr.map((e) => e.key),
        category: arr[0].category,
        reason: `同 category + 相似 key 前缀 (${arr[0].key.split(/[._\s]/)[0]}),可合并/覆盖`,
      });
      if (compressCandidates.length >= 2) break;
    }

    return {
      ok: false,
      error: 'capacity_full',
      current: this._entries.size,
      capacity: this._opts.maxEntries,
      bytes: this._getSerializedBytes(),
      maxBytes: this._opts.maxBytes,
      suggestions: { forgetCandidates, compressCandidates },
      message:
        `记忆容量已满 (${this._entries.size}/${this._opts.maxEntries} 条, ` +
        `${Math.round(this._getSerializedBytes() / 1024)}KB/${Math.round(this._opts.maxBytes / 1024)}KB)。\n` +
        `AI 可选操作:\n` +
        `  A. 遗忘(给候选):查看 forgetCandidates 列表,挑出用户已不需要的记忆,调 delete_memory 删后再 save。\n` +
        `  B. 压缩(给候选):查看 compressCandidates 列表,合并相似条目后 save。\n` +
        `  C. 提示用户手动清理,告诉用户"打开浮窗 → 🧠 记忆 → 清空"。\n` +
        `注:5 分钟内同 key 连续 3 次失败会自动 LRU 淘汰 1 条兜底,避免循环。`,
      name: 'CapacityError', // 标识,saveFromTool 用此判断走哪个错误路径
    };
  }
}

// ====================================================================
// 辅助
// ====================================================================

function byCreatedAtDesc(a: MemoryEntry, b: MemoryEntry): number {
  return b.createdAt.localeCompare(a.createdAt);
}
function byUpdatedAtDesc(a: MemoryEntry, b: MemoryEntry): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}
function byCategory(a: MemoryEntry, b: MemoryEntry): number {
  return a.category.localeCompare(b.category);
}

function normalizeCategory(v: unknown): MemoryCategory | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.toLowerCase();
  if (s === 'preference' || s === 'fact' || s === 'history' || s === 'note') {
    return s;
  }
  return undefined;
}

/** 返回给 AI / 外部时,剥离掉内部字段,保证稳定形态 */
function sanitizeEntry(e: MemoryEntry): Record<string, unknown> {
  return {
    id: e.id,
    category: e.category,
    key: e.key,
    value: e.value,
    tags: e.tags,
    pinned: e.pinned,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
    hitCount: e.hitCount,
  };
}
