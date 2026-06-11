/**
 * React 接入 demo —— 演示用 ESM 模式(import)消费 aiagent-sdk
 *
 * 关键接入代码:
 *   import { AIAgentWidget } from 'aiagent-sdk/react';
 *   <AIAgentWidget endpoint="..." getAccessToken={...} />
 *
 * 浮窗会自动挂到 document.body,React 组件本身 return null。
 */
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AIAgentWidget } from 'aiagent-sdk/react';

function App() {
  return (
    <>
      <h1>React 接入 demo (v5 IRIDESCENT BLOOM)</h1>
      <p>
        本页面演示 <strong>React + ESM 模式</strong>接入 SDK。右下角的 🌈 虹彩核心气泡
        由 <code>&lt;AIAgentWidget/&gt;</code> 自动渲染 —— React 组件本身 <code>return null</code>,
        浮窗由 SDK 内部挂到 <code>document.body</code>。主题:<code>ink</code>(OLED 黑底 + 虹彩油彩)。
      </p>

      <div className="form-area">
        <h3>订单录入区(SDK 智能录单会把字段填到这里)</h3>
        <div className="form-grid">
          <label>订单号</label>
          <input id="f-orderId" data-field="orderId" />
          <label>客户姓名</label>
          <input id="f-customerName" data-field="customerName" />
          <label>联系电话</label>
          <input id="f-customerPhone" data-field="customerPhone" />
          <label>商品清单</label>
          <input id="f-items" data-field="items" />
          <label>总金额</label>
          <input id="f-totalAmount" data-field="totalAmount" />
          <label>备注</label>
          <input id="f-notes" data-field="notes" />
        </div>
      </div>

      <h3>接入代码(2 行)</h3>
      <pre><code>{`import { AIAgentWidget } from 'aiagent-sdk/react';

<AIAgentWidget
  endpoint="http://localhost:8080"
  getAccessToken={async () => {
    const r = await fetch('http://localhost:7000/api/ai-token', { method: 'POST' });
    return await r.json();
  }}
  title="AI 助手"
  theme="light"
  demoTools
/>`}</code></pre>

      {/* React 18 StrictMode 安全:SDK 内部用 WeakMap 缓存实例,二次 mount 拿回同一对象 */}
      <AIAgentWidget
        endpoint="http://localhost:8080"
        getAccessToken={async () => {
          const r = await fetch('http://localhost:7000/api/ai-token', {
            method: 'POST',
          });
          if (!r.ok) throw new Error('mock 后端换 token 失败: ' + r.status);
          return await r.json();
        }}
        title="AI 助手"
        subtitle="Iridescent Bloom"
        welcomeMessage={'你好!我是 AI 助手(IRIDESCENT BLOOM 主题)。可以直接跟我聊天,或点浮窗右上角 ⊕ 按钮开启"录单模式"。凑齐字段后我会调 submit_form 把数据推到本页面的订单表单。'}
        placeholder="输入消息,Enter 发送,Shift+Enter 换行"
        theme="ink"
        position="bottom-right"
        clientPrefix="react-demo"
        demoTools
        demoOrderTools={[
          {
            name: 'submit_form',
            description: 'Submit collected order fields. Call only when all required fields are confirmed.',
            parameters: {
              type: 'object',
              properties: {
                orderId:       { type: 'string',  description: '订单编号' },
                customerName:  { type: 'string',  description: '客户全名' },
                customerPhone: { type: 'string',  description: '11 位手机号' },
                items:         { type: 'string',  description: '商品清单' },
                totalAmount:   { type: 'number',  description: '订单总金额' },
                notes:         { type: 'string',  description: '其他备注' },
              },
              required: ['orderId', 'customerName', 'items', 'totalAmount'],
            },
            strict: true,
            onCall: (payload: Record<string, unknown>) => {
              // React demo 的字段回填逻辑
              Object.keys(payload).forEach((k) => {
                const el = document.querySelector(
                  `[data-field="${k}"]`
                ) as HTMLInputElement | null;
                if (el) {
                  el.value = String(payload[k] ?? '');
                  el.classList.add('filled');
                  setTimeout(() => el.classList.remove('filled'), 1500);
                }
              });
              return (
                '订单 ' +
                (payload.orderId || '(未填)') +
                ' 已提交到本系统,字段: ' +
                Object.keys(payload).join(', ')
              );
            },
          },
        ]}
      />
    </>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
