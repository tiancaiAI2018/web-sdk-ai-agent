/**
 * 快捷指令注册表 —— 纯 Map + 模糊搜索,无副作用。
 *
 * 设计目标:
 *   - 同名注册时后注册覆盖先注册(让用户的指令能覆盖内置指令)
 *   - 搜索复用 fuzzy.ts 的 fieldMatch(5 档评分)
 *   - 空 query 返回全部(按注册顺序),非空 query 按分降序,限制 10 条
 */

import { fieldMatch } from './fuzzy';
import type { QuickCommand } from './types';

/** 搜索返回的带分项 */
export interface CommandMatch {
  cmd: QuickCommand;
  /** 匹配分数 [0, 1],空 query 时固定 0(仅按注册顺序展示) */
  score: number;
}

const SEARCH_LIMIT = 10;

export class CommandRegistry {
  private _map = new Map<string, QuickCommand>();

  /**
   * 注册一组指令。同 name 时后注册的覆盖先注册的。
   * 单条 null/undefined 输入会被忽略。
   */
  register(cmds: QuickCommand[]): void {
    for (const cmd of cmds) {
      if (!cmd || !cmd.name) continue;
      this._map.set(cmd.name, cmd);
    }
  }

  /**
   * 注销指令。传空数组 = 注销所有。
   */
  unregister(names?: string[]): void {
    if (!names || names.length === 0) {
      this._map.clear();
      return;
    }
    for (const n of names) this._map.delete(n);
  }

  /**
   * 列出所有已注册指令(按注册顺序)。
   */
  list(): QuickCommand[] {
    return Array.from(this._map.values());
  }

  /**
   * 按 name 取单个指令(未找到返回 undefined)。
   */
  get(name: string): QuickCommand | undefined {
    return this._map.get(name);
  }

  /**
   * 模糊搜索。
   * - 空 query:返回全部,score=0,按注册顺序
   * - 非空 query:对每个 cmd 计算 score = max(fieldMatch(name), fieldMatch(label) * 0.9)
   *   过滤 score > 0,按分降序,截断到 SEARCH_LIMIT
   */
  search(query: string): CommandMatch[] {
    const all = this.list();
    if (!query) {
      return all.map((cmd) => ({ cmd, score: 0 }));
    }
    const q = query.toLowerCase();
    const scored: CommandMatch[] = [];
    for (const cmd of all) {
      const nameScore = fieldMatch(cmd.name, q);
      const labelScore = fieldMatch(cmd.label, q) * 0.9;
      const descScore = cmd.description ? fieldMatch(cmd.description, q) * 0.5 : 0;
      const score = Math.max(nameScore, labelScore, descScore);
      if (score > 0) scored.push({ cmd, score });
    }
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return 0;
    });
    return scored.slice(0, SEARCH_LIMIT);
  }

  /**
   * 当前已注册数量。
   */
  size(): number {
    return this._map.size;
  }
}
