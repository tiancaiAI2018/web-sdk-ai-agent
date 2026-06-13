package com.example.agent.dict;

import java.util.List;
import java.util.Set;

/**
 * 字典数据源接口 —— 可插拔,高内聚低耦合核心。
 *
 * <p>职责单一:从存储层粗筛候选集,不做精排(精排是 DictMatcher 的事)。
 * <p>实现:各数据源自行决定粗筛策略(SQL LIKE / Redis SCAN / 内存过滤)。
 *
 * <p>已有实现:
 * <ul>
 *   <li>{@link StaticDictProvider} — 内存/JSON,开发测试用</li>
 *   <li>JdbcDictProvider — 数据库(待实现)</li>
 *   <li>RedisDictProvider — Redis(待实现)</li>
 * </ul>
 */
public interface DictProvider {

    /** 本 Provider 支持的字典类型标识(如 "city", "product") */
    Set<String> supportedTypes();

    /**
     * 粗筛:根据关键词从存储层返回候选集。
     *
     * <p>不要求精确,宁可多返回(由 DictMatcher 精排过滤),
     * 但要尽量少返回(减少网络/内存开销)。
     *
     * @param dictType 字典类型
     * @param keyword  搜索关键词
     * @param limit    建议返回条数上限(Provider 可多取,给 Matcher 留精排空间)
     * @return 候选列表
     */
    List<DictItem> search(String dictType, String keyword, int limit);

    /**
     * 按编码精确查询(提交校验用)。
     *
     * @param dictType 字典类型
     * @param code     编码
     * @return 对应条目,不存在返回 null
     */
    DictItem getByCode(String dictType, String code);

    /**
     * 全量查询(下拉场景,小字典适用)。
     *
     * @param dictType 字典类型
     * @return 该类型的全部条目
     */
    List<DictItem> listAll(String dictType);

    /**
     * 按父级编码过滤查询(级联字典场景)。
     *
     * <p>返回 parent 字段等于 parentCode 的全部条目。
     * 非级联字典调用时返回空列表。
     *
     * @param dictType   字典类型
     * @param parentCode 父级编码
     * @return 匹配的条目列表
     */
    default List<DictItem> listByParent(String dictType, String parentCode) {
        return List.of();
    }

    /**
     * 粗筛 + 父级过滤(级联字典的模糊查询)。
     *
     * <p>先按 parentCode 过滤,再对结果做关键词粗筛。
     * 默认实现:先 listByParent,再内存 search。
     *
     * @param dictType   字典类型
     * @param keyword    搜索关键词
     * @param parentCode 父级编码(可选,null 表示不过滤)
     * @param limit      建议返回条数上限
     * @return 候选列表
     */
    default List<DictItem> searchWithParent(String dictType, String keyword, String parentCode, int limit) {
        if (parentCode == null || parentCode.isBlank()) {
            return search(dictType, keyword, limit);
        }
        // 先按父级过滤,再在子集中做关键词匹配
        List<DictItem> children = listByParent(dictType, parentCode);
        if (keyword == null || keyword.isBlank()) {
            return children.size() <= limit ? children : children.subList(0, limit);
        }
        String kw = keyword.trim();
        List<DictItem> result = new java.util.ArrayList<>();
        for (DictItem item : children) {
            if (item.name().contains(kw)) { result.add(item); continue; }
            if (item.aliases() != null) {
                for (String alias : item.aliases()) {
                    if (alias.contains(kw)) { result.add(item); break; }
                }
            }
        }
        return result.size() <= limit ? result : result.subList(0, limit);
    }
}
