/**
 * 轻量级模糊搜索引擎 —— 借鉴 Fuse.js 的 Bitap + 加权评分,但纯手写无依赖。
 *
 * <p>设计目标:
 * <ul>
 *   <li>SDK bundle 增量 &lt; 3KB(不引入 Fuse.js 这类 ~20KB 的库)
 *   <li>覆盖 5 档匹配:精确包含 / 前缀 / 分词 / 近似 / 同义词
 *   <li>中文友好(支持全角标点分词,不依赖拼音库)
 *   <li>纯函数,零副作用,易于单测
 * </ul>
 *
 * <p>评分区间:[0, 1],越高越相关,0 表示不命中。
 */

// ====================================================================
// 同义词表(中英文常见映射,硬编码)
// ====================================================================

/** 每对同义词,在模糊匹配时互相等价(score = 0.65) */
export const SYNONYMS: ReadonlyArray<readonly [string, string]> = Object.freeze([
  // 地名
  ['北京', 'bj'],
  ['上海', 'sh'],
  ['广州', 'gz'],
  ['深圳', 'sz'],
  // 物流
  ['仓库', 'warehouse'],
  ['快递', '物流'],
  ['顺丰', 'sf'],
  // 操作
  ['加急', 'urgent'],
  ['特急', 'critical'],
  ['普通', 'normal'],
  // 联系
  ['手机', '电话'],
  ['phone', 'mobile'],
  // 商品
  ['电脑', '笔记本'],
  ['手机', 'phone'],
]);

// ====================================================================
// Levenshtein 编辑距离(优化版,只保留一行 dp)
// ====================================================================

/**
 * 计算两个字符串的编辑距离。O(n*m) 时间,O(min(n,m)) 空间。
 * 调用方应先让 a 是较短的那个,减少空间占用。
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  // 保证 a 是较短的
  if (a.length > b.length) {
    const t = a;
    a = b;
    b = t;
  }

  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(m + 1);
  let curr = new Array<number>(m + 1);

  for (let i = 0; i <= m; i++) prev[i] = i;

  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    for (let i = 1; i <= m; i++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,       // delete
        curr[i - 1] + 1,   // insert
        prev[i - 1] + cost // replace
      );
    }
    const t = prev;
    prev = curr;
    curr = t;
  }

  return prev[m];
}

/**
 * 子串编辑距离:在 text 中找一段长度与 query 相近的子串,使其与 query 的编辑距离最小。
 * 用于"长文本 vs 短查询"场景(如记忆 value 是一句话,query 是关键词)。
 * O(n*m) 但提前剪枝,实测很快。
 */
export function substringDistance(text: string, query: string): number {
  if (!query.length) return 0;
  if (text.length <= query.length) return levenshtein(text, query);

  let best = query.length; // 最差全替换
  const maxStart = text.length - Math.max(1, query.length - 2);
  for (let i = 0; i <= maxStart; i++) {
    const end = Math.min(text.length, i + query.length + 2);
    const sub = text.slice(i, end);
    const d = levenshtein(sub, query);
    if (d < best) best = d;
    if (best === 0) return 0;
  }
  return best;
}

// ====================================================================
// 分词(中英混合,按空格/标点)
// ====================================================================

const TOKEN_RE = /[\s,，。、;；:：!！?？()（）\-_/\\|]+/;

/** 简单分词,空串过滤。对英文小写化。 */
export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(TOKEN_RE)
    .map((t) => t.trim())
    .filter(Boolean);
}

// ====================================================================
// 单字段匹配(5 档评分)
// ====================================================================

/**
 * 对单个字段做 5 档匹配,返回 [0, 1] 分数。
 *
 * <ol>
 *   <li>精确包含 → 1.0
 *   <li>前缀命中 → 0.9
 *   <li>分词全命中 → 0.75
 *   <li>近似(编辑距离 ≤ len/4)→ 0.4 ~ 0.7
 *   <li>不命中 → 0
 * </ol>
 *
 * <p>不在此函数处理同义词(在顶层 matchScore 里兜底)。
 */
