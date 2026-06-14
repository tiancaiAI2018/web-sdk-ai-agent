# AI Agent SDK 能力扩展规划

> 基于现有架构（SSE 流式 + 工具挂起/恢复 + 字典级联 + 审计 + JWT 认证），
> 发散思考 SDK 还能提供哪些企业真实有用或有趣的扩展能力。

---

## 一、企业刚需类

### 1. 多轮审批流工具 `approvalTool`

**场景**：录单后不是直接提交，而是需要主管审批。AI 填完表单 → 触发审批工具 → 审批人在浮窗里点"同意/驳回" → AI 继续流转。

**为什么有价值**：企业里几乎所有操作都有审批环节，纯"提交"只是最简单的情况。审批是工具挂起/恢复机制的自然延伸——当前 `TOOL_SUSPENDED` 等的是 SDK onCall 结果，审批等的是**另一个人**的结果。

**实现思路**：

- 后端新增 `ApprovalRequest` 表（id / sessionId / toolUseId / approver / status / comment / createdAt）
- SDK 新增 `approvalTool`，onCall 时弹出审批卡（不是自动执行），等待回调
- 审批人通过管理端或另一个 SDK 实例调用 `/approval/{id}/approve` 接口
- 后端收到审批结果后，用现有的 `sessions.resume()` 恢复 agent
- 审批超时自动驳回（可配置 TTL）

**与现有架构的关系**：

```
用户: "帮我录一单，5台小米14手机"
  → AI 调 query_dict 查编码
  → AI 调 submit_order 填表单
  → AI 调 request_approval 发起审批（TOOL_SUSPENDED）
  → 审批人在管理端点"同意"
  → 后端 resume(agent) → AI 回复"订单已审批通过，单号 ORD-2024-001"
```

**优先级**：P1

---

### 2. 操作确认与回滚工具 `confirmTool` / `undoTool`

**场景**：AI 删了 10 条数据，用户说"撤回"。当前工具执行是单向的，没有 undo 概念。

**实现思路**：

- 每个工具的 onCall 返回值里加 `undoToken`（后端生成，带操作快照）
- SDK 缓存 undoToken 列表，用户说"撤回"时 AI 调 `undo_tool`，传 undoToken
- 后端根据快照反向操作（或标记删除/恢复）
- undoToken 有 TTL（如 5 分钟内可撤回），过期失效

**风险点**：并非所有操作都可逆（如已发货的订单），需要业务层标记 `reversible: true/false`。

**优先级**：P3（复杂度高，生产环境需慎重）

---

### 3. ~~上下文感知的智能提示 `contextHintTool`~~ → ✅ 已实现为「页面感知 Page Awareness」(v5)

> **v5 实现说明**:原方案的 `provideContext()` API 已扩展为完整的页面感知系统。
> 不仅支持手动注入上下文，还能自动捕获宿主页面的 JS 异常、HTTP 错误、UI 错误弹窗，
> 通过双通道(消息前缀 + `get_page_errors` 虚拟工具)注入给 AI。
> 详见 `web-sdk/docs/sdk-api.md` 页面感知章节。

**原方案场景**：用户打开一个已有订单页面，AI 自动感知当前页面状态，主动提示"这个订单还差收货地址，需要补全吗？"

**实现思路**：

- SDK 新增 `provideContext(context)` API，宿主页面把当前表单状态/URL/用户身份注入
- 后端在 system prompt 里拼接上下文："当前页面是订单详情页，订单号 ORD-2024-001，状态=待审批"
- AI 基于上下文主动建议，而不是等用户描述

**示例调用**：

```javascript
agent.provideContext({
  page: 'order-detail',
  orderId: 'ORD-2024-001',
  status: 'pending_approval',
  missingFields: ['shippingAddress', 'urgencyCode'],
  userRole: 'sales'
});
```

**为什么改动最小收益最大**：不需要新增后端接口，只需在 `_sendUserMessage` 时把 context 拼到消息体，后端 ChatController 把它注入 system prompt。

**优先级**：P0

---

### 4. 批量操作工具 `batchTool`

**场景**：用户说"把北京仓库的所有待发货订单都改成加急"，需要批量操作。

