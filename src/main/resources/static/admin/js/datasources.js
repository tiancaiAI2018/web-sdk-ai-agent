/**
 * 数据源管理页面模块
 */
const datasources = {
    title: '数据源管理',

    async render(container) {
        container.innerHTML = `
            <div class="toolbar">
                <h4>第三方数据源配置</h4>
                <button class="btn-sm" onclick="datasources.showCreateModal()" style="background:var(--primary);color:#fff;border-color:var(--primary)">+ 新增数据源</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr><th>名称</th><th>类型</th><th>URL</th><th>认证</th><th>健康</th><th>所属应用</th><th>操作</th></tr>
                </thead>
                <tbody id="dsTableBody">
                    <tr><td colspan="7" style="text-align:center;color:var(--text-muted)">加载中...</td></tr>
                </tbody>
            </table>
        `;
        await datasources.loadList();
    },

    async loadList() {
        try {
            const list = await AdminAPI.datasources.list();
            const tbody = document.getElementById('dsTableBody');
            if (!list.length) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">暂无数据源</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(ds => `
                <tr>
                    <td>${ds.name}</td>
                    <td>${ds.type}</td>
                    <td><code style="font-size:12px">${ds.url}</code></td>
                    <td>${ds.authType || 'none'}</td>
                    <td><span class="badge badge-${ds.healthStatus || 'unknown'}">${ds.healthStatus || 'unknown'}</span></td>
                    <td><code>${ds.ownerId}</code></td>
                    <td class="actions">
                        <button class="btn-sm btn-success" onclick="datasources.healthCheck('${ds.id}')">健康检查</button>
                        <button class="btn-sm" onclick="datasources.showEditModal('${ds.id}')">编辑</button>
                        <button class="btn-sm btn-danger" onclick="datasources.deleteDS('${ds.id}')">删除</button>
                    </td>
                </tr>
            `).join('');
        } catch (e) {
            showToast('加载数据源失败: ' + e.message, 'error');
        }
    },

    /** 生成数据源表单 HTML */
    _formHtml(data = {}) {
        return `
            <div class="form-group"><label>名称</label><input type="text" id="dsName" value="${data.name || ''}" placeholder="如: ERP字典API"></div>
            <div class="form-group"><label>类型</label><select id="dsType"><option value="rest" ${data.type==='rest'?'selected':''}>REST API</option></select></div>
            <div class="form-group"><label>URL</label><input type="text" id="dsUrl" value="${data.url || ''}" placeholder="如: http://localhost:3100"></div>
            <div class="form-group"><label>认证方式</label>
                <select id="dsAuthType" onchange="datasources._toggleAuthFields()">
                    <option value="none" ${data.authType==='none'||!data.authType?'selected':''}>无认证</option>
                    <option value="api_key" ${data.authType==='api_key'?'selected':''}>API Key</option>
                    <option value="bearer" ${data.authType==='bearer'?'selected':''}>Bearer Token</option>
                    <option value="basic" ${data.authType==='basic'?'selected':''}>Basic Auth</option>
                </select>
            </div>
            <div class="form-group" id="dsAuthConfigGroup" style="display:none"><label>认证配置(JSON)</label>
                <textarea id="dsAuthConfig" rows="3" placeholder='如: {"key":"xxx","header":"X-API-Key"}'>${data.authConfig || ''}</textarea>
            </div>
            <div class="form-group"><label>所属应用 Client ID</label><input type="text" id="dsOwnerId" value="${data.ownerId || ''}" placeholder="如: demo-app"></div>
            <div class="form-group"><label>额外请求头(JSON,可选)</label><textarea id="dsHeaders" rows="2" placeholder='如: {"X-Custom":"value"}'>${data.headers || ''}</textarea></div>
        `;
    },

    _toggleAuthFields() {
        const type = document.getElementById('dsAuthType').value;
        document.getElementById('dsAuthConfigGroup').style.display = type === 'none' ? 'none' : 'block';
    },

    showCreateModal() {
        openModal('新增数据源', this._formHtml() + `<button class="btn-primary" onclick="datasources.createDS()" style="margin-top:12px">创建</button>`);
        this._toggleAuthFields();
    },

    async showEditModal(id) {
        try {
            const list = await AdminAPI.datasources.list();
            const ds = list.find(d => d.id === id);
            if (!ds) { showToast('数据源不存在', 'error'); return; }
            openModal('编辑数据源', this._formHtml(ds) + `<button class="btn-primary" onclick="datasources.updateDS('${id}')" style="margin-top:12px">保存</button>`);
            this._toggleAuthFields();
        } catch (e) { showToast('加载失败: ' + e.message, 'error'); }
    },

    _collectForm() {
        const authType = document.getElementById('dsAuthType').value;
        return {
            name: document.getElementById('dsName').value.trim(),
            type: document.getElementById('dsType').value,
            url: document.getElementById('dsUrl').value.trim(),
            authType,
            authConfig: authType !== 'none' ? document.getElementById('dsAuthConfig').value.trim() : null,
            ownerId: document.getElementById('dsOwnerId').value.trim(),
            headers: document.getElementById('dsHeaders').value.trim() || null
        };
    },

    async createDS() {
        const data = this._collectForm();
        if (!data.name || !data.url || !data.ownerId) { showToast('名称、URL、所属应用必填', 'error'); return; }
        try {
            await AdminAPI.datasources.create(data);
            closeModal();
            showToast('数据源已创建', 'success');
            await this.loadList();
        } catch (e) { showToast('创建失败: ' + e.message, 'error'); }
    },

    async updateDS(id) {
        const data = this._collectForm();
        try {
            await AdminAPI.datasources.update(id, data);
            closeModal();
            showToast('已保存', 'success');
            await this.loadList();
        } catch (e) { showToast('保存失败: ' + e.message, 'error'); }
    },

    async healthCheck(id) {
        try {
            const result = await AdminAPI.datasources.healthCheck(id);
            showToast('健康状态: ' + (result.status || 'done'), result.status === 'ok' ? 'success' : 'error');
            await this.loadList();
        } catch (e) { showToast('检查失败: ' + e.message, 'error'); }
    },

    async deleteDS(id) {
        if (!confirm('确定删除此数据源?')) return;
        try {
            await AdminAPI.datasources.delete(id);
            showToast('已删除', 'success');
            await this.loadList();
        } catch (e) { showToast('删除失败: ' + e.message, 'error'); }
    }
};
