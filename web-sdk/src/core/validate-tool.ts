/**
 * 表单校验工具工厂 validateTool()
 *
 * <p>在 AI 调用 submit_form 之前,主动跑一遍校验:失败时拿到具体错误列表,
 * 自动补字段后重试,形成完整闭环。
 *
 * <p>设计要点:
 * <ul>
 *   <li>纯前端执行,onCall 同步跑,零网络开销
 *   <li>5 种规则类型:required / pattern / range / enum / condition(跨字段依赖)
 *   <li>error + warning 双严重级,warning 不阻断提交但会出现在返回里
 *   <li>复用 ToolDef.onCall 机制,与 changeSkinTool / dictTool / pageErrorsTool 同构
 * </ul>
 *
 * <p>用法:
 * <pre>
 *   agent.persistentTools = [
 *     validateTool({
 *       rules: [
 *         { id: 'r-customer', required: 'customerName', message: '客户姓名不能为空' },
 *         { id: 'r-phone-fmt', pattern: {
 *             field: 'customerPhone', regex: /^1[3-9]\d{9}$/, message: '手机号格式不正确'
 *         }},
 *         { id: 'r-urgency-reason', message: '加急订单必须填写加急原因',
 *           condition: {
 *             when: f => f.urgencyCode === 'urgent',
 *             requires: ['urgencyReason'],
 *           }},
 *       ],
 *       fieldLabels: { customerName: '客户姓名', urgencyReason: '加急原因' },
 *       descriptionSuffix: '本工具用于订单录入场景,在 submit_form 之前必须调用。',
 *     })
 *   ];
 * </pre>
 */

import type { ToolDef } from './types';

// ====================================================================
// 类型定义
// ====================================================================

/** 校验严重级别:error 阻断提交,warning 仅提示 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * 单条校验规则。5 种规则类型(required / pattern / range / enum / condition)
 * 可以同时出现在一条规则里,引擎按顺序逐项执行,任一失败即命中。
 */
export interface ValidationRule<T = Record<string, unknown>> {
  /** 规则唯一标识,用于前端定位和 AI 引用 */
  id: string;
  /** 校验失败/警告时的默认提示 */
  message: string;
  /** 严重级别,默认 'error' */
  severity?: ValidationSeverity;

  /** 必填字段。字段值为空/undefined/空字符串时失败 */
  required?: string;
  /** 正则校验。字段值不匹配时失败 */
  pattern?: {
    field: string;
    regex: RegExp | string;
    message?: string;
  };
  /** 数值区间。字段值不在 [min, max] 时失败(任一边界可选) */
  range?: {
    field: string;
    min?: number;
    max?: number;
    message?: string;
  };
  /** 枚举校验。字段值不在列表里时失败 */
  enum?: {
    field: string;
    values: Array<string | number>;
    message?: string;
  };
  /**
   * 跨字段依赖。when 返回 true 时激活:
   *  - 有 requires → 这些字段必须非空
   *  - 有 check    → check 函数必须返回 true / 字符串(字符串覆盖默认 message)
   */
  condition?: {
    when: (form: T) => boolean;
    requires?: string[];
    check?: (form: T) => boolean | string;
  };
}

/** 单条校验失败 */
export interface ValidationError {
  ruleId: string;
  /** 关联字段(可选,跨字段规则可能没有单一 field) */
  field?: string;
  message: string;
  severity: ValidationSeverity;
}

/** 一次校验的完整结果 */
export interface ValidationResult {
  /** 所有 error 级规则是否全部通过 */
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  /** 通过的规则数(便于 AI 感知进度) */
  passedCount: number;
}

/** validateTool() 工厂入参 */
export interface ValidateToolOptions<T = Record<string, unknown>> {
  /** 规则列表(必填) */
  rules: ValidationRule<T>[];
  /**
   * 字段名 → 中文标签映射,用于 AI 可读的错误消息。
   * 如 'urgencyReason' → '加急原因'
   */
  fieldLabels?: Record<string, string>;
  /**
   * 自定义工具名,默认 'validate_form'。
   * 若宿主已有同名工具,可改为 'validate_order' 等。
   */
  toolName?: string;
  /**
   * 工具描述补充。会追加到默认描述后面,告诉 AI 何时该调本工具。
   * 建议包含业务背景,如 "这是订单录入的校验工具,submit_form 之前必须调用"。
   */
  descriptionSuffix?: string;
}

// ====================================================================
// 规则引擎(纯函数)
// ====================================================================

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function getFieldValue(form: Record<string, unknown>, field: string): unknown {
  return form[field];
}

function toRegex(r: RegExp | string): RegExp {
  return r instanceof RegExp ? r : new RegExp(r);
}

/**
 * 跑一遍规则,返回完整结果。纯函数,无副作用。
 * 每条规则独立执行,即使前面的规则失败也不影响后面的规则。
 */
