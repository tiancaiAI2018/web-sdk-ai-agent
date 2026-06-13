package com.example.agent.datasource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

/**
 * 通用 REST 数据拉取器 —— 调用第三方 API 获取原始数据。
 *
 * 与 RestDictProvider 的区别:
 * - 不做数据解析/映射,只负责 HTTP 调用和认证
 * - 返回原始 JSON 对象,由 ToolProcessor 负责后处理
 * - 支持路径模板中的参数替换
 *
 * 认证方式从 DataSourceEntity 读取,支持 none/api_key/bearer/basic。
 */
public class RestDataFetcher {

    private static final Logger log = LoggerFactory.getLogger(RestDataFetcher.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Duration TIMEOUT = Duration.ofSeconds(10);

    private final WebClient webClient;

    public RestDataFetcher(DataSourceEntity dataSource) {
        this.webClient = buildWebClient(dataSource);
    }

    /**
     * 拉取第三方 API 数据。
     *
     * @param baseUrl       数据源基础 URL
     * @param pathTemplate  路径模板(如 /api/dict/{type}/list)
     * @param queryParams   查询参数
     * @return 解析后的 JSON 对象(Map/List/基本类型)
     */
    public Object fetch(String baseUrl, String pathTemplate, Map<String, String> queryParams) {
        String url = buildUrl(baseUrl, pathTemplate, queryParams);
        try {
            String body = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .block(TIMEOUT);
            if (body == null || body.isBlank()) return Map.of();
            return MAPPER.readValue(body, Object.class);
        } catch (Exception e) {
            log.warn("[RestDataFetcher] fetch failed: url={}, error={}", url, e.getMessage());
            return Map.of("error", "fetch_failed", "detail", e.getMessage());
        }
    }

    /** 构建完整 URL: baseUrl + pathTemplate(占位符替换) + queryParams */
    private String buildUrl(String baseUrl, String pathTemplate, Map<String, String> queryParams) {
        String path = pathTemplate != null ? pathTemplate : "/api/data";

        // 替换路径模板中的 {xxx} 占位符
        // 如 /api/dict/{dict_type}/list → /api/dict/city/list
        Map<String, String> remainingParams = new java.util.LinkedHashMap<>();
        if (queryParams != null) {
            remainingParams.putAll(queryParams);
        }
        for (Map.Entry<String, String> e : remainingParams.entrySet()) {
            String placeholder = "{" + e.getKey() + "}";
            if (path.contains(placeholder)) {
                path = path.replace(placeholder, e.getValue() != null ? e.getValue() : "");
                // 已用于路径替换的参数不再作为查询参数
                queryParams.remove(e.getKey());
            }
        }

        StringBuilder url = new StringBuilder(baseUrl);
        if (!path.startsWith("/")) url.append('/');
        url.append(path);

        if (queryParams != null && !queryParams.isEmpty()) {
            url.append('?');
            boolean first = true;
            for (Map.Entry<String, String> e : queryParams.entrySet()) {
                if (!first) url.append('&');
                url.append(e.getKey()).append('=').append(e.getValue());
                first = false;
            }
        }
        return url.toString();
    }

    /** 根据数据源认证配置构建 WebClient */
    private static WebClient buildWebClient(DataSourceEntity ds) {
        WebClient.Builder builder = WebClient.builder()
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);

        String authType = ds.getAuthType() != null ? ds.getAuthType() : "none";
        switch (authType) {
            case "api_key" -> {
                String key = extractAuthValue(ds.getAuthConfig(), "key");
                String header = extractAuthValue(ds.getAuthConfig(), "header");
                if (header == null) header = "X-API-Key";
                if (key != null) builder.defaultHeader(header, key);
            }
            case "bearer" -> {
                String token = extractAuthValue(ds.getAuthConfig(), "token");
                if (token != null) builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            }
            case "basic" -> {
                String encoded = extractAuthValue(ds.getAuthConfig(), "encoded");
                if (encoded != null) builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + encoded);
            }
            default -> { /* none: 不带认证头 */ }
        }

        // 额外自定义 headers
        if (ds.getHeaders() != null && !ds.getHeaders().isBlank()) {
            try {
                JsonNode headers = MAPPER.readTree(ds.getHeaders());
                headers.fields().forEachRemaining(e ->
                    builder.defaultHeader(e.getKey(), e.getValue().asText()));
            } catch (Exception ignored) {}
        }

        return builder.build();
    }

    private static String extractAuthValue(String authConfig, String field) {
        if (authConfig == null || authConfig.isBlank()) return null;
        try {
            return MAPPER.readTree(authConfig).path(field).asText(null);
        } catch (Exception e) { return null; }
    }
}