export function fieldMatch(text: string, query: string): number {
  if (!text || !query) return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 0;

  // 1. 精确包含(双向)
  if (t.includes(q) || q.includes(t)) return 1.0;

  // 2. 前缀
  if (t.startsWith(q)) return 0.9;

  // 3. 分词全命中
  const tokens = tokenize(q);
  if (tokens.length > 1 && tokens.every((tk) => t.includes(tk))) {
    return 0.75;
  }

  // 4. 近似(子串编辑距离)
  const dist = substringDistance(t, q);
  const maxErrors = Math.max(1, Math.floor(q.length / 4));
  if (dist <= maxErrors) {
    return 0.7 - (dist / q.length) * 0.3; // 0.4 ~ 0.7
  }

  return 0;
}

// ====================================================================
// 同义词加分
// ====================================================================

/** 若 text 和 query 命中任意一对同义词,返回 0.65;否则 0。 */
export function synonymBoost(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  for (const [a, b] of SYNONYMS) {
    const al = a.toLowerCase();
    const bl = b.toLowerCase();
    if (
      (q.includes(al) && t.includes(bl)) ||
      (q.includes(bl) && t.includes(al))
    ) {
      return 0.65;
    }
  }
  return 0;
}

// ====================================================================
// 综合评分(用于记忆检索)
// ====================================================================

export interface MatchInput {
  key: string;
  value: string;
  tags?: string[];
  pinned?: boolean;
  lastHitAt?: string; // ISO
}

/**
 * 综合加权评分。
 *
 * <pre>
 *   base = 0.5 × keyMatch + 0.3 × valueMatch + 0.1 × tagMatch + 0.1 × recencyBonus
 *   final = base + (pinned ? 0.05 : 0) × recencyDecay
 * </pre>
 */
export function matchScore(item: MatchInput, query: string): number {
  if (!query) return 0;

  const keyS = fieldMatch(item.key, query);
  const valS = fieldMatch(item.value, query);

  // tags 取最大分
  let tagS = 0;
  if (item.tags && item.tags.length > 0) {
    for (const tag of item.tags) {
      const s = fieldMatch(tag, query);
      if (s > tagS) tagS = s;
    }
  }

  // recency:30 天内满分,30~90 天 0.6,90 天以上 0.3
  let recency = 0;
  if (item.lastHitAt) {
    const age = Date.now() - new Date(item.lastHitAt).getTime();
    const days = age / 86_400_000;
    if (days <= 30) recency = 1.0;
    else if (days <= 90) recency = 0.6;
    else recency = 0.3;
  }

  let base = 0.5 * keyS + 0.3 * valS + 0.1 * tagS + 0.1 * recency;

  // 同义词兜底:如果加权分低但同义词命中,补到 0.65
  if (base < 0.5) {
    const synK = synonymBoost(item.key, query);
    const synV = synonymBoost(item.value, query);
    const synMax = Math.max(synK, synV);
    if (synMax > base) base = Math.max(base, synMax * 0.8);
  }

  // 置顶加分
  if (item.pinned) base += 0.05;

  // 长期未命中衰减
  if (item.lastHitAt) {
    const days = (Date.now() - new Date(item.lastHitAt).getTime()) / 86_400_000;
    if (days > 90) base *= 0.7;
    else if (days > 30) base *= 0.9;
  }

  return Math.min(1, base);
}

/**
 * 批量评分 + 排序 + 截断 + 过滤最低阈值。
 * @param items 待评项目
 * @param query 查询串
 * @param opts 选项
 * @returns 按 score 降序排列的 (item, score) 数组
 */
export function rankMatches<T extends MatchInput>(
  items: T[],
  query: string,
  opts?: {
    limit?: number;
    threshold?: number;
  }
): Array<{ item: T; score: number }> {
  const limit = opts?.limit ?? 5;
  const threshold = opts?.threshold ?? 0.15;

  const scored: Array<{ item: T; score: number }> = [];
  for (const item of items) {
    const s = matchScore(item, query);
    if (s >= threshold) scored.push({ item, score: s });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // 同分:pinned 优先
    const ap = a.item.pinned ? 1 : 0;
    const bp = b.item.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return 0;
  });

  return scored.slice(0, limit);
}
