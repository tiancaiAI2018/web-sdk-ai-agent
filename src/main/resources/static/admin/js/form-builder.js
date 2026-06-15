/**
 * 动态表单引擎 — JSON Schema 可视化编辑 + KV 键值对编辑 + 处理器配置联动表单
 *
 * 三个组件:
 * - SchemaEditor: 编辑 JSON Schema (用于 server-tool 的 parameters 字段)
 * - KVEditor: 编辑扁平 JSON 对象 (用于 headers, responseMapping)
 * - ProcessorConfigForm: 按处理器类型渲染配置表单 (用于 processorConfig)
 *
 * 每个组件支持双向:
 * - render(container, data): JSON → 表单 (编辑时反向渲染)
 * - collect(container): 表单 → JSON (保存时正向拼装)
 */

/* ========== SchemaEditor ========== */

const SchemaEditor = {
    _uid: 0,

    /**
     * 渲染 JSON Schema 可视化编辑器
     * @param {HTMLElement} container - 挂载容器
     * @param {string|null} jsonStr - 已有的 JSON Schema 字符串(编辑时传入)
     */
    render(container, jsonStr) {
        const schema = this._parse(jsonStr);
        const props = schema.properties || {};
        const required = schema.required || [];

        const id = 'se_' + (++this._uid);
        container.innerHTML = '';
        container.dataset.schemaEditorId = id;

        const wrapper = document.createElement('div');
        wrapper.className = 'schema-editor';

        // 表格头
        wrapper.innerHTML = `
            <div class="se-header">
                <span class="se-title">参数定义</span>
                <button type="button" class="btn-sm se-add-btn" data-id="${id}">+ 添加参数</button>
            </div>
            <div class="se-rows" id="${id}_rows"></div>
            <div class="se-preview">
                <button type="button" class="se-toggle-btn" data-id="${id}">查看 JSON</button>
                <pre class="se-json-preview" id="${id}_preview" style="display:none"></pre>
            </div>
        `;
        container.appendChild(wrapper);

        const rowsEl = wrapper.querySelector(`#${id}_rows`);

        // 反向渲染: 已有 schema → 行
        const keys = Object.keys(props);
        if (keys.length === 0) {
            this._addRow(rowsEl, id, {}, false);
        } else {
            keys.forEach(key => {
                const prop = props[key];
                this._addRow(rowsEl, id, {
                    name: key,
                    type: prop.type || 'string',
                    description: prop.description || '',
                    default: prop.default !== undefined ? String(prop.default) : '',
                    required: required.includes(key)
                }, true);
            });
        }

        // 事件绑定
        wrapper.querySelector('.se-add-btn').addEventListener('click', () => {
            this._addRow(rowsEl, id, {}, false);
        });
        wrapper.querySelector('.se-toggle-btn').addEventListener('click', () => {
            const pre = wrapper.querySelector(`#${id}_preview`);
            const btn = wrapper.querySelector('.se-toggle-btn');
            if (pre.style.display === 'none') {
                pre.textContent = JSON.stringify(this.collect(container), null, 2);
                pre.style.display = 'block';
                btn.textContent = '隐藏 JSON';
            } else {
                pre.style.display = 'none';
                btn.textContent = '查看 JSON';
            }
        });
        rowsEl.addEventListener('input', () => this._updatePreview(container, id));
        rowsEl.addEventListener('change', () => this._updatePreview(container, id));
        rowsEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('se-del-btn')) {
                e.target.closest('.se-row').remove();
                if (rowsEl.children.length === 0) this._addRow(rowsEl, id, {}, false);
                this._updatePreview(container, id);
            }
        });
    },

    /**
     * 收集表单 → JSON Schema 字符串
     * @param {HTMLElement} container - 挂载容器
     * @returns {string} JSON Schema 字符串
     */
    collect(container) {
        const rows = container.querySelectorAll('.se-row');
        const properties = {};
        const required = [];

        rows.forEach(row => {
            const name = row.querySelector('.se-name').value.trim();
            if (!name) return;
            const type = row.querySelector('.se-type').value;
            const desc = row.querySelector('.se-desc').value.trim();
            const def = row.querySelector('.se-default').value.trim();
            const isReq = row.querySelector('.se-required').checked;

            const prop = { type };
            if (desc) prop.description = desc;
            if (def !== '') {
                if (type === 'integer' || type === 'number') {
                    const num = Number(def);
                    if (!isNaN(num)) prop.default = num;
                } else if (type === 'boolean') {
                    prop.default = def === 'true';
                } else {
                    prop.default = def;
                }
            }
            properties[name] = prop;
            if (isReq) required.push(name);
        });

        const schema = { type: 'object', properties };
        if (required.length > 0) schema.required = required;
        return schema;
    },

    _addRow(rowsEl, id, data, fromExisting) {
        const row = document.createElement('div');
        row.className = 'se-row';
        row.innerHTML = `
            <input type="text" class="se-name" placeholder="参数名" value="${this._esc(data.name || '')}">
            <select class="se-type">
                <option value="string" ${data.type === 'string' ? 'selected' : ''}>string</option>
                <option value="integer" ${data.type === 'integer' ? 'selected' : ''}>integer</option>
                <option value="number" ${data.type === 'number' ? 'selected' : ''}>number</option>
                <option value="boolean" ${data.type === 'boolean' ? 'selected' : ''}>boolean</option>
                <option value="array" ${data.type === 'array' ? 'selected' : ''}>array</option>
            </select>
            <input type="text" class="se-desc" placeholder="描述(发给 LLM)" value="${this._esc(data.description || '')}">
            <input type="text" class="se-default" placeholder="默认值" value="${this._esc(data.default || '')}">
            <label class="se-req-label"><input type="checkbox" class="se-required" ${data.required ? 'checked' : ''}>必填</label>
            <button type="button" class="btn-sm btn-danger se-del-btn" title="删除">&times;</button>
        `;
        rowsEl.appendChild(row);
    },

    _updatePreview(container, id) {
        const pre = container.querySelector(`#${id}_preview`);
        if (pre && pre.style.display !== 'none') {
            pre.textContent = JSON.stringify(this.collect(container), null, 2);
        }
    },

    _parse(jsonStr) {
        if (!jsonStr || !jsonStr.trim()) return {};
        try { return JSON.parse(jsonStr); } catch { return {}; }
    },

    _esc(str) {
        return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};


