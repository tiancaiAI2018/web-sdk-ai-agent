/**
 * 管理端 API 封装 —— 统一带 JWT header,处理 401 跳转登录。
 */
const AdminAPI = (() => {
    const BASE = '/admin/api';

    /** 获取存储的 JWT */
    function getToken() {
        return localStorage.getItem('admin_token');
    }

    /** 获取当前 scope */
    function getScope() {
        return localStorage.getItem('admin_scope');
    }

    /** 通用请求封装 */
    async function request(method, path, body) {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const opts = { method, headers };
        if (body !== undefined) opts.body = JSON.stringify(body);

        const resp = await fetch(BASE + path, opts);

        // 401/403 跳转登录
        if (resp.status === 401 || resp.status === 403) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_scope');
            window.location.href = '/admin/login.html';
            throw new Error('未授权,请重新登录');
        }

        return resp.json();
    }

    // 登录(不走 /admin/api,走 /auth/token)
    async function login(username, password) {
        const resp = await fetch('/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grant_type: 'password', username, password })
        });
        const data = await resp.json();
        if (data.access_token) {
            localStorage.setItem('admin_token', data.access_token);
            localStorage.setItem('admin_scope', data.scope || '');
            localStorage.setItem('admin_refresh_token', data.refresh_token || '');
            return data;
        }
        throw new Error(data.error || '登录失败');
    }

    function logout() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_scope');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/admin/login.html';
    }

    // 应用管理
    const apps = {
        list: () => request('GET', '/apps'),
        create: (body) => request('POST', '/apps', body),
        update: (id, body) => request('PUT', '/apps/' + id, body),
        delete: (id) => request('DELETE', '/apps/' + id),
        rotateSecret: (id) => request('POST', '/apps/' + id + '/rotate-secret')
    };

    // 数据源管理
    const datasources = {
        list: () => request('GET', '/datasources'),
        create: (body) => request('POST', '/datasources', body),
        update: (id, body) => request('PUT', '/datasources/' + id, body),
        delete: (id) => request('DELETE', '/datasources/' + id),
        healthCheck: (id) => request('POST', '/datasources/' + id + '/health-check')
    };

    // 服务端工具管理(完整 CRUD)
    const tools = {
        list: () => request('GET', '/server-tools'),
        get: (id) => request('GET', '/server-tools/' + id),
        create: (body) => request('POST', '/server-tools', body),
        update: (id, body) => request('PUT', '/server-tools/' + id, body),
        delete: (id) => request('DELETE', '/server-tools/' + id),
        processorTypes: () => request('GET', '/processor-types')
    };

    // 审计日志
    const audit = {
        list: (limit = 50) => request('GET', '/audit?limit=' + limit)
    };

    return { getToken, getScope, login, logout, apps, datasources, tools, audit };
})();
