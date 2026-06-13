package com.example.agent.tool;

import com.example.agent.datasource.DataSourceEntity;
import com.example.agent.datasource.DataSourceRepository;
import com.example.agent.datasource.RestDataFetcher;
import com.example.agent.tool.processor.ProcessorConfig;
import com.example.agent.tool.processor.ProcessorFactory;
import com.example.agent.tool.processor.ToolProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 服务端工具执行器 —— 通用执行框架。
 *
 * 执行流程:
 * 1. 根据 toolName 查找 ServerTool 配置
 * 2. 通过 RestDataFetcher 从关联的数据源拉取原始数据
 * 3. 通过 ProcessorFactory 获取对应处理器,加工原始数据
 * 4. 返回处理后的结果给 LLM
 *
 * 不再硬编码工具类型,所有服务端工具都走 "数据源 → 处理器" 的统一流程。
 */
@Component
public class ServerToolExecutor {

    private static final Logger log = LoggerFactory.getLogger(ServerToolExecutor.class);

    private final ServerToolRegistry registry;
    private final DataSourceRepository dsRepo;
    private final ProcessorFactory processorFactory;

    /** 缓存已创建的 RestDataFetcher(按数据源ID) */
    private final ConcurrentHashMap<String, RestDataFetcher> fetcherCache = new ConcurrentHashMap<>();

    public ServerToolExecutor(ServerToolRegistry registry,
                              DataSourceRepository dsRepo,
                              ProcessorFactory processorFactory) {
        this.registry = registry;
        this.dsRepo = dsRepo;
        this.processorFactory = processorFactory;
    }

    /**
     * 执行服务端工具。
     *
     * @param toolName 工具名称
     * @param args     LLM 传入的参数
     * @return 处理后的结果
     */
    public Object execute(String toolName, Map<String, Object> args) {
        Optional<ServerTool> opt = registry.findByName(toolName);
        if (opt.isEmpty()) {
            log.warn("[ServerToolExecutor] unknown tool: {}", toolName);
            return Map.of("error", "unknown_server_tool", "tool", toolName);
        }

        ServerTool tool = opt.get();

        // 1. 获取数据源(如果工具关联了数据源)
        Object rawData;
        if (tool.getDataSourceId() != null && !tool.getDataSourceId().isBlank()) {
            DataSourceEntity ds = dsRepo.findById(tool.getDataSourceId()).orElse(null);
            if (ds == null) {
                return Map.of("error", "data_source_not_found", "dataSourceId", tool.getDataSourceId());
            }

            // 构建查询参数:把工具参数转为查询参数
            Map<String, String> queryParams = buildQueryParams(tool, args);

            // 拉取数据
            RestDataFetcher fetcher = fetcherCache.computeIfAbsent(ds.getId(), id -> new RestDataFetcher(ds));
            rawData = fetcher.fetch(ds.getUrl(), tool.getPathTemplate(), queryParams);
        } else {
            // 无数据源(纯处理器场景,如本地计算)
            rawData = Map.of();
        }

        // 2. 用处理器加工
        ToolProcessor processor = processorFactory.create(tool.getProcessorType());
        ProcessorConfig config = new ProcessorConfig(tool.getProcessorConfig());
        Object result = processor.process(rawData, args, config);

        log.debug("[ServerToolExecutor] tool={} processor={} → result type={}",
            toolName, tool.getProcessorType(), result.getClass().getSimpleName());

        return result;
    }

    /**
     * 将工具参数转为第三方 API 的查询参数。
     *
     * 路径模板中的 {xxx} 占位符从 args 中取值替换,
     * 剩余的 args 作为查询参数。
     */
    private Map<String, String> buildQueryParams(ServerTool tool, Map<String, Object> args) {
        Map<String, String> params = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : args.entrySet()) {
            if (e.getValue() != null) {
                params.put(e.getKey(), String.valueOf(e.getValue()));
            }
        }
        return params;
    }

    /** 清除 fetcher 缓存(数据源配置变更时调用) */
    public void clearFetcherCache() {
        fetcherCache.clear();
    }
}