/* ========== KVEditor ========== */

const KVEditor = {
    _uid: 0,

    /**
     * 渲染 KV 键值对编辑器
     * @param {HTMLElement} container - 挂载容器
     * @param {string|null} jsonStr - 已有 JSON 字符串(编辑时传入)
     * @param {object} options - { keyPlaceholder, valuePlaceholder, title }
     */
    render(container, jsonStr, options = {}) {
        const data = this._parse(jsonStr);
        const id = 'kv_' + (++this._uid);
        const keyPh = options.keyPlaceholder || '键';
        const valPh = options.valuePlaceholder || '值';
        const title = options.title || '键值对';

        container.innerHTML = '';
        container.dataset.kvEditorId = id;

        const wrapper = document.createElement('div');
        wrapper.className = 'kv-editor';
        wrapper.innerHTML = `
            <div class="kv-header">
                <span class="kv-title">${title}</span>
                <button type="button" class="btn-sm kv-add-btn" data-id="${id}">+ 添加</button>
            </div>
            <div class="kv-rows" id="${id}_rows"></div>
            <div class="se-preview">
                <button type="button" class="se-toggle-btn" data-id="${id}">查看 JSON</button>
                <pre class="se-json-preview" id="${id}_preview" style="display:none"></pre>
            </div>
        `;
        container.appendChild(wrapper);

        const rowsEl = wrapper.querySelector(`#${id}_rows`);
        const keys = Object.keys(data);

        if (keys.length === 0) {
            this._addRow(rowsEl, id, '', '', keyPh, valPh);
        } else {
            keys.forEach(key => {
                this._addRow(rowsEl, id, key, data[key], keyPh, valPh);
            });
        }

        wrapper.querySelector('.kv-add-btn').addEventListener('click', () => {
            this._addRow(rowsEl, id, '', '', keyPh, valPh);
        });
        wrapper.querySelector('.se-toggle-btn').addEventListener('click', () => {
            const pre = wrapper.querySelector(`#${id}_preview`);
            const btn = wrapper.querySelector('.se-toggle-btn');
            if (pre.style.display === 'none') {
                pre.textContent = JSON.stringify(this.collect(container), null, 2);
                pre.style.display = 'block';
                btn.textContent = '隐藏 JSON';
            } else {
                pre.style.display = 'none';
                btn.textContent = '查看 JSON';
            }
        });
        rowsEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('kv-del-btn')) {
                e.target.closest('.kv-row').remove();
                if (rowsEl.children.length === 0) this._addRow(rowsEl, id, '', '', keyPh, valPh);
            }
        });
    },

    /**
     * 收集表单 → JSON 对象
     * @param {HTMLElement} container
     * @returns {object}
     */
    collect(container) {
        const result = {};
        container.querySelectorAll('.kv-row').forEach(row => {
            const key = row.querySelector('.kv-key').value.trim();
            const val = row.querySelector('.kv-value').value.trim();
            if (key) result[key] = val;
        });
        return result;
    },

    _addRow(rowsEl, id, key, value, keyPh, valPh) {
        const row = document.createElement('div');
        row.className = 'kv-row';
        row.innerHTML = `
            <input type="text" class="kv-key" placeholder="${keyPh}" value="${SchemaEditor._esc(String(key))}">
            <input type="text" class="kv-value" placeholder="${valPh}" value="${SchemaEditor._esc(String(value))}">
            <button type="button" class="btn-sm btn-danger kv-del-btn" title="删除">&times;</button>
        `;
        rowsEl.appendChild(row);
    },

    _parse(jsonStr) {
        if (!jsonStr || !jsonStr.trim()) return {};
        try { return JSON.parse(jsonStr); } catch { return {}; }
    }
};


