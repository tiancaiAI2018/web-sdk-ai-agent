package com.example.agent.dict;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 字典查询接口 —— 供 AI 的 query_dict 工具调用。
 *
 * <p>已加入 JWT 白名单(/dict/),因为 AI 工具的 onCall 从浏览器直接调用,不带 JWT。
 * <p>两个端点:
 * <ul>
 *   <li>GET /dict/{dictType}/query?keyword=北京&limit=5 — 模糊查询(粗筛+精排)</li>
 *   <li>GET /dict/{dictType}/list — 全量下拉</li>
 * </ul>
 */
@RestController
@RequestMapping("/dict")
@Tag(name = "04 字典查询", description = "字典数据模糊查询,供 AI 工具调用(免 JWT)")
public class DictController {

    private final DictService dictService;

    public DictController(DictService dictService) {
        this.dictService = dictService;
    }

    @GetMapping("/{dictType}/query")
    @Operation(summary = "字典模糊查询",
        description = "多级匹配:精确→包含→去后缀→别名→bigram Jaccard→编辑距离。"
                    + "返回 code + name + matchType + score,供 AI 判断选哪个。")
    public Mono<ResponseEntity<List<Map<String, Object>>>> query(
            @PathVariable String dictType,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "5") int limit) {

        List<MatchResult> results = dictService.match(dictType, keyword, limit);

        List<Map<String, Object>> body = results.stream()
            .map(r -> Map.<String, Object>of(
                "code", r.item().code(),
                "name", r.item().name(),
                "matchType", r.matchType(),
                "score", r.score()
            ))
            .collect(Collectors.toList());

        return Mono.just(ResponseEntity.ok(body));
    }

    @GetMapping("/{dictType}/list")
    @Operation(summary = "字典全量列表",
        description = "返回该字典类型的全部条目,适用于下拉选择场景。大字典不建议调用。")
    public Mono<ResponseEntity<List<Map<String, Object>>>> list(
            @PathVariable String dictType) {

        List<DictItem> items = dictService.listAll(dictType);
        List<Map<String, Object>> body = items.stream()
            .map(i -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("code", i.code());
                m.put("name", i.name());
                if (i.parent() != null) m.put("parent", i.parent());
                if (i.aliases() != null && !i.aliases().isEmpty()) m.put("aliases", i.aliases());
                return m;
            })
            .collect(Collectors.toList());

        return Mono.just(ResponseEntity.ok(body));
    }

    @GetMapping("/types")
    @Operation(summary = "列出所有字典类型")
    public Mono<ResponseEntity<Map<String, Object>>> types() {
        return Mono.just(
            ResponseEntity.ok(Map.of("types", dictService.supportedTypes())));
    }
}
