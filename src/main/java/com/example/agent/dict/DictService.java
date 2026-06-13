package com.example.agent.dict;

import java.util.List;
import java.util.Set;

/**
 * 字典服务 —— 业务层,编排"粗筛 + 精排"两阶段匹配。
 *
 * <p>设计原则:
 * <ul>
 *   <li>高内聚:匹配逻辑全在 DictMatcher,数据获取全在 DictProvider</li>
 *   <li>低耦合:Service 不知道数据从哪来,也不知道怎么打分</li>
 *   <li>可扩展:新增字典类型只需注册 Provider,无需改 Service/Matcher</li>
 * </ul>
 *
 * <p>数据流:
 * <pre>
 *   keyword → Provider.search() 粗筛(15条) → Matcher.rank() 精排 → Top N
 *   keyword + parentCode → Provider.searchWithParent() 粗筛 → Matcher.rank() 精排 → Top N
 * </pre>
 */
public class DictService {

    private final DictMatcher matcher;
    private final CascadeRegistry cascadeRegistry;
    /** dictType → Provider */
    private final java.util.concurrent.ConcurrentHashMap<String, DictProvider> providers =
        new java.util.concurrent.ConcurrentHashMap<>();

    public DictService(DictMatcher matcher, CascadeRegistry cascadeRegistry) {
        this.matcher = matcher;
        this.cascadeRegistry = cascadeRegistry;
    }

    /** 注册一个字典数据源 */
    public void registerProvider(DictProvider provider) {
        for (String type : provider.supportedTypes()) {
            providers.put(type, provider);
        }
    }

    /**
     * 综合查询:Provider 粗筛 → Matcher 精排。
     *
     * @param dictType 字典类型(如 "city", "product")
     * @param keyword  搜索关键词
     * @param limit    返回条数上限
     * @return 按 score 降序排列的匹配结果
     */
    public List<MatchResult> match(String dictType, String keyword, int limit) {
        return match(dictType, keyword, null, limit);
    }

    /**
     * 综合查询(支持级联):Provider 粗筛 → Matcher 精排。
     *
     * <p>如果传了 parentCode,会先按父级过滤候选集,再精排。
     * 这样"小米14"在电脑和手机下有同名条目时,只返回对应父级下的结果。
     *
     * @param dictType   字典类型
     * @param keyword    搜索关键词
     * @param parentCode 父级编码(可选,null 不过滤)
     * @param limit      返回条数上限
     * @return 按 score 降序排列的匹配结果
     */
    public List<MatchResult> match(String dictType, String keyword, String parentCode, int limit) {
        DictProvider provider = providers.get(dictType);
        if (provider == null) return List.of();

        // 阶段1:粗筛(带 parentCode 过滤)
        List<DictItem> candidates;
        if (parentCode != null && !parentCode.isBlank()) {
            candidates = provider.searchWithParent(dictType, keyword, parentCode, limit * 3);
        } else {
            candidates = provider.search(dictType, keyword, limit * 3);
        }

        // 阶段2:精排
        return matcher.rank(candidates, keyword, limit);
    }

    /** 按编码精确查询(提交校验用) */
    public DictItem getByCode(String dictType, String code) {
        DictProvider provider = providers.get(dictType);
        return provider == null ? null : provider.getByCode(dictType, code);
    }

    /** 全量查询(下拉场景) */
    public List<DictItem> listAll(String dictType) {
        DictProvider provider = providers.get(dictType);
        return provider == null ? List.of() : provider.listAll(dictType);
    }

    /** 按父级编码过滤查询(级联下拉场景) */
    public List<DictItem> listByParent(String dictType, String parentCode) {
        DictProvider provider = providers.get(dictType);
        return provider == null ? List.of() : provider.listByParent(dictType, parentCode);
    }

    /** 查询所有已注册的字典类型 */
    public Set<String> supportedTypes() {
        return providers.keySet();
    }

    /** 获取级联注册表 */
    public CascadeRegistry getCascadeRegistry() {
        return cascadeRegistry;
    }
}
