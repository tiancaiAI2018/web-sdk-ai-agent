package com.example.agent.dict;

/**
 * 级联关系定义 —— 描述两个字典类型之间的父子联动关系。
 *
 * <p>示例:
 * <pre>
 *   CascadeLink("device_type", "device_model")
 *   // 含义: device_model 是 device_type 的子字典,
 *   //       device_model 条目的 parent 字段存的是 device_type 的 code
 * </pre>
 *
 * <p>AI 工具侧:注册后,query_dict 的 description 自动注入级联提示,
 * 告诉 AI "查 device_model 前必须先确定 device_type 的编码"。
 * <p>前端侧:注册后,/dict/cascade/meta 返回级联元数据,
 * 前端自动绑定"父下拉 change → 重载子下拉"。
 */
public record CascadeLink(
    /** 父字典类型(如 "device_type") */
    String parentType,
    /** 子字典类型(如 "device_model") */
    String childType,
    /** 子表中指向父级的字段名,默认 "parent" */
    String joinField
) {
    /** 简化构造:joinField 默认 "parent" */
    public CascadeLink(String parentType, String childType) {
        this(parentType, childType, "parent");
    }
}
