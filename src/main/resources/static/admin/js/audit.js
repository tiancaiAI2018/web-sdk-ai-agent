/**
 * 审计日志页面模块
 */
const audit = {
    title: '审计日志',

    async render(container) {
        container.innerHTML = `
            <div class="toolbar">
                <h4>最近操作记录</h4>
                <button class="btn-sm" onclick="audit.loadList()">刷新</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>时间</th><th>事件</th><th>Client ID</th><th>IP</th><th>详情</th></tr>
                </thead>
                <tbody id="auditTableBody">
                    <tr><td colspan="6" style="text-align:center;color:var(--text-muted)">加载中...</td></tr>
                </tbody>
            </table>
        `;
        await audit.loadList();
    },

    async loadList() {
        try {
            const list = await AdminAPI.audit.list(100);
            const tbody = document.getElementById('auditTableBody');
            if (!list.length) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">暂无记录</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(a => `
                <tr>
                    <td>${a.id}</td>
                    <td style="white-space:nowrap">${a.createdAt ? new Date(a.createdAt).toLocaleString('zh-CN') : '-'}</td>
                    <td><code>${a.eventType}</code></td>
                    <td><code>${a.clientId || '-'}</code></td>
                    <td>${a.ip || '-'}</td>
                    <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(a.detail || '').replace(/"/g, '&quot;')}">${a.detail || '-'}</td>
                </tr>
            `).join('');
        } catch (e) { showToast('加载失败: ' + e.message, 'error'); }
    }
};
