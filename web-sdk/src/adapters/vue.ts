/**
 * Vue 适配器 —— 占位
 *
 * 等后续需求:提供 `app.use(AIAgentVue, { endpoint, getAccessToken })` 形态的 Vue 3 插件。
 * 当前 throw 让误用者立刻看到错误,而不是默默失败。
 */

export const AIAgentVue = {
  install(): void {
    throw new Error(
      '[AIAgent SDK] Vue adapter is not yet implemented. Use the React adapter or the UMD script tag for now.'
    );
  },
};

export default AIAgentVue;
