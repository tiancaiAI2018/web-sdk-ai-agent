package com.example.agent.dict;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 字典匹配算法引擎 —— 纯函数,无状态,高内聚。
 *
 * <p>设计原则:
 * <ul>
 *   <li>只对 List&lt;DictItem&gt; 打分排序,不关心数据从哪来</li>
 *   <li>无成员变量,线程安全,可单例复用</li>
 *   <li>三层策略:规则匹配 → bigram Jaccard → 编辑距离(兜底)</li>
 * </ul>
 *
 * <p>使用方式:
 * <pre>
 *   DictMatcher matcher = new DictMatcher();  // 或注入单例
 *   List&lt;MatchResult&gt; top5 = matcher.rank(candidates, "北京市", 5);
 * </pre>
 */
public class DictMatcher {

    // ---- 中文行政区划后缀(匹配时去掉,按长度降序优先匹配长后缀) ----
    private static final List<String> REGION_SUFFIXES = List.of(
        "壮族自治区", "回族自治区", "维吾尔自治区", "特别行政区",
        "自治区", "自治州", "地区", "盟", "旗",
        "市", "省", "区", "县"
    );

    // ---- 企业/组织后缀 ----
    private static final List<String> ORG_SUFFIXES = List.of(
        "有限责任公司", "股份有限公司", "有限合伙",
        "有限公司", "集团", "公司"
    );

    // 合并 + 按长度降序(优先匹配长后缀)
    private static final List<String> ALL_SUFFIXES;
    static {
        List<String> merged = new ArrayList<>();
        merged.addAll(REGION_SUFFIXES);
        merged.addAll(ORG_SUFFIXES);
        merged.sort((a, b) -> b.length() - a.length());
        ALL_SUFFIXES = List.copyOf(merged);
    }

    /**
     * 对候选集打分排序,返回 Top N。
     *
     * @param candidates 粗筛后的候选集(来自 DictProvider)
     * @param keyword    用户/AI 输入的关键词
     * @param limit      返回条数上限
     * @return 按 score 降序排列的匹配结果
     */
    public List<MatchResult> rank(List<DictItem> candidates, String keyword, int limit) {
        if (candidates == null || candidates.isEmpty() || keyword == null || keyword.isBlank()) {
            return List.of();
        }

        List<MatchResult> results = new ArrayList<>();

        // 第1层:规则匹配(最快,覆盖 80% 场景)
        for (DictItem item : candidates) {
            Double score = ruleMatch(item, keyword);
            if (score != null) {
                results.add(new MatchResult(item, "rule", score));
            }
        }
        if (!results.isEmpty()) {
            return topN(results, limit);
        }

        // 第2层:bigram Jaccard 相似度
        Set<String> kwBigrams = bigrams(keyword);
        for (DictItem item : candidates) {
            double jaccard = jaccardSimilarity(kwBigrams, bigrams(item.name()));
            if (jaccard >= 0.3) {
                results.add(new MatchResult(item, "bigram", jaccard));
            }
            // 别名也算 Jaccard
            if (item.aliases() != null) {
                for (String alias : item.aliases()) {
                    double aliasJaccard = jaccardSimilarity(kwBigrams, bigrams(alias));
                    if (aliasJaccard >= 0.3 && aliasJaccard > jaccard) {
                        // 替换为别名匹配的较高分
                        results.removeIf(r -> r.item() == item && "bigram".equals(r.matchType()));
                        results.add(new MatchResult(item, "bigram_alias", aliasJaccard));
                    }
                }
            }
        }
        if (!results.isEmpty()) {
            return topN(results, limit);
        }

        // 第3层:编辑距离(兜底,仅短文本)
        if (keyword.length() <= 8) {
            for (DictItem item : candidates) {
                if (item.name().length() <= 8) {
                    double score = editDistanceScore(keyword, item.name());
                    if (score >= 0.5) {
                        results.add(new MatchResult(item, "edit_distance", score));
                    }
                }
            }
        }

        return topN(results, limit);
    }

    // ====================================================================
    // 第1层:规则匹配
    // ====================================================================

    private Double ruleMatch(DictItem item, String keyword) {
        // 精确匹配
        if (item.name().equals(keyword)) return 1.0;
        // 别名精确
        if (item.aliases() != null && item.aliases().contains(keyword)) return 0.75;
        // 双向包含
        if (item.name().contains(keyword) || keyword.contains(item.name())) return 0.8;
        // 去后缀匹配
        String strippedKw = stripSuffix(keyword);
        String strippedName = stripSuffix(item.name());
        if (strippedKw.equals(strippedName)) return 0.7;
        if (strippedName.contains(strippedKw) || strippedKw.contains(strippedName)) return 0.6;
        return null;
    }

    private String stripSuffix(String text) {
        for (String suffix : ALL_SUFFIXES) {
            if (text.endsWith(suffix)) {
                return text.substring(0, text.length() - suffix.length());
            }
        }
        return text;
    }

    // ====================================================================
    // 第2层:bigram Jaccard
    // ====================================================================

    /** 把文本切成相邻字符对(bigram) */
    Set<String> bigrams(String text) {
        Set<String> set = new LinkedHashSet<>();
        for (int i = 0; i < text.length() - 1; i++) {
            set.add(text.substring(i, i + 2));
        }
        return set;
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / union.size();
    }

    // ====================================================================
    // 第3层:编辑距离
    // ====================================================================

    private double editDistanceScore(String a, String b) {
        int dist = editDistance(a, b);
        return 1.0 - (double) dist / Math.max(a.length(), b.length());
    }

    private int editDistance(String a, String b) {
        int[] prev = new int[b.length() + 1];
        int[] curr = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) prev[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            curr[0] = i;
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(Math.min(prev[j] + 1, curr[j - 1] + 1), prev[j - 1] + cost);
            }
            int[] tmp = prev; prev = curr; curr = tmp;
        }
        return prev[b.length()];
    }

    // ====================================================================
    // 工具方法
    // ====================================================================

    private List<MatchResult> topN(List<MatchResult> results, int limit) {
        return results.stream()
            .sorted()
            .limit(limit)
            .collect(Collectors.toList());
    }
}
