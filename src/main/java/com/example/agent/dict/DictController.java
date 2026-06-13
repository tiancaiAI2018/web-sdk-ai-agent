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
 * <p>端点:
 * <ul>
 *   <li>GET /dict/{dictType}/query?keyword=北京&limit=5&parentCode=001 — 模糊查询(粗筛+精排)</li>
 *   <li>GET /dict/{dictType}/list?parentCode=001 — 全量/按父级下拉</li>
 *   <li>GET /dict/types — 列出所有字典类型</li>
 *   <li>GET /dict/cascade/meta — 级联关系元数据(前端自动绑定联动)</li>
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
                    + "支持 parentCode 过滤(级联字典场景)。"
                    + "返回 code + name + matchType + score,供 AI 判断选哪个。")
    public Mono<ResponseEntity<List<Map<String, Object>>>> query(
            @PathVariable String dictType,
            @RequestParam String keyword,
            @RequestParam(required = false) String parentCode,
            @RequestParam(defaultValue = "5") int limit) {

        List<MatchResult> results = dictService.match(dictType, keyword, parentCode, limit);

        List<Map<String, Object>> body = results.stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("code", r.item().code());
                m.put("name", r.item().name());
                m.put("matchType", r.matchType());
                m.put("score", r.score());
                if (r.item().parent() != null) m.put("parent", r.item().parent());
                return m;
            })
            .collect(Collectors.toList());

        return Mono.just(ResponseEntity.ok(body));
    }

    @GetMapping("/{dictType}/list")
    @Operation(summary = "字典全量列表",
        description = "返回该字典类型的全部条目。支持 parentCode 过滤(级联下拉场景)。")
    public Mono<ResponseEntity<List<Map<String, Object>>>> list(
            @PathVariable String dictType,
            @RequestParam(required = false) String parentCode) {

        List<DictItem> items;
        if (parentCode != null && !parentCode.isBlank()) {
            items = dictService.listByParent(dictType, parentCode);
        } else {
            items = dictService.listAll(dictType);
        }

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

    /**
     * 级联关系元数据 —— 前端拿到后自动绑定"父下拉 change → 重载子下拉"。
     *
     * <p>返回格式:
     * <pre>
     * {
     *   "cascades": [
     *     { "parentType": "device_type", "childType": "device_model", "joinField": "parent" }
     *   ]
     * }
     * </pre>
     */
    @GetMapping("/cascade/meta")
    @Operation(summary = "级联关系元数据",
        description = "返回所有已注册的级联关系,前端据此自动绑定下拉联动。")
    public Mono<ResponseEntity<Map<String, Object>>> cascadeMeta() {
        CascadeRegistry reg = dictService.getCascadeRegistry();
        List<Map<String, String>> cascades = reg.all().stream()
            .map(link -> {
                Map<String, String> m = new LinkedHashMap<>();
                m.put("parentType", link.parentType());
                m.put("childType", link.childType());
                m.put("joinField", link.joinField());
                return m;
            })
            .collect(Collectors.toList());
        return Mono.just(ResponseEntity.ok(Map.of("cascades", cascades)));
    }
}
