/**
 * 第三方后端 mock —— 完整模拟第三方业务系统
 *
 * 功能:
 *   1. /api/ai-token          — 代理 AI 平台认证(客户端凭证模式)
 *   2. /api/dict/:type/list   — 字典数据查询 API(AI 后端的数据源会调用此接口)
 *   3. /health                — 健康检查
 *
 * 字典 API 约定:
 *   - 路径: /api/dict/{type}/list?keyword=xxx&parentCode=xxx&limit=N
 *   - 响应: { data: [{ code, name, aliases, parent }] }
 *   - 支持 keyword 模糊搜索(编码/名称/别名)
 *   - 支持 parentCode 级联过滤
 *
 * RestDictProvider 解析逻辑:
 *   - 响应可以是数组 或 { data: [...] }
 *   - 字段映射通过管理端 DictSourceBinding.responseMapping 配置
 *   - 默认字段: code, name, aliases, parent
 *
 * 用法: node examples/third-party-mock.js
 *       然后访问 http://localhost:5500/host-page.html(浏览器)
 */

const express = require('express');
const app = express();
app.use(express.json());

// CORS: 允许跨域(真实场景:第三方后端配 CORS 白名单,只放自己的前端域名)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const AI_AGENT = 'http://localhost:8080';
const PORT = 7000;

// 第三方自家后端: secret 来自我方管理端控制台 + 本地配置(不进浏览器)
const APP_ID = 'demo-app';
const APP_SECRET = 'demo-secret';

// ====================================================================
// 字典数据 —— 模拟第三方业务系统自有的字典
// ====================================================================

/** 字典数据仓库: type → DictItem[] */
const DICT_STORE = {
  // 产品分类(扁平)
  category: [
    { code: 'electronics', name: '电子产品', aliases: ['电子', '数码'] },
    { code: 'clothing',    name: '服装鞋帽', aliases: ['衣服', '鞋'] },
    { code: 'food',        name: '食品饮料', aliases: ['食品', '饮料', '吃的'] },
    { code: 'furniture',   name: '家具家装', aliases: ['家具', '装修'] },
    { code: 'office',      name: '办公用品', aliases: ['办公', '文具'] },
  ],

  // 城市(扁平)
  city: [
    { code: 'beijing',  name: '北京', aliases: ['BJ', '帝都'] },
    { code: 'shanghai', name: '上海', aliases: ['SH', '魔都'] },
    { code: 'guangzhou',name: '广州', aliases: ['GZ', '羊城'] },
    { code: 'shenzhen', name: '深圳', aliases: ['SZ'] },
    { code: 'hangzhou', name: '杭州', aliases: ['HZ', '杭'] },
    { code: 'chengdu',  name: '成都', aliases: ['CD', '蓉'] },
    { code: 'wuhan',    name: '武汉', aliases: ['WH'] },
    { code: 'nanjing',  name: '南京', aliases: ['NJ', '宁'] },
  ],

  // 设备类型 → 设备型号(级联: device_model 的 parent 指向 device_type 的 code)
  device_type: [
    { code: 'server',   name: '服务器',   aliases: ['Server'] },
    { code: 'switch',   name: '交换机',   aliases: ['Switch', 'SW'] },
    { code: 'router',   name: '路由器',   aliases: ['Router'] },
    { code: 'firewall', name: '防火墙',   aliases: ['FW', 'Firewall'] },
  ],

  device_model: [
    { code: 'dell-r740',  name: 'Dell R740',   aliases: ['R740'],  parent: 'server' },
    { code: 'dell-r750',  name: 'Dell R750',   aliases: ['R750'],  parent: 'server' },
    { code: 'hp-dl380',   name: 'HP DL380',    aliases: ['DL380'], parent: 'server' },
    { code: 'huawei-5700', name: '华为 S5700', aliases: ['S5700'], parent: 'switch' },
    { code: 'cisco-9300', name: 'Cisco 9300',  aliases: ['9300'],  parent: 'switch' },
    { code: 'huawei-ne40', name: '华为 NE40',  aliases: ['NE40'],  parent: 'router' },
    { code: 'paloalto-850', name: 'PA-850',    aliases: ['PA850'], parent: 'firewall' },
  ],

  // 紧急程度
  urgency: [
    { code: 'critical', name: '紧急', aliases: ['urgent', 'P0'] },
    { code: 'high',     name: '高',   aliases: ['P1'] },
    { code: 'medium',   name: '中',   aliases: ['P2', '一般'] },
    { code: 'low',      name: '低',   aliases: ['P3'] },
  ],

  // 支付方式
  payment: [
    { code: 'bank_transfer', name: '银行转账', aliases: ['转账', '对公'] },
    { code: 'alipay',        name: '支付宝',   aliases: ['阿里支付'] },
    { code: 'wechat_pay',    name: '微信支付', aliases: ['微信'] },
    { code: 'credit_card',   name: '信用卡',   aliases: ['信用卡', 'VISA'] },
  ],

  // 产品
  product: [
    { code: 'laptop-pro',    name: '笔记本电脑 Pro', aliases: ['笔记本', 'laptop'] },
    { code: 'monitor-27',    name: '27寸显示器',      aliases: ['显示器', 'monitor'] },
    { code: 'keyboard-mech', name: '机械键盘',        aliases: ['键盘', 'keyboard'] },
    { code: 'mouse-wireless',name: '无线鼠标',        aliases: ['鼠标', 'mouse'] },
    { code: 'headset-bt',    name: '蓝牙耳机',        aliases: ['耳机', 'headset'] },
  ],

  // 仓库
  warehouse: [
    { code: 'wh-north', name: '华北仓库', aliases: ['北京仓', '北方仓'] },
    { code: 'wh-east',  name: '华东仓库', aliases: ['上海仓', '东方仓'] },
    { code: 'wh-south', name: '华南仓库', aliases: ['广州仓', '南方仓'] },
    { code: 'wh-west',  name: '西南仓库', aliases: ['成都仓'] },
  ],
};

