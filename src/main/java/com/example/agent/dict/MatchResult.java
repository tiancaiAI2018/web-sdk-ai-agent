package com.example.agent.dict;

/**
 * 匹配结果 —— DictMatcher 的输出。
 *
 * <p>matchType 取值:
 * <ul>
 *   <li>exact: 精确匹配(name == keyword)</li>
 *   <li>alias: 别名精确匹配</li>
 *   <li>contains: 双向包含(name.contains(kw) 或 kw.contains(name))</li>
 *   <li>suffix_stripped: 去后缀后匹配(如 "北京市" → "北京")</li>
 *   <li>bigram: bigram Jaccard 相似度</li>
 *   <li>edit_distance: 编辑距离</li>
 * </ul>
 */
public record MatchResult(
    DictItem item,
    String matchType,
    double score
) implements Comparable<MatchResult> {
    @Override
    public int compareTo(MatchResult o) {
        // 按 score 降序
        return Double.compare(o.score, this.score);
    }
}
