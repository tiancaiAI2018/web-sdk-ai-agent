package com.example.agent.tool.processor;

import com.example.agent.dict.DictItem;
import com.example.agent.dict.DictMatcher;
import com.example.agent.dict.MatchResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * 模糊匹配处理器 —— 对第三方 API 返回的字典数据进行粗筛+精排。
 *
 * 处理流程:
 * 1. 从第三方 API 响应中解析出候选项列表
 * 2. 用 keyword 参数进行模糊搜索(DictMatcher 精排)
 * 3. 返回按 score 降序排列的匹配结果
 *
 * processorConfig 配置项:
 * - keywordArg: keyword 参数名(默认 "keyword")
 * - limitArg: limit 参数名(默认 "limit")
 * - parentArg: parentCode 参数名(默认 "parent_code")
 * - codeField: 编码字段名(默认 "code")
 * - nameField: 名称字段名(默认 "name")
 * - aliasesField: 别名字段名(默认 "aliases")
 * - parentField: 父级字段名(默认 "parent")
 * - defaultLimit: 默认返回条数(默认 5)
 * - maxLimit: 最大返回条数(默认 20)
 */
public class FuzzyMatchProcessor implements ToolProcessor {

    private static final Logger log = LoggerFactory.getLogger(FuzzyMatchProcessor.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final DictMatcher matcher;

    public FuzzyMatchProcessor(DictMatcher matcher) {
        this.matcher = matcher;
    }

    @Override
    public String type() {
        return "fuzzy_match";
    }

    @Override
    public Object process(Object rawResponse, Map<String, Object> toolArgs, ProcessorConfig config) {
        // 从工具参数中提取搜索条件
        String keywordArg = config.getString("keywordArg", "keyword");
        String limitArg = config.getString("limitArg", "limit");
        String parentArg = config.getString("parentArg", "parent_code");
        int defaultLimit = config.getInt("defaultLimit", 5);
        int maxLimit = config.getInt("maxLimit", 20);

        String keyword = (String) toolArgs.get(keywordArg);
        String parentCode = (String) toolArgs.get(parentArg);
        int limit = defaultLimit;
        if (toolArgs.containsKey(limitArg)) {
            limit = Math.min(((Number) toolArgs.get(limitArg)).intValue(), maxLimit);
        }

        if (keyword == null || keyword.isBlank()) {
            return Map.of("error", "keyword is required");
        }

        // 解析第三方 API 响应为 DictItem 列表
        List<DictItem> candidates = parseResponse(rawResponse, config);
        if (candidates.isEmpty()) {
            return Map.of("keyword", keyword, "results", List.of());
        }

        // 用 DictMatcher 精排
        List<MatchResult> results = matcher.rank(candidates, keyword, limit);

        return Map.of(
            "keyword", keyword,
            "results", results.stream().map(r -> Map.of(
                "code", r.item().code(),
                "name", r.item().name(),
                "score", r.score(),
                "aliases", r.item().aliases() != null ? r.item().aliases() : List.of()
            )).toList()
        );
    }

    /** 将第三方 API 响应解析为 DictItem 列表 */
    private List<DictItem> parseResponse(Object rawResponse, ProcessorConfig config) {
        try {
            String json = MAPPER.writeValueAsString(rawResponse);
            JsonNode root = MAPPER.readTree(json);

            // 支持两种格式: 直接数组 或 { data: [...] }
            JsonNode items = root.isArray() ? root : root.path("data");
            if (!items.isArray()) return List.of();

            String codeField = config.getString("codeField", "code");
            String nameField = config.getString("nameField", "name");
            String aliasesField = config.getString("aliasesField", "aliases");
            String parentField = config.getString("parentField", "parent");

            List<DictItem> result = new ArrayList<>();
            for (JsonNode item : items) {
                String code = getText(item, codeField);
                String name = getText(item, nameField);
                List<String> aliases = parseAliases(item, aliasesField);
                String parent = getText(item, parentField);

                if (code != null && name != null) {
                    result.add(new DictItem(code, name, parent, aliases));
                }
            }
            return result;
        } catch (Exception e) {
            log.warn("[FuzzyMatchProcessor] parse failed: {}", e.getMessage());
            return List.of();
        }
    }

    private String getText(JsonNode node, String field) {
        JsonNode f = node.path(field);
        return f.isMissingNode() ? null : f.asText();
    }

    private List<String> parseAliases(JsonNode item, String field) {
        JsonNode aliasesNode = item.path(field);
        if (aliasesNode.isArray()) {
            List<String> list = new ArrayList<>();
            aliasesNode.forEach(n -> list.add(n.asText()));
            return list;
        }
        return List.of();
    }
}
