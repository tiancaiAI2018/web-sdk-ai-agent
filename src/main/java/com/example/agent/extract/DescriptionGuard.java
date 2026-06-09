package com.example.agent.extract;

import java.util.regex.Pattern;

/**
 * description 注入特征黑名单。任一命中即抛 IllegalArgumentException(由 controller 翻 400)。
 *
 * <p>不全面(用关键词永远有漏网之鱼),P4 改进:用小 LLM 二次审核。MVP 阶段拦截
 * 最常见的"忽略上文 / 你是 X / system 注入"等明显攻击。
 */
public final class DescriptionGuard {

    private DescriptionGuard() {}

    /** 黑名单正则,任一命中即拒。 */
    static final Pattern[] INJECTION_PATTERNS = new Pattern[] {
        // "ignore the above/previous/system"
        Pattern.compile("(?i)ignore\\s+(the\\s+)?(above|previous|system)"),
        // "you are (now|a|an) ..." — 注意:(?!an? assistant) 排除"你是一个助手"这种正常用法
        Pattern.compile("(?i)you\\s+are\\s+(now\\s+|a\\s+|an\\s+)?(?!an?\\s+assistant)"),
        // "system: ..." 或 "system：..."
        Pattern.compile("(?i)system\\s*[:：]"),
        // Anthropic / OpenAI 特殊 token
        Pattern.compile("(?i)<\\|im_start\\|>|<\\|im_end\\|>|<\\|endoftext\\|>"),
        // "disregard / forget / new instructions"
        Pattern.compile("(?i)\\b(disregard|forget|new\\s+instructions)\\b"),
        // "override system prompt / jailbreak"
        Pattern.compile("(?i)\\b(override|jailbreak|bypass)\\b\\s+\\w*\\s*(system|prompt|safety)?"),
    };

    /**
     * 校验 description 合规。空 description 允许(MVP 简化,但 SDK 应该总给)。
     *
     * @throws IllegalArgumentException 长度超限 / 含注入特征
     */
    public static void check(String description) {
        if (description == null) return;
        if (description.length() > RegisteredTool.MAX_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException(
                "description too long (max " + RegisteredTool.MAX_DESCRIPTION_LENGTH + " chars, got "
                    + description.length() + ")");
        }
        for (Pattern p : INJECTION_PATTERNS) {
            if (p.matcher(description).find()) {
                throw new IllegalArgumentException(
                    "description rejected: contains prompt-injection pattern: " + p.pattern());
            }
        }
    }
}
