package com.example.agent.tool.processor;

import java.util.Map;

/**
 * 透传处理器 —— 原样返回第三方 API 的响应数据。
 *
 * 适用于不需要后处理的场景,如:
 * - 库存查询: 第三方返回什么,AI 就看到什么
 * - 订单状态查询: 直接透传
 * - 通用 API 代理: AI 后端只做认证和转发
 *
 * processorConfig 配置项:
 * - responsePath: 响应数据路径(如 "data", "result.items"),不填则返回整个响应
 */
public class PassthroughProcessor implements ToolProcessor {

    @Override
    public String type() {
        return "passthrough";
    }

    @Override
    public Object process(Object rawResponse, Map<String, Object> toolArgs, ProcessorConfig config) {
        // 如果配置了 responsePath,从响应中提取指定路径的数据
        String responsePath = config.getString("responsePath", "");
        if (responsePath.isEmpty()) {
            return rawResponse;
        }

        // 按点号分隔路径逐层提取(如 "data.items")
        Object current = rawResponse;
        for (String key : responsePath.split("\\.")) {
            if (key.isEmpty()) continue;
            if (current instanceof Map<?, ?> map) {
                current = map.get(key);
            } else {
                return rawResponse; // 路径不匹配,返回原始响应
            }
        }
        return current != null ? current : rawResponse;
    }
}
