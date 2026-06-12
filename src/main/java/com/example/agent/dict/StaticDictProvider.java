package com.example.agent.dict;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 内存字典数据源 —— 开发/测试用,数据硬编码在代码里。
 *
 * <p>生产环境替换为 JdbcDictProvider / RedisDictProvider 即可,
 * DictService 和 DictMatcher 无需任何改动。
 *
 * <p>粗筛策略:内存数据量小,直接做 contains 过滤返回候选集。
 */
public class StaticDictProvider implements DictProvider {

    /** dictType → 条目列表 */
    private final Map<String, List<DictItem>> data = new ConcurrentHashMap<>();

    /** 注册一个字典类型的全部条目 */
    public void register(String dictType, List<DictItem> items) {
        data.put(dictType, new ArrayList<>(items));
    }

    @Override
    public Set<String> supportedTypes() {
        return data.keySet();
    }

    @Override
    public List<DictItem> search(String dictType, String keyword, int limit) {
        List<DictItem> items = data.get(dictType);
        if (items == null || keyword == null || keyword.isBlank()) return List.of();

        String kw = keyword.trim();
        List<DictItem> candidates = new ArrayList<>();

        for (DictItem item : items) {
            // name 或 aliases 包含关键词 → 纳入候选
            if (item.name().contains(kw)) {
                candidates.add(item);
                continue;
            }
            if (item.aliases() != null) {
                for (String alias : item.aliases()) {
                    if (alias.contains(kw)) {
                        candidates.add(item);
                        break;
                    }
                }
            }
        }

        // 粗筛多取,给 Matcher 留精排空间
        return candidates.size() <= limit * 3
            ? candidates
            : candidates.subList(0, limit * 3);
    }

    @Override
    public DictItem getByCode(String dictType, String code) {
        List<DictItem> items = data.get(dictType);
        if (items == null || code == null) return null;
        return items.stream()
            .filter(i -> code.equals(i.code()))
            .findFirst()
            .orElse(null);
    }

    @Override
    public List<DictItem> listAll(String dictType) {
        return data.getOrDefault(dictType, List.of());
    }
}
