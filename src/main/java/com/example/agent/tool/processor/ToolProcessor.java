package com.example.agent.tool.processor;

import java.util.Map;

/**
 * 工具处理器接口 —— 所有处理策略实现此接口。
 *
 * 处理器负责对第三方 API 返回的原始数据进行加工,
 * 不同场景需要不同的处理策略:
 * - fuzzy_match: 模糊搜索+精排(字典查询场景)
 * - passthrough: 原样透传(库存查询、订单状态等)
 * - filter: 条件过滤
 * - transform: 字段映射转换
 */
public interface ToolProcessor {

    /** 处理器类型标识(如 "fuzzy_match", "passthrough") */
    String type();

    /**
     * 处理第三方原始数据,返回给 LLM 的结果。
     *
     * @param rawResponse 第三方 API 返回的原始数据(已解析为对象)
     * @param toolArgs    LLM 传入的工具参数
     * @param config      处理器配置(从 ServerTool.processorConfig 解析)
     * @return 处理后的结果(将被序列化为 JSON 返回给 LLM)
     */
    Object process(Object rawResponse, Map<String, Object> toolArgs, ProcessorConfig config);
}
