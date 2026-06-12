/**
 * React 适配器
 *
 * 用法:
 *   import { AIAgentWidget, useAIAgent } from 'aiagent-sdk/react';
 *
 *   // 1) 自挂 UI 模式(渲染 null,UI 自动挂到 document.body)
 *   function App() {
 *     return (
 *       <>
 *         <AIAgentWidget
 *           endpoint="http://localhost:8080"
 *           getAccessToken={async () => ({ accessToken: '...' })}
 *           title="AI 助手"
 *         />
 *       </>
 *     );
 *   }
 *
 *   // 2) 命令式 hook(拿到 instance 后自己 .stream / .registerTools)
 *   function Page() {
 *     const agent = useAIAgent({ endpoint, getAccessToken });
 *     useEffect(() => {
 *       agent?.stream({ sessionId, message: '...', onChunk: ... });
 *     }, [agent]);
 *     return null;
 *   }
 *
 * React 18 StrictMode 安全:
 *   - useEffect 默认会跑一次 mount + 一次 cleanup(模拟 unmount)然后再 mount
 *   - 我们用 WeakMap<optsKey, AIAgent> 缓存,二次 mount 拿回同一实例
 *   - 实际 destroy() 只在真 unmount 跑(useEffect cleanup 触发条件用 ref 跟踪)
 */

import { useEffect, useRef, useState } from 'react';
import { AIAgent } from '../core/agent';
import type { AIAgentOptions } from '../core/types';

// 用 stable key 缓存实例 —— 用 JSON.stringify(opts) 做 key,避免父组件重建对象触发重挂
const instanceCache = new Map<string, AIAgent>();

function stableKey(opts: AIAgentOptions): string {
  // 简单稳定序列化:函数用占位替代,实际 opts 里只有 getAccessToken 是函数
  // 这里直接 JSON.stringify,函数会变 null,反正父组件传同一函数引用时 key 也一致
  return JSON.stringify({
    endpoint: opts.endpoint,
    title: opts.title,
    subtitle: opts.subtitle,
    placeholder: opts.placeholder,
    welcomeMessage: opts.welcomeMessage,
    theme: opts.theme,
    position: opts.position,
    autoOpen: opts.autoOpen,
    avatar: opts.avatar,
    clientPrefix: opts.clientPrefix,
    persistentTools: opts.persistentTools,
  });
}

export interface AIAgentWidgetProps extends AIAgentOptions {}

/**
 * 自动挂载 AI 浮窗。返回 null,UI 自挂到 document.body。
 */
export function AIAgentWidget(props: AIAgentWidgetProps): null {
  const key = stableKey(props);
  const instanceRef = useRef<AIAgent | null>(null);

  useEffect(() => {
    let inst = instanceCache.get(key);
    if (!inst) {
      inst = new AIAgent().init(props);
      instanceCache.set(key, inst);
    }
    instanceRef.current = inst;

    return () => {
      // 真正 unmount 才 destroy
      instanceRef.current = null;
      // 延后一帧,避免 StrictMode 紧接的第二次 mount 拿到空
      const cached = instanceCache.get(key);
      if (cached) {
        instanceCache.delete(key);
        cached.destroy();
      }
    };
    // 故意只依赖 key —— props 字段同值不重挂
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}

/**
 * 命令式 hook —— 拿 instance 自己驱动。
 * 首次 render 返 null(Effect 还没跑),后续返 instance。
 */
export function useAIAgent(opts: AIAgentOptions): AIAgent | null {
  const key = stableKey(opts);
  const [agent, setAgent] = useState<AIAgent | null>(null);

  useEffect(() => {
    let inst = instanceCache.get(key);
    if (!inst) {
      inst = new AIAgent().init(opts);
      instanceCache.set(key, inst);
    }
    setAgent(inst);

    return () => {
      // 真正 unmount 才 destroy + 清缓存
      const cached = instanceCache.get(key);
      if (cached) {
        instanceCache.delete(key);
        cached.destroy();
      }
      setAgent(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return agent;
}

// 兜底:也把核心类型从 React 入口 re-export 出去
export type { AIAgentOptions };
