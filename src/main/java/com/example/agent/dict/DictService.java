package com.example.agent.dict;

import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 字典服务 —— 业务层,编排"粗筛 + 精排"两阶段匹配。
 *
 * <p>设计原则:
 * <ul>
 *   <li>高内聚:匹配逻辑全在 DictMatcher,数据获取全在 DictProvider</li>
 *   <li>低耦合:Service 不知道数据从哪来,也不知道怎么打分</li>
 *   <li>可扩展:新增字典类型只需注册 Provider,无需改 Service/Matcher</li>
 *   <li>高可用:同一 dictType 支持多 Provider,优先用远程,失败 fallback 到本地</li>
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

    /** dictType → Provider 列表(按注册顺序,先注册的优先) */
    private final java.util.concurrent.ConcurrentHashMap<String, CopyOnWriteArrayList<DictProvider>> providerLists =
        new java.util.concurrent.ConcurrentHashMap<>();

    public DictService(DictMatcher matcher, CascadeRegistry cascadeRegistry) {
        this.matcher = matcher;
        this.cascadeRegistry = cascadeRegistry;
    }

    /** 注册一个字典数据源(同一 type 可注册多个,按注册顺序优先使用) */
    public void registerProvider(DictProvider provider) {
        for (String type : provider.supportedTypes()) {
            providerLists.computeIfAbsent(type, k -> new CopyOnWriteArrayList<>()).add(provider);
        }
    }

    /**
     * 注册高优先级 Provider —— 插入到列表头部,优先于已注册的 Provider。
     * 用于 RestDictProvider(远程)优先于 StaticDictProvider(本地兜底)。
     */
    public void registerProviderFirst(DictProvider provider) {
        for (String type : provider.supportedTypes()) {
            CopyOnWriteArrayList<DictProvider> list =
                providerLists.computeIfAbsent(type, k -> new CopyOnWriteArrayList<>());
            list.add(0, provider);
        }
    }

    /**
     * 获取指定类型的可用 Provider。
     * 优先用第一个(通常是 RestDictProvider),如果返回空则 fallback 到下一个。
     */
    private DictProvider getProvider(String dictType) {
        CopyOnWriteArrayList<DictProvider> list = providerLists.get(dictType);
        return (list != null && !list.isEmpty()) ? list.get(0) : null;
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
        CopyOnWriteArrayList<DictProvider> list = providerLists.get(dictType);
        if (list == null || list.isEmpty()) return List.of();

        // 阶段1:粗筛 — 优先用第一个 Provider,返回空则 fallback 到下一个
        List<DictItem> candidates = null;
        for (DictProvider provider : list) {
            try {
                if (parentCode != null && !parentCode.isBlank()) {
                    candidates = provider.searchWithParent(dictType, keyword, parentCode, limit * 3);
                } else {
                    candidates = provider.search(dictType, keyword, limit * 3);
                }
                if (candidates != null && !candidates.isEmpty()) break;
            } catch (Exception e) {
                // 远程 Provider 失败,继续尝试下一个
            }
        }
        if (candidates == null || candidates.isEmpty()) return List.of();

        // 阶段2:精排
        return matcher.rank(candidates, keyword, limit);
    }

    /** 按编码精确查询(提交校验用) */
    public DictItem getByCode(String dictType, String code) {
        DictProvider provider = getProvider(dictType);
        return provider == null ? null : provider.getByCode(dictType, code);
    }

    /** 全量查询(下拉场景) */
    public List<DictItem> listAll(String dictType) {
        DictProvider provider = getProvider(dictType);
        return provider == null ? List.of() : provider.listAll(dictType);
    }

    /** 按父级编码过滤查询(级联下拉场景) */
    public List<DictItem> listByParent(String dictType, String parentCode) {
        DictProvider provider = getProvider(dictType);
        return provider == null ? List.of() : provider.listByParent(dictType, parentCode);
    }

    /** 查询所有已注册的字典类型 */
    public Set<String> supportedTypes() {
        return providerLists.keySet();
    }

    /** 获取级联注册表 */
    public CascadeRegistry getCascadeRegistry() {
        return cascadeRegistry;
    }
}
