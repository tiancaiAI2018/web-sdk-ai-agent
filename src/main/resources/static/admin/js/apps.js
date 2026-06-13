/**
 * 应用管理页面模块
 */
const apps = {
    title: '应用管理',

    async render(container) {
        container.innerHTML = `
            <div class="toolbar">
                <h4>已注册的第三方应用</h4>
                <button class="btn-sm btn-primary" onclick="apps.showCreateModal()" style="background:var(--primary);color:#fff;border-color:var(--primary)">+ 新建应用</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>名称</th>
                        <th>允许来源</th>
                        <th>状态</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="appsTableBody">
                    <tr><td colspan="6" style="text-align:center;color:var(--text-muted)">加载中...</td></tr>
                </tbody>
            </table>
        `;
        await apps.loadList();
    },

    async loadList() {
        try {
            const list = await AdminAPI.apps.list();
            const tbody = document.getElementById('appsTableBody');
            if (!list.length) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">暂无应用</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(app => `
                <tr>
                    <td><code>${app.clientId}</code></td>
                    <td>${app.name || '-'}</td>
                    <td>${app.allowedOrigin || '*'}</td>
                    <td><span class="badge ${app.enabled ? 'badge-enabled' : 'badge-disabled'}">${app.enabled ? '启用' : '禁用'}</span></td>
                    <td>${app.createdAt ? new Date(app.createdAt).toLocaleString('zh-CN') : '-'}</td>
                    <td class="actions">
                        <button class="btn-sm" onclick="apps.toggleEnabled('${app.clientId}', ${!app.enabled})">${app.enabled ? '禁用' : '启用'}</button>
                        <button class="btn-sm btn-warning" onclick="apps.rotateSecret('${app.clientId}')">轮换密钥</button>
                        <button class="btn-sm btn-danger" onclick="apps.deleteApp('${app.clientId}')">删除</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            showToast('加载应用列表失败: ' + e.message, 'error');
        }
    },

    showCreateModal() {
        openModal('新建第三方应用', `
            <div class="form-group">
                <label>应用名称</label>
                <input type="text" id="newAppName" placeholder="如: ERP系统" required>
            </div>
            <div class="form-group">
                <label>Client ID (可选,留空自动生成)</label>
                <input type="text" id="newAppClientId" placeholder="如: erp-system">
            </div>
            <div class="form-group">
                <label>允许的来源 (CORS,可选)</label>
                <input type="text" id="newAppOrigin" placeholder="如: https://erp.example.com">
            </div>
            <button class="btn-primary" onclick="apps.createApp()">创建</button>
        `);
    },

    async createApp() {
        const name = document.getElementById('newAppName').value.trim();
        if (!name) { showToast('请输入应用名称', 'error'); return; }
        try {
            const result = await AdminAPI.apps.create({
                name,
                clientId: document.getElementById('newAppClientId').value.trim() || undefined,
                allowedOrigin: document.getElementById('newAppOrigin').value.trim() || undefined
            });
            closeModal();
            // 显示 clientId + clientSecret
            openModal('应用创建成功', `
                <p>应用 <strong>${result.name}</strong> 已创建。</p>
                <div class="secret-display">
                    <div>Client ID: <strong>${result.clientId}</strong></div>
                    <div>Client Secret: <strong>${result.clientSecret}</strong></div>
                </div>
                <p class="secret-warning">⚠️ ${result.warning}</p>
                <button class="btn-primary" onclick="closeModal()" style="margin-top:12px">我已保存</button>
            `);
            await apps.loadList();
        } catch (e) {
            showToast('创建失败: ' + e.message, 'error');
        }
    },

    async toggleEnabled(clientId, enable) {
        try {
            await AdminAPI.apps.update(clientId, { enabled: enable });
            showToast(enable ? '已启用' : '已禁用', 'success');
            await apps.loadList();
        } catch (e) {
            showToast('操作失败: ' + e.message, 'error');
        }
    },

    async rotateSecret(clientId) {
        if (!confirm('确定要轮换 ' + clientId + ' 的密钥?旧密钥将立即失效!')) return;
        try {
            const result = await AdminAPI.apps.rotateSecret(clientId);
            openModal('密钥已轮换', `
                <p>应用 <strong>${clientId}</strong> 的新密钥:</p>
                <div class="secret-display">${result.clientSecret}</div>
                <p class="secret-warning">⚠️ ${result.warning}</p>
                <button class="btn-primary" onclick="closeModal()" style="margin-top:12px">我已保存</button>
            `);
        } catch (e) {
            showToast('轮换失败: ' + e.message, 'error');
        }
    },

    async deleteApp(clientId) {
        if (!confirm('确定要删除应用 ' + clientId + '?此操作不可恢复!')) return;
        try {
            await AdminAPI.apps.delete(clientId);
            showToast('已删除', 'success');
            await apps.loadList();
        } catch (e) {
            showToast('删除失败: ' + e.message, 'error');
        }
    }
};
