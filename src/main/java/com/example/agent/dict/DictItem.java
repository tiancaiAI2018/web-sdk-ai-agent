package com.example.agent.dict;

import java.util.List;
import java.util.Map;

/**
 * 字典条目 —— 数据模型,与数据源解耦。
 *
 * <p>各字段含义:
 * <ul>
 *   <li>code: 系统编码,后端接口要的值(如 "0001")</li>
 *   <li>name: 显示名,用户/AI 看到的(如 "北京")</li>
 *   <li>parent: 父级编码,支持级联字典(如 "00" 表示华北地区)</li>
 *   <li>aliases: 别名列表,匹配时也命中(如 ["蚂蚁金服","蚂蚁金服集团"])</li>
 *   <li>extra: 扩展字段,按需放(如排序权重、拼音等)</li>
 * </ul>
 */
public record DictItem(
    String code,
    String name,
    String parent,
    List<String> aliases,
    Map<String, String> extra
) {
    /** 精简构造:无 parent/aliases/extra */
    public DictItem(String code, String name) {
        this(code, name, null, List.of(), Map.of());
    }

    /** 带 aliases 的构造 */
    public DictItem(String code, String name, List<String> aliases) {
        this(code, name, null, aliases, Map.of());
    }

    /** 带 parent 的构造(级联字典) */
    public DictItem(String code, String name, String parent, List<String> aliases) {
        this(code, name, parent, aliases, Map.of());
    }
}
