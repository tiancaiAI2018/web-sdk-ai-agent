package com.example.agent.extract;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 第三方通过 SDK 注册到后端的一个"工具"。
 *
 * <p>跟会话绑定(按 sessionId),可被同名 register 覆盖,可显式 unregister,可被
 * 30 分钟无活动定时器清理。
 *
 * <p>字段名严格白名单 {@link #NAME_PATTERN},description 走 {@link DescriptionGuard}
 * 做 prompt injection 过滤,parameters 我方只做"浅层结构校验",不跑完整 JSON Schema。
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RegisteredTool(
    String name,
    String description,
    Map<String, Object> parameters,
    boolean strict,
    Instant registeredAt,
    Instant lastUsedAt
) {

    /** 工具名白名单:全小写 + 数字 + 下划线,长度 1-32。 */
    public static final Pattern NAME_PATTERN = Pattern.compile("[a-z0-9_]{1,32}");

    /** JSON Schema 顶层允许的 type(本项目只支持 object 类型工具)。 */
    public static final Set<String> ALLOWED_ROOT_TYPES = Set.of("object");

    /** description 最大长度。 */
    public static final int MAX_DESCRIPTION_LENGTH = 500;

    /**
     * 紧凑 record,只含网络传输/校验需要的字段(不含时间戳)。
     * 时间戳在 {@link RegisteredTool#of} 里设。
     */
    public record Draft(String name, String description, Map<String, Object> parameters, boolean strict) {}

    /** 工厂:Draft + 当前时间 → 完整 RegisteredTool。 */
    public static RegisteredTool of(Draft d) {
        validateName(d.name());
        DescriptionGuard.check(d.description());
        validateParameters(d.parameters());
        Instant now = Instant.now();
        return new RegisteredTool(d.name(), d.description(), d.parameters(), d.strict, now, now);
    }

    /** 工具被命中(stream 激活)时刷新 lastUsedAt。 */
    public RegisteredTool touch() {
        return new RegisteredTool(name, description, parameters, strict, registeredAt, Instant.now());
    }

    private static void validateName(String name) {
        if (name == null || !NAME_PATTERN.matcher(name).matches()) {
            throw new IllegalArgumentException(
                "tool name must match " + NAME_PATTERN.pattern() + " (all lowercase, digits, underscore, 1-32 chars), got: " + name);
        }
    }

    private static void validateParameters(Map<String, Object> params) {
        if (params == null || params.isEmpty()) {
            throw new IllegalArgumentException("tool parameters must not be empty");
        }
        // 浅层结构校验:顶层有 type 字段,值在白名单
        Object type = params.get("type");
        if (type == null || !ALLOWED_ROOT_TYPES.contains(type.toString())) {
            throw new IllegalArgumentException(
                "tool parameters.type must be one of " + ALLOWED_ROOT_TYPES + ", got: " + type);
        }
        // properties 是 Map(允许缺失,空 properties 等于无参数)
        Object props = params.get("properties");
        if (props != null && !(props instanceof Map)) {
            throw new IllegalArgumentException("tool parameters.properties must be a JSON object");
        }
    }
}