// ====================================================================
// 字典查询逻辑 —— 模拟第三方业务系统的字典查询能力
// ====================================================================

/**
 * 模糊匹配: keyword 与 code/name/aliases 任一匹配即命中
 */
function matchKeyword(item, keyword) {
  if (!keyword) return true;
  const kw = keyword.toLowerCase();
  if (item.code.toLowerCase().includes(kw)) return true;
  if (item.name.toLowerCase().includes(kw)) return true;
  if (item.aliases && item.aliases.some(a => a.toLowerCase().includes(kw))) return true;
  return false;
}

/**
 * 查询字典数据
 * @param {string} dictType  字典类型
 * @param {string} keyword   搜索关键词(可选)
 * @param {string} parentCode 父级编码(级联过滤,可选)
 * @param {number} limit     返回条数上限
 */
function queryDict(dictType, keyword, parentCode, limit) {
  const items = DICT_STORE[dictType];
  if (!items) return [];

  let result = items;

  // 级联过滤: 如果指定了 parentCode,只返回 parent 匹配的项
  if (parentCode) {
    result = result.filter(item => item.parent === parentCode);
  }

  // 关键词模糊搜索
  if (keyword) {
    result = result.filter(item => matchKeyword(item, keyword));
  }

  // 限制返回条数
  return result.slice(0, limit || 100);
}

// ====================================================================
// API 路由
// ====================================================================

/**
 * 代理 AI 平台认证 —— 第三方后端用 client_credentials 换取 token
 * secret 永远只在本进程和 AI 平台之间出现,绝不出现在浏览器
 */
