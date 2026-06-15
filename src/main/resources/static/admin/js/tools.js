/**
 * 服务端工具管理页面模块
 *
 * 支持功能:
 * - 列出所有服务端工具
 * - 创建新工具(选择处理器类型、关联数据源)
 * - 编辑工具(描述、参数、处理器配置等)
 * - 启用/禁用/删除工具
 *
 * 表单使用动态组件:
 * - SchemaEditor: parameters JSON Schema 可视化编辑
 * - ProcessorConfigForm: processorConfig 按处理器类型联动
 * - KVEditor: responseMapping 键值对编辑
 */
const tools = {
    title: '服务端工具',
    _processorTypes: [],
    _dataSources: [],

    async render(container) {
        container.innerHTML = `
            <div class="toolbar">
                <h4>服务端工具(后端执行,对 SDK 透明)</h4>
                <button class="btn-sm" onclick="tools.showCreateModal()" style="background:var(--primary);color:#fff;border-color:var(--primary)">+ 新增工具</button>
            </div>
            <table class="data-table">
                <thead>
                    <tr><th>工具名</th><th>处理器</th><th>数据源</th><th>路径模板</th><th>描述</th><th>状态</th><th>操作</th></tr>
                </thead>
                <tbody id="toolsTableBody">
                    <tr><td colspan="7" style="text-align:center;color:var(--text-muted)">加载中...</td></tr>
                </tbody>
            </table>
        `;
        await Promise.all([tools.loadProcessorTypes(), tools.loadDataSources()]);
        await tools.loadList();
    },

    async loadProcessorTypes() {
        try {
            tools._processorTypes = await AdminAPI.tools.processorTypes();
        } catch (e) { tools._processorTypes = []; }
    },

    async loadDataSources() {
        try {
            tools._dataSources = await AdminAPI.datasources.list();
        } catch (e) { tools._dataSources = []; }
    },

    async loadList() {
        try {
            const list = await AdminAPI.tools.list();
            const tbody = document.getElementById('toolsTableBody');
            if (!list.length) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">暂无服务端工具</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(t => {
                const dsName = tools._dataSources.find(d => d.id === t.dataSourceId)?.name || '-';
                const procDesc = tools._processorTypes.find(p => p.type === t.processorType)?.description || t.processorType;
                return `
                <tr>
                    <td><code>${t.name}</code></td>
                    <td><span class="badge" style="background:var(--primary);color:#fff">${t.processorType}</span>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${procDesc}</div></td>
                    <td>${t.dataSourceId ? dsName : '<span style="color:var(--text-muted)">无</span>'}</td>
                    <td><code style="font-size:11px">${t.pathTemplate || '-'}</code></td>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                        title="${(t.description || '').replace(/"/g, '&quot;')}">${t.description || '-'}</td>
                    <td><span class="badge ${t.enabled ? 'badge-enabled' : 'badge-disabled'}">${t.enabled ? '启用' : '禁用'}</span></td>
                    <td class="actions">
                        <button class="btn-sm" onclick="tools.showEditModal('${t.id}')">编辑</button>
                        <button class="btn-sm" onclick="tools.toggleEnabled('${t.id}', ${!t.enabled})">${t.enabled ? '禁用' : '启用'}</button>
                        <button class="btn-sm btn-danger" onclick="tools.deleteTool('${t.id}')">删除</button>
                    </td>
                </tr>`;
            }).join('');
        } catch (e) { showToast('加载失败: ' + e.message, 'error'); }
    },

    /** 生成基础表单 HTML(不含动态组件) */
    _baseFormHtml(data = {}) {
        const procOptions = tools._processorTypes.map(p =>
            `<option value="${p.type}" ${data.processorType === p.type ? 'selected' : ''}>${p.type} — ${p.description}</option>`
        ).join('');
        const dsOptions = tools._dataSources.map(d =>
            `<option value="${d.id}" ${data.dataSourceId === d.id ? 'selected' : ''}>${d.name} (${d.url})</option>`
        ).join('');

        return `
            <div class="form-group"><label>工具名称 *</label><input type="text" id="toolName" value="${data.name || ''}" placeholder="如: query_dict"></div>
            <div class="form-group"><label>描述(发给 LLM) *</label><textarea id="toolDesc" rows="3" placeholder="描述工具的功能和参数">${data.description || ''}</textarea></div>
            <div class="form-group"><label>参数 Schema</label><div id="toolParamsEditor"></div></div>
            <div class="form-group"><label>处理器类型 *</label>
                <select id="toolProcessorType">${procOptions}</select>
            </div>
            <div class="form-group"><label>处理器配置</label><div id="toolProcessorConfigEditor"></div></div>
            <div class="form-group"><label>关联数据源</label>
                <select id="toolDataSourceId">
                    <option value="">— 无数据源 —</option>
                    ${dsOptions}
                </select>
            </div>
            <div class="form-group"><label>API 路径模板</label><input type="text" id="toolPathTemplate" value="${data.pathTemplate || ''}" placeholder="如: /api/dict/{dict_type}/list"></div>
            <div class="form-group"><label>响应字段映射(可选)</label><div id="toolResponseMappingEditor"></div></div>
            <div class="form-group"><label>所属应用 Client ID</label><input type="text" id="toolOwnerId" value="${data.ownerId || ''}" placeholder="留空=平台内置"></div>
        `;
    },

    /** 初始化动态表单组件(在 openModal 后调用) */
    _initDynamicForms(data = {}) {
        // 参数 Schema 编辑器
        SchemaEditor.render(
            document.getElementById('toolParamsEditor'),
            data.parameters || null
        );

        // 处理器配置表单
        const procType = data.processorType || (tools._processorTypes[0] && tools._processorTypes[0].type) || 'passthrough';
        ProcessorConfigForm.render(
            document.getElementById('toolProcessorConfigEditor'),
            procType,
            data.processorConfig || null
        );

        // 响应映射 KV 编辑器
        KVEditor.render(
            document.getElementById('toolResponseMappingEditor'),
            data.responseMapping || null,
            { keyPlaceholder: '字段名', valuePlaceholder: '映射值', title: '字段映射' }
        );

        // 处理器类型切换 → 重新渲染配置表单
        document.getElementById('toolProcessorType').addEventListener('change', (e) => {
            const currentConfig = ProcessorConfigForm.collect(document.getElementById('toolProcessorConfigEditor'));
            const hasCustomConfig = Object.keys(currentConfig).length > 0;
            ProcessorConfigForm.render(
                document.getElementById('toolProcessorConfigEditor'),
                e.target.value,
                hasCustomConfig ? JSON.stringify(currentConfig) : null
            );
        });
    },

    showCreateModal() {
        openModal('新增服务端工具', this._baseFormHtml() + `<button class="btn-primary" onclick="tools.createTool()" style="margin-top:12px">创建</button>`);
        this._initDynamicForms();
    },

    async showEditModal(id) {
        try {
            const tool = await AdminAPI.tools.get(id);
            openModal('编辑服务端工具', this._baseFormHtml(tool) + `<button class="btn-primary" onclick="tools.updateTool('${id}')" style="margin-top:12px">保存</button>`);
            this._initDynamicForms(tool);
        } catch (e) { showToast('加载失败: ' + e.message, 'error'); }
    },

    /** 收集所有表单数据(基础字段 + 动态组件) */
    _collectForm() {
        const paramsSchema = SchemaEditor.collect(document.getElementById('toolParamsEditor'));
        const procConfig = ProcessorConfigForm.collect(document.getElementById('toolProcessorConfigEditor'));
        const responseMapping = KVEditor.collect(document.getElementById('toolResponseMappingEditor'));

        return {
            name: document.getElementById('toolName').value.trim(),
            description: document.getElementById('toolDesc').value.trim(),
            parameters: JSON.stringify(paramsSchema),
            processorType: document.getElementById('toolProcessorType').value,
            processorConfig: JSON.stringify(procConfig),
            dataSourceId: document.getElementById('toolDataSourceId').value || null,
            pathTemplate: document.getElementById('toolPathTemplate').value.trim() || null,
            responseMapping: Object.keys(responseMapping).length > 0 ? JSON.stringify(responseMapping) : null,
            ownerId: document.getElementById('toolOwnerId').value.trim() || null
        };
    },

    async createTool() {
        const data = this._collectForm();
        if (!data.name || !data.processorType || !data.description) {
            showToast('工具名、处理器类型、描述必填', 'error'); return;
        }
        try {
            await AdminAPI.tools.create(data);
            closeModal();
            showToast('工具已创建', 'success');
            await this.loadList();
        } catch (e) { showToast('创建失败: ' + e.message, 'error'); }
    },

    async updateTool(id) {
        const data = this._collectForm();
        try {
            await AdminAPI.tools.update(id, data);
            closeModal();
            showToast('已保存', 'success');
            await this.loadList();
        } catch (e) { showToast('保存失败: ' + e.message, 'error'); }
    },

    async toggleEnabled(id, enable) {
        try {
            await AdminAPI.tools.update(id, { enabled: enable });
            showToast(enable ? '已启用' : '已禁用', 'success');
            await this.loadList();
        } catch (e) { showToast('操作失败: ' + e.message, 'error'); }
    },

    async deleteTool(id) {
        if (!confirm('确定删除此服务端工具?')) return;
        try {
            await AdminAPI.tools.delete(id);
            showToast('已删除', 'success');
            await this.loadList();
        } catch (e) { showToast('删除失败: ' + e.message, 'error'); }
    }
};
