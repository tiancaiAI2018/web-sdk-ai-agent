/**
 * 记忆工具工厂 —— saveMemoryTool + recallMemoryTool。
 *
 * <p>与 pageErrorsTool / changeSkinTool 同构:工厂函数返回 ToolDef,onCall 在客户端执行。
 *
 * <p>AI 调用流程:
 * <ol>
 *   <li>用户告知偏好(如"我在北京")→ AI 调 save_memory</li>
 *   <li>下次会话 AI 自动看到 [Memory Context] 里的 city=北京</li>
 *   <li>用户问"我之前提过什么仓库" → AI 调 recall_memory({query:"仓库"})</li>
 * </ol>
 */

import type { ToolDef } from './types';
import type { MemoryEngine } from './memory';

// ====================================================================
// save_memory
// ====================================================================

/**
 * save_memory 工具工厂。
 * 接受一个 MemoryEngine 引用(或兼容接口),返回 ToolDef。
 */
export function saveMemoryTool(engine: MemoryEngine): ToolDef {
  return {
    name: 'save_memory',
    description:
      '保存一条用户记忆到本地设备(不上传云端,仅当前浏览器)。\n' +
      '适用场景:\n' +
      '  - 用户主动要求"记住..."、"以后都..."、"我一般在..."\n' +
      '  - 告知个人偏好:城市、语言、常去仓库、付款方式\n' +
      '  - 提供常用信息:客户编码、联系电话、收件地址\n' +
      '  - 历史操作:刚录入的单号、常录的商品\n' +
      '记忆会在未来对话中自动被召回,无需用户重复说明。\n' +
      'category 可选:preference(偏好)/ fact(事实)/ history(历史)/ note(备注)。',
    parameters: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: '简短标识(英文 snake_case 优先),如 city / default_warehouse / customer_phone',
        },
        value: {
          type: 'string',
          description: '记忆内容,一句话描述清楚',
        },
        category: {
          type: 'string',
          enum: ['preference', 'fact', 'history', 'note'],
          description: '类别:preference=偏好 / fact=事实 / history=历史操作 / note=备注',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '可选标签,便于后续按标签召回,如 ["客户", "VIP"]',
        },
        pinned: {
          type: 'boolean',
          description: '是否置顶(重要记忆,每次对话都会注入给 AI)。默认 false。',
        },
      },
      required: ['key', 'value', 'category'],
    },
    strict: false,
    onCall: (args) => engine.saveFromTool(args as Record<string, unknown>),
  };
}

// ====================================================================
// recall_memory
// ====================================================================

/**
 * recall_memory 工具工厂。
 * 接受一个 MemoryEngine 引用(或兼容接口),返回 ToolDef。
 */
export function recallMemoryTool(engine: MemoryEngine): ToolDef {
  return {
    name: 'recall_memory',
    description:
      '模糊检索用户在本地设备上保存的历史记忆。\n' +
      '适用场景:\n' +
      '  - 用户说"还是上次那个..."、"我上次提过的..."、"我常用的..."\n' +
      '  - 需要了解用户的偏好、常用信息、过去操作过的内容\n' +
      '  - 主动个性化:录单前查询默认仓库/客户\n' +
      '示例:用户说"还是上次那个仓库" → recall_memory({query:"仓库", category:"preference"})\n' +
      '返回按相关性排序的记忆列表,支持类别过滤和标签过滤。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '查询关键词(支持模糊匹配,如"北京"会命中"BJ")',
        },
        category: {
          type: 'string',
          enum: ['preference', 'fact', 'history', 'note'],
          description: '按类别过滤。不传=全部。',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '标签过滤(OR 匹配,任意一个命中即可)',
        },
        limit: {
          type: 'number',
          description: '返回条数上限,默认 5',
        },
      },
      required: ['query'],
    },
    strict: false,
    onCall: (args) => engine.recallFromTool(args as Record<string, unknown>),
  };
}