app.post('/api/ai-token', async (req, res) => {
  try {
    const r = await fetch(`${AI_AGENT}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: APP_ID,
        client_secret: APP_SECRET
      })
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('[mock] upstream auth failed', r.status, t);
      return res.status(502).json({ error: 'upstream_auth_failed', detail: t });
    }
    const j = await r.json();
    console.log('[mock] issued access+jti=... expires_in=' + j.expires_in);
    res.json({
      accessToken: j.access_token,
      refreshToken: j.refresh_token,
      expiresIn: j.expires_in
    });
  } catch (e) {
    console.error('[mock] error', e);
    res.status(500).json({ error: 'mock_error', message: e.message });
  }
});

/**
 * 字典数据查询 API —— AI 后端的 RestDictProvider 会调用此接口
 *
 * 路径: /api/dict/:type/list
 * 参数: keyword(搜索关键词), parentCode(父级编码), limit(返回条数)
 * 响应: { data: [{ code, name, aliases, parent }] }
 *
 * 这个接口就是"第三方数据源"的实际实现,需要在管理端配置为数据源并绑定字典类型后,
 * AI 后端的 query_dict 服务端工具才能通过 RestDictProvider 调用到这里。
 */
app.get('/api/dict/:type/list', (req, res) => {
  const dictType = req.params.type;
  const keyword = req.query.keyword || '';
  const parentCode = req.query.parentCode || '';
  const limit = parseInt(req.query.limit) || 100;

  // 可选: 验证 API Key 认证(与管理端配置的 authType 对应)
  // 这里演示 api_key 认证方式,如果管理端数据源配了 api_key 认证,
  // RestDictProvider 会在请求头带上 X-API-Key
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey !== 'demo-api-key-123') {
    return res.status(401).json({ error: 'invalid_api_key' });
  }
  // 如果没带 API Key 也放行(对应管理端数据源 authType=none 的场景)

  const items = queryDict(dictType, keyword, parentCode, limit);

  if (items.length === 0 && !DICT_STORE[dictType]) {
    // 字典类型不存在
    return res.status(404).json({ error: 'dict_type_not_found', dictType });
  }

  console.log(`[mock dict] type=${dictType} keyword="${keyword}" parent="${parentCode}" → ${items.length} items`);

  // 响应格式: { data: [...] }  —— RestDictProvider 支持这种格式
  res.json({ data: items });
});

// ====================================================================
// 错误模拟 API —— 供页面感知(Page Awareness)测试使用
// ====================================================================

/** 返回 404 */
app.get('/api/sim/404', (req, res) => {
  res.status(404).json({ error: 'not_found', message: '资源不存在' });
});

/** 返回 500 */
app.get('/api/sim/500', (req, res) => {
  res.status(500).json({ error: 'internal_error', message: '服务器内部错误' });
});

/** 返回 403(带敏感信息:模拟鉴权失败泄露 token) */
app.get('/api/sim/403', (req, res) => {
  res.status(403).json({
    error: 'forbidden',
    message: 'Token Bearer eyJhbGciOiJSUzI1NiJ9.secret_token 已过期,请联系管理员',
    email: 'admin@company.com'
  });
});

/** 慢响应(超时测试) */
app.get('/api/sim/timeout', (req, res) => {
  setTimeout(() => {
    res.json({ ok: true, message: '终于响应了' });
  }, 10000);
});

/** 模拟订单提交失败(500 + 错误 Toast 联动) */
app.post('/api/sim/order-fail', (req, res) => {
  res.status(500).json({ error: 'order_submit_failed', message: '订单提交失败: 库存不足' });
});

/**
 * 健康检查 —— 管理端数据源健康检查会调用此接口
 */
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'third-party-mock',
    version: '2.0',
    dictTypes: Object.keys(DICT_STORE),
    uptime: process.uptime()
  });
});

// ====================================================================
// 库存查询 API —— passthrough 处理器示例
//
// 路径: /api/inventory/query?product_code=xxx&warehouse_code=xxx
// 响应: { data: [{ productCode, productName, warehouseCode, warehouseName, quantity, status }] }
//
// 这个接口演示 passthrough 处理器: AI 后端不做任何后处理,
// 直接把第三方返回的原始数据透传给 LLM。
// ====================================================================

const INVENTORY_DATA = [
  { productCode: 'laptop-pro',     productName: '笔记本电脑 Pro', warehouseCode: 'wh-north', warehouseName: '华北仓库', quantity: 120, status: 'in_stock' },
  { productCode: 'laptop-pro',     productName: '笔记本电脑 Pro', warehouseCode: 'wh-east',  warehouseName: '华东仓库', quantity: 85,  status: 'in_stock' },
  { productCode: 'monitor-27',     productName: '27寸显示器',      warehouseCode: 'wh-north', warehouseName: '华北仓库', quantity: 200, status: 'in_stock' },
  { productCode: 'monitor-27',     productName: '27寸显示器',      warehouseCode: 'wh-south', warehouseName: '华南仓库', quantity: 0,   status: 'out_of_stock' },
  { productCode: 'keyboard-mech',  productName: '机械键盘',        warehouseCode: 'wh-east',  warehouseName: '华东仓库', quantity: 350, status: 'in_stock' },
  { productCode: 'mouse-wireless', productName: '无线鼠标',        warehouseCode: 'wh-west',  warehouseName: '西南仓库', quantity: 15,  status: 'low_stock' },
  { productCode: 'headset-bt',     productName: '蓝牙耳机',        warehouseCode: 'wh-north', warehouseName: '华北仓库', quantity: 500, status: 'in_stock' },
];

app.get('/api/inventory/query', (req, res) => {
  const productCode = req.query.product_code || '';
  const warehouseCode = req.query.warehouse_code || '';

  let results = INVENTORY_DATA;

  // 按产品编码过滤
  if (productCode) {
    results = results.filter(i => i.productCode === productCode);
  }
  // 按仓库编码过滤
  if (warehouseCode) {
    results = results.filter(i => i.warehouseCode === warehouseCode);
  }

  console.log(`[mock inventory] product="${productCode}" warehouse="${warehouseCode}" → ${results.length} items`);
  res.json({ data: results });
});

// ====================================================================
// 启动
// ====================================================================

app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`[mock third-party] listening on http://localhost:${PORT}`);
  console.log(`[mock third-party] 代理 secret = ${APP_SECRET} 永远不离开本进程`);
  console.log(`[mock third-party] 字典 API: http://localhost:${PORT}/api/dict/:type/list`);
  console.log(`[mock third-party] 可用字典类型: ${Object.keys(DICT_STORE).join(', ')}`);
  console.log(`[mock third-party] API Key(可选): demo-api-key-123`);
  console.log('========================================================');
});