**实现思路**：

- SDK 新增 `batchTool` 工厂，接受一个单条操作工具 + 批量查询接口
- AI 先调查询拿到列表，再逐条（或分批）调单条工具
- 关键：批量操作需要进度反馈（"已完成 3/10"），利用现有 SSE 流式能力
- 后端新增 `/batch` 接口，接受操作类型 + 过滤条件 + 操作参数

**安全考虑**：批量操作必须加确认步骤（"即将修改 47 条记录，确认？"），防止误操作。

**优先级**：P2

---

## 二、有意思 / 创新类

### 5. 多 Agent 协作 `delegateTool`

**场景**：录单助手遇到法律条款问题，自动"转接"给法务 Agent；法务 Agent 回复后，录单助手继续。

**为什么有意思**：当前是单 Agent + 工具模式。但企业里不同领域有不同专家，让 Agent 之间能"对话"比把所有能力塞一个 prompt 更灵活。

**实现思路**：

- 后端新增 `delegate` 工具类型，参数是 `{targetAgent: "legal", question: "..."}`
- 后端创建临时 session 给目标 Agent，把问题发过去，拿到回复后作为工具结果返回
- SDK 侧无感知，只是 onCall 返回变慢了（等另一个 Agent 思考）
- 多 Agent 协作链路：销售 Agent → 法务 Agent → 财务 Agent → 回到销售 Agent

**架构图**：

```
用户 ←→ 销售Agent(session-A)
              ↓ delegate(question, target="legal")
         法务Agent(session-B)
              ↓ 回复
         销售Agent(session-A) 继续
```

**优先级**：P2（架构优雅，但复杂度高，适合二期）

---

### 6. 记忆与学习 `memoryTool`

**场景**：用户每次都说"我在北京"，AI 应该记住这个偏好，下次自动填。

**实现思路**：

- SDK 新增 `memoryTool`，AI 主动调 `save_memory(key, value)` 和 `recall_memory(key)`
- 后端用 `UserPreference` 表存储（userId + key + value + ttl）
- 下次会话开始时，后端在 system prompt 里注入："该用户偏好：城市=北京, 付款方式=银行转账"
- 偏好可设 TTL（如"这次会话记住"= 1小时，"以后都记住"= 永久）

**数据库设计**：

```sql
CREATE TABLE user_preference (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id   VARCHAR(64)  NOT NULL,
  pref_key  VARCHAR(128) NOT NULL,
  pref_value TEXT,
  ttl       BIGINT,           -- 过期时间戳(毫秒), NULL=永不过期
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, pref_key)
);
```

**优先级**：P1

---

### 7. 语音输入 `voiceTool`

**场景**：仓库工人戴手套不方便打字，直接语音说"录一单，5台小米14手机，发北京仓"。

**实现思路**：

- SDK 集成 Web Speech API（浏览器原生，零依赖）
- 浮窗输入框旁加麦克风按钮，长按录音 → 语音转文字 → 填入输入框 → 自动发送
- 后端无需改动，语音转文字在浏览器端完成
- 兼容性：Chrome/Edge 完整支持，Safari 部分支持，Firefox 不支持

**交互设计**：

```
[输入框] [🎤按钮] [发送按钮]
         ↓ 长按
[输入框: 正在听...] [●录音中] [发送按钮]
         ↓ 松开
[输入框: 录一单5台小米14手机发北京仓] [发送按钮]
```

**优先级**：P1

---

### 8. 表单校验工具 `validateTool`

**场景**：AI 填完表单后，自动做业务规则校验（如"加急订单必须填加急原因"、"金额超 10 万需要审批"）。

**实现思路**：

- SDK 新增 `validateTool` 工厂，接受校验规则列表
- onCall 时在前端做即时校验（不依赖 AI），返回 `{valid: false, errors: ["加急订单需填写加急原因"]}`
- AI 看到错误后自动补充缺失字段，形成闭环
- 校验规则可动态配置，不硬编码

**规则定义示例**：