/* ========== ProcessorConfigForm ========== */

const ProcessorConfigForm = {
    /** fuzzy_match 处理器字段定义(字段名, 标签, 默认值, 类型) */
    _fuzzyFields: [
        { key: 'keywordArg', label: '关键词参数名', default: 'keyword', type: 'text' },
        { key: 'limitArg', label: '限制条数参数名', default: 'limit', type: 'text' },
        { key: 'parentArg', label: '父级编码参数名', default: 'parent_code', type: 'text' },
        { key: 'codeField', label: '响应-编码字段名', default: 'code', type: 'text' },
        { key: 'nameField', label: '响应-名称字段名', default: 'name', type: 'text' },
        { key: 'aliasesField', label: '响应-别名字段名', default: 'aliases', type: 'text' },
        { key: 'parentField', label: '响应-父级字段名', default: 'parent', type: 'text' },
        { key: 'defaultLimit', label: '默认返回条数', default: 5, type: 'number' },
        { key: 'maxLimit', label: '最大返回条数', default: 20, type: 'number' },
    ],

    /** passthrough 处理器字段定义 */
    _passthroughFields: [
        { key: 'responsePath', label: '响应数据路径', default: '', type: 'text', placeholder: '如 data 或 result.items,留空返回整个响应' },
    ],

    /**
     * 渲染处理器配置表单
     * @param {HTMLElement} container - 挂载容器
     * @param {string} processorType - 处理器类型
     * @param {string|null} jsonStr - 已有的 processorConfig JSON(编辑时传入)
     */
    render(container, processorType, jsonStr) {
        const data = this._parse(jsonStr);
        const fields = this._getFields(processorType);

        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'proc-config-form';

        if (fields.length === 0) {
            wrapper.innerHTML = '<div class="proc-empty">该处理器无需额外配置</div>';
            container.appendChild(wrapper);
            return;
        }

        let html = '<div class="proc-fields">';
        fields.forEach(f => {
            const val = data[f.key] !== undefined ? data[f.key] : f.default;
            const ph = f.placeholder || f.default;
            html += `
                <div class="proc-field">
                    <label>${f.label}</label>
                    <input type="${f.type}" data-key="${f.key}" value="${SchemaEditor._esc(String(val))}" placeholder="${SchemaEditor._esc(String(ph))}">
                </div>
            `;
        });
        html += '</div>';
        html += `
            <div class="se-preview">
                <button type="button" class="se-toggle-btn proc-toggle">查看 JSON</button>
                <pre class="se-json-preview proc-preview" style="display:none"></pre>
            </div>
        `;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);

        wrapper.querySelector('.proc-toggle').addEventListener('click', () => {
            const pre = wrapper.querySelector('.proc-preview');
            const btn = wrapper.querySelector('.proc-toggle');
            if (pre.style.display === 'none') {
                pre.textContent = JSON.stringify(this.collect(container), null, 2);
                pre.style.display = 'block';
                btn.textContent = '隐藏 JSON';
            } else {
                pre.style.display = 'none';
                btn.textContent = '查看 JSON';
            }
        });
        wrapper.addEventListener('input', () => {
            const pre = wrapper.querySelector('.proc-preview');
            if (pre && pre.style.display !== 'none') {
                pre.textContent = JSON.stringify(this.collect(container), null, 2);
            }
        });
    },

    /**
     * 收集表单 → JSON 对象
     * @param {HTMLElement} container
     * @returns {object}
     */
    collect(container) {
        const result = {};
        container.querySelectorAll('.proc-field input').forEach(input => {
            const key = input.dataset.key;
            let val = input.value.trim();
            if (input.type === 'number' && val !== '') {
                val = Number(val);
            }
            if (val !== '') result[key] = val;
        });
        return result;
    },

    _getFields(type) {
        switch (type) {
            case 'fuzzy_match': return this._fuzzyFields;
            case 'passthrough': return this._passthroughFields;
            default: return [];
        }
    },

    _parse(jsonStr) {
        if (!jsonStr || !jsonStr.trim()) return {};
        try { return JSON.parse(jsonStr); } catch { return {}; }
    }
};
