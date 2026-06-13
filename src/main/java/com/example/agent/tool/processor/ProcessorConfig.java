package com.example.agent.tool.processor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * 处理器配置 —— 从 ServerTool.processorConfig JSON 解析而来。
 *
 * 不同处理器使用不同的配置项:
 * - fuzzy_match: matchFields, minScore, keywordArg, limitArg, parentArg
 * - passthrough: responsePath
 * - filter: filterRules
 * - transform: fieldMapping
 *
 * 采用宽松解析:不存在的字段返回默认值,不报错。
 */
public class ProcessorConfig {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final Map<String, Object> data;

    public ProcessorConfig(String json) {
        this.data = parseJson(json);
    }

    public ProcessorConfig() {
        this.data = Map.of();
    }

    /** 获取字符串配置项 */
    public String getString(String key, String defaultValue) {
        Object v = data.get(key);
        return v instanceof String s ? s : defaultValue;
    }

    /** 获取整数配置项 */
    public int getInt(String key, int defaultValue) {
        Object v = data.get(key);
        return v instanceof Number n ? n.intValue() : defaultValue;
    }

    /** 获取双精度配置项 */
    public double getDouble(String key, double defaultValue) {
        Object v = data.get(key);
        return v instanceof Number n ? n.doubleValue() : defaultValue;
    }

    /** 获取列表配置项 */
    @SuppressWarnings("unchecked")
    public List<String> getStringList(String key, List<String> defaultValue) {
        Object v = data.get(key);
        if (v instanceof List<?> list) {
            List<String> result = new ArrayList<>();
            for (Object item : list) {
                if (item instanceof String s) result.add(s);
            }
            return result;
        }
        return defaultValue;
    }

    /** 获取布尔配置项 */
    public boolean getBoolean(String key, boolean defaultValue) {
        Object v = data.get(key);
        return v instanceof Boolean b ? b : defaultValue;
    }

    /** 获取原始 Map */
    public Map<String, Object> asMap() {
        return data;
    }

    private static Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = MAPPER.readValue(json, Map.class);
            return result != null ? result : Map.of();
        } catch (Exception e) {
            return Map.of();
        }
    }
}