```javascript
agent.addEphemeralTools([AIAgent.validateTool({
  rules: [
    {
      field: 'urgencyCode',
      condition: (form) => form.urgencyCode === 'U02' || form.urgencyCode === 'U03',
      requires: ['notes'],
      message: '加急/特急订单必须填写加急原因'
    },
    {
      field: 'unitPrice',
      condition: (form) => form.unitPrice * form.quantity > 100000,
      requires: ['approvalCode'],
      message: '金额超过10万需要审批码'
    }
  ]
})]);
```

**优先级**：P0

---

### 9. 数据看板工具 `chartTool`

**场景**：用户问"这个月各仓库的订单量对比"，AI 直接在浮窗里画个柱状图。

**实现思路**：

- SDK 新增 `chartTool`，onCall 返回 `{type: "bar", data: [...]}`
- 浮窗内用轻量 SVG 渲染（不引入 ECharts 等重依赖）
- 后端提供聚合查询接口，AI 先查数据再调 chartTool 渲染
- 支持图表类型：bar / line / pie / table

**返回格式**：

```json
{
  "type": "bar",
  "title": "各仓库订单量",
  "labels": ["北京中心仓", "上海浦东仓", "广州白云仓"],
  "datasets": [{ "label": "订单量", "values": [156, 203, 89] }]
}
```

**优先级**：P3（锦上添花）

---

### 10. 快捷指令 `quickCommandTool`

**场景**：高频操作（如"录一单手机"）用户不想每次都打一长串，想设快捷指令。

**实现思路**：

- SDK 浮窗加 `/` 斜杠命令（类似 Notion/Slack），输入 `/phone` 自动展开为完整 prompt
- 用户可自定义指令映射，存 localStorage
- 后端无改动，纯前端体验优化
- 内置指令：`/new`（新会话）、`/clear`（清空）、`/help`（帮助）

**配置示例**：

```javascript
AIAgent.init({
  // ...
  quickCommands: [
    { name: '/phone',  description: '录手机订单', expandsTo: '帮我录一单手机，' },
    { name: '/urgent', description: '录加急订单', expandsTo: '帮我录一单加急订单，' },
    { name: '/check',  description: '查询订单状态', expandsTo: '帮我查询订单状态，单号是' }
  ]
});
```

**优先级**：P3（纯前端优化，随时可加）

---

## 三、优先级总览

| 优先级 | 方案 | 改动量 | 收益 | 理由 |
|--------|------|--------|------|------|
| ~~**P0**~~ | ~~3. 上下文感知~~ | ~~小~~ | ~~高~~ | ✅ **v5 已实现**:页面感知(Page Awareness),采集全局错误+网络错误+DOM弹窗,双通道注入 |
| **P0** | 8. 表单校验 | 中 | 高 | 录单场景刚需，防止 AI 填错数据进系统 |
| **P1** | 1. 审批流 | 大 | 高 | 企业刚需，现有 TOOL_SUSPENDED 机制天然支持 |
| **P1** | 6. 记忆学习 | 中 | 高 | 用户体验提升明显，实现简单 |
| **P1** | 7. 语音输入 | 小 | 中 | 仓库/车间场景刚需，浏览器原生支持 |
| **P2** | 5. 多 Agent | 大 | 高 | 架构优雅，但复杂度高，适合二期 |
| **P2** | 4. 批量操作 | 中 | 中 | 有用但边缘，可后做 |
| **P3** | 9. 数据看板 | 中 | 低 | 锦上添花 |
| **P3** | 2. 操作回滚 | 大 | 中 | 复杂度高，生产环境需慎重 |
| **P3** | 10. 快捷指令 | 小 | 低 | 纯前端优化，随时可加 |

---

## 四、技术依赖关系

```
✅ 上下文感知(v5 页面感知) ──────→ 所有工具都能用到上下文信息
    │
    ├──→ 表单校验（校验规则可依赖上下文）
    │
    ├──→ 记忆学习（偏好注入到上下文）
    │
    └──→ 审批流（审批人信息从上下文获取）

审批流 ──→ 操作回滚（审批驳回时需要回滚）

多Agent ──→ 审批流（审批人可以是另一个Agent）
```

建议按依赖关系从底层向上实现：~~上下文感知~~ ✅ → **表单校验** → 记忆学习 → 审批流 → 多Agent。
