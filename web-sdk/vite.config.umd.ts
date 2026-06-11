/**
 * Vite 库模式 UMD 构建 —— 单入口(src/adapters/umd.ts)
 * 产物 dist/ai-agent-sdk.umd.js → 后续由 postBuild 钩子复制到
 *   src/main/resources/static/sdk/ai-agent-sdk.js(覆盖同名老文件,host-page.html URL 不变)
 */
import { defineConfig, type PluginOption } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, mkdirSync, existsSync, statSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyUmdToSpringStatic(): PluginOption {
  return {
    name: 'copy-umd-to-spring-static',
    closeBundle() {
      const umdSrc = resolve(__dirname, 'dist/ai-agent-sdk.umd.js');
      const umdDest = resolve(
        __dirname,
        '../src/main/resources/static/sdk/ai-agent-sdk.js'
      );
      if (!existsSync(umdSrc)) {
        console.warn('[vite.config.umd] UMD bundle not found at', umdSrc);
        return;
      }
      mkdirSync(resolve(umdDest, '..'), { recursive: true });
      copyFileSync(umdSrc, umdDest);
      const size = statSync(umdDest).size;
      console.log(
        `[vite.config.umd] UMD bundle copied: ${umdDest} (${(size / 1024).toFixed(1)} KB)`
      );
    },
  };
}

export default defineConfig({
  plugins: [copyUmdToSpringStatic()],
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/adapters/umd.ts'),
      name: 'AIAgent',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        // UMD 单入口,直接命名
        entryFileNames: 'ai-agent-sdk.umd.js',
        assetFileNames: '[name][extname]',
        // 只 export default,UMD 全局直接拍平 default 的属性,
        // 让 window.AIAgent.init(...) 老 API 直接可调
        exports: 'default',
      },
    },
    outDir: 'dist',
    // 不清空 dist —— build:esm 阶段已生成 ai-agent-sdk.esm.js + .d.ts,
    // UMD 只是追加 ai-agent-sdk.umd.js
    emptyOutDir: false,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  },
});
