package com.example.agent.dict;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * 级联关系注册表 —— 集中管理字典间的父子联动关系。
 *
 * <p>设计原则:
 * <ul>
 *   <li>单一职责:只管级联关系的注册和查询,不管数据怎么拉</li>
 *   <li>高内聚:所有级联元数据都在这里,前端/AI 工具都从这里取</li>
 *   <li>低耦合:DictService 依赖此注册表做 parentCode 过滤,但不关心注册表怎么初始化</li>
 * </ul>
 */
public class CascadeRegistry {

    private final List<CascadeLink> links = new ArrayList<>();

    /** 注册一条级联关系 */
    public void register(CascadeLink link) {
        // 防重复
        boolean exists = links.stream()
            .anyMatch(l -> l.parentType().equals(link.parentType())
                        && l.childType().equals(link.childType()));
        if (!exists) {
            links.add(link);
        }
    }

    /** 批量注册 */
    public void registerAll(List<CascadeLink> list) {
        list.forEach(this::register);
    }

    /** 查询某字典类型作为父级的所有级联关系(即它的子字典有哪些) */
    public List<CascadeLink> childrenOf(String parentType) {
        return links.stream()
            .filter(l -> l.parentType().equals(parentType))
            .toList();
    }

    /** 查询某字典类型作为子级的级联关系(即它的父字典是谁) */
    public Optional<CascadeLink> parentOf(String childType) {
        return links.stream()
            .filter(l -> l.childType().equals(childType))
            .findFirst();
    }

    /** 返回全部级联关系(不可变) */
    public List<CascadeLink> all() {
        return Collections.unmodifiableList(links);
    }

    /** 判断某字典类型是否是子字典(有父级) */
    public boolean isChild(String dictType) {
        return links.stream().anyMatch(l -> l.childType().equals(dictType));
    }

    /** 判断某字典类型是否是父字典(有子级) */
    public boolean isParent(String dictType) {
        return links.stream().anyMatch(l -> l.parentType().equals(dictType));
    }
}
