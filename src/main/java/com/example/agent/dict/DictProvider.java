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
}