export function runValidation<T extends Record<string, unknown>>(
  rules: ValidationRule<T>[],
  form: T
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  let passedCount = 0;

  for (const rule of rules) {
    const sev: ValidationSeverity = rule.severity || 'error';
    const bucket = sev === 'error' ? errors : warnings;
    let failed: { field?: string; message: string } | null = null;

    // 1. required
    if (rule.required && !failed) {
      if (isEmpty(getFieldValue(form as Record<string, unknown>, rule.required))) {
        failed = { field: rule.required, message: rule.message };
      }
    }

    // 2. pattern
    if (rule.pattern && !failed) {
      const val = getFieldValue(form as Record<string, unknown>, rule.pattern.field);
      if (!isEmpty(val)) {
        const re = toRegex(rule.pattern.regex);
        if (!re.test(String(val))) {
          failed = {
            field: rule.pattern.field,
            message: rule.pattern.message || rule.message,
          };
        }
      }
    }

    // 3. range
    if (rule.range && !failed) {
      const val = getFieldValue(form as Record<string, unknown>, rule.range.field);
      if (!isEmpty(val)) {
        const num = Number(val);
        if (Number.isFinite(num)) {
          const tooSmall = rule.range.min !== undefined && num < rule.range.min;
          const tooLarge = rule.range.max !== undefined && num > rule.range.max;
          if (tooSmall || tooLarge) {
            failed = {
              field: rule.range.field,
              message: rule.range.message || rule.message,
            };
          }
        }
      }
    }

    // 4. enum
    if (rule.enum && !failed) {
      const val = getFieldValue(form as Record<string, unknown>, rule.enum.field);
      if (!isEmpty(val) && rule.enum.values.indexOf(val as string | number) < 0) {
        failed = {
          field: rule.enum.field,
          message: rule.enum.message || rule.message,
        };
      }
    }

    // 5. condition(跨字段依赖)
    if (rule.condition && !failed) {
      let whenOk = false;
      try {
        whenOk = rule.condition.when(form);
      } catch {
        whenOk = false;
      }
      if (whenOk) {
        // 5a. requires 必须全部非空
        if (rule.condition.requires && rule.condition.requires.length > 0) {
          const missing = rule.condition.requires.filter((f) =>
            isEmpty(getFieldValue(form as Record<string, unknown>, f))
          );
          if (missing.length > 0) {
            failed = { field: missing[0], message: rule.message };
          }
        }
        // 5b. check 函数
        if (!failed && rule.condition.check) {
          let result: boolean | string = false;
          try {
            result = rule.condition.check(form);
          } catch (e) {
            result = (e as Error).message || 'check 执行异常';
          }
          if (result !== true) {
            failed = {
              message: typeof result === 'string' && result ? result : rule.message,
            };
          }
        }
      }
    }

    if (failed) {
      bucket.push({
        ruleId: rule.id,
        field: failed.field,
        message: failed.message,
        severity: sev,
      });
    } else {
      passedCount++;
    }
  }

  return { valid: errors.length === 0, errors, warnings, passedCount };
}

// ====================================================================
// 工厂函数
// ====================================================================

/**
 * 表单校验工具工厂 — 返回一个 validate_form ToolDef。
 *
 * <p>AI 调用流程:
 * <ol>
 *   <li>用户描述需求,AI 收集字段</li>
 *   <li>AI 调 validate_form({ formData })</li>
 *   <li>valid=true → 调 submit_form 提交</li>
 *   <li>valid=false → 根据 errors 列表追问用户补字段,再调 validate_form 重试</li>
 * </ol>
 */
export function validateTool<T extends Record<string, unknown> = Record<string, unknown>>(
  opts: ValidateToolOptions<T>
): ToolDef {
  const name = opts.toolName || 'validate_form';
  const labels = opts.fieldLabels || {};
  const rules = opts.rules || [];

  // 从 rules 中提取所有出现的字段名,用于 JSON Schema 的 properties
  const fieldNames = new Set<string>();
  for (const r of rules) {
    if (r.required) fieldNames.add(r.required);
    if (r.pattern?.field) fieldNames.add(r.pattern.field);
    if (r.range?.field) fieldNames.add(r.range.field);
    if (r.enum?.field) fieldNames.add(r.enum.field);
    if (r.condition?.requires) {
      for (const f of r.condition.requires) fieldNames.add(f);
    }
  }

  const properties: Record<string, unknown> = {};
  fieldNames.forEach((f) => {
    properties[f] = {
      type: 'string',
      description: labels[f] || f,
    };
  });

  const description =
    `校验表单数据。在调用 submit_form 之前必须调用本工具,确保数据合法。\n` +
    `传入所有已收集的字段(放在 formData 对象里),返回校验结果:\n` +
    `  - valid=true → 可调 submit_form 提交\n` +
    `  - valid=false → errors 数组列出问题字段和原因,请补全或修正后重试\n` +
    `  - warnings 不阻断提交但建议告知用户\n` +
    (opts.descriptionSuffix ? '\n' + opts.descriptionSuffix : '');

  return {
    name,
    description,
    parameters: {
      type: 'object',
      properties: {
        formData: {
          type: 'object',
          description: '待校验的表单数据(字段名 → 值)',
          properties,
          additionalProperties: true,
        },
      },
      required: ['formData'],
    },
    strict: false,
    onCall: (args) => {
      const formData = ((args as { formData?: T }).formData || {}) as T;
      const result = runValidation(rules, formData);

      const labelize = (field?: string) =>
        field ? labels[field] || field : undefined;

      if (result.valid && result.warnings.length === 0) {
        return {
          ok: true,
          valid: true,
          errors: [],
          warnings: [],
          passedCount: result.passedCount,
          message: `校验通过,共 ${result.passedCount} 条规则全部命中,可以提交。`,
        };
      }

      const errLines = result.errors.map((e) => {
        const label = labelize(e.field) || e.ruleId;
        return `  - [${label}] ${e.message}`;
      });
      const warnLines = result.warnings.map((w) => {
        const label = labelize(w.field) || w.ruleId;
        return `  - [警告:${label}] ${w.message}`;
      });

      return {
        ok: result.valid,
        valid: result.valid,
        passedCount: result.passedCount,
        errors: result.errors.map((e) => ({ ...e, fieldLabel: labelize(e.field) })),
        warnings: result.warnings.map((w) => ({ ...w, fieldLabel: labelize(w.field) })),
        message:
          (result.valid ? '校验通过但有警告。' : '校验失败,请修正以下问题:') +
          '\n' +
          errLines.concat(warnLines).join('\n'),
      };
    },
  };
}
