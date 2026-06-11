/**
 * Vite 库模式 ESM 构建:
 *   - 入口 1: src/index.ts          → dist/ai-agent-sdk.esm.js  +  dist/index.d.ts
 *   - 入口 2: src/adapters/react.tsx → dist/react.esm.js        +  dist/react.d.ts
 *
 * 第三方通过 `import { AIAgent } from 'aiagent-sdk'` 与
 *      `import { AIAgentWidget, useAIAgent } from 'aiagent-sdk/react'` 消费。
 *
 * UMD 走 vite.config.umd.ts(单入口,UMD 模式一次只能一个 entry)。
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/adapters/vue.ts', 'src/**/adapters/umd.ts'],
      insertTypesEntry: true,
      copyDtsFiles: true,
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        react: resolve(__dirname, 'src/adapters/react.tsx'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: (id: string) =>
        id === 'react' ||
        id === 'react-dom' ||
        id === 'react/jsx-runtime',
      output: {
        globals: (id: string) => {
          if (id === 'react' || id === 'react/jsx-runtime') return 'React';
          if (id === 'react-dom') return 'ReactDOM';
          return id;
        },
        entryFileNames: (chunkInfo) => {
          // chunkInfo.name 是 entry key: 'index' | 'react'
          if (chunkInfo.name === 'index') return 'ai-agent-sdk.esm.js';
          return `${chunkInfo.name}.esm.js`;
        },
        chunkFileNames: '_chunks/[name]-[hash].js',
        assetFileNames: '[name][extname]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  },
});
