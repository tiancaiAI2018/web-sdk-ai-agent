import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * React 接入 demo —— Vite 配置
 *
 * alias:
 *   'aiagent-sdk'         → ../../web-sdk/src/index.ts    (核心)
 *   'aiagent-sdk/react'   → ../../web-sdk/src/adapters/react.tsx
 *
 * 这样 dev 时改 web-sdk/src 任何文件,HMR 立即反映到本页。
 * 不必先 npm run build 一次。
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // 必须先匹配更长的 key,否则 'aiagent-sdk' 会把 'aiagent-sdk/react' 的前缀吃掉
      {
        find: /^aiagent-sdk\/react$/,
        replacement: resolve(__dirname, '../../web-sdk/src/adapters/react.tsx'),
      },
      {
        find: /^aiagent-sdk$/,
        replacement: resolve(__dirname, '../../web-sdk/src/index.ts'),
      },
    ],
  },
  server: {
    port: 5173,
    open: true,
  },
});
