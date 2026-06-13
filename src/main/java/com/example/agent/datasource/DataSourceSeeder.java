package com.example.agent.datasource;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * 启动时确保默认数据源存在。
 *
 * 注意: 字典绑定和 RestDictProvider 注册已移除,
 * 因为后端工具现在走通用的 "数据源 → 处理器" 框架,
 * 不再需要 DictSourceBinding 和 DictService 的 Provider 机制。
 *
 * 数据源种子数据现在由 ServerToolSeeder 统一管理。
 */
@Component
public class DataSourceSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSourceSeeder.class);

    private final DataSourceRepository dsRepo;

    public DataSourceSeeder(DataSourceRepository dsRepo) {
        this.dsRepo = dsRepo;
    }

    @PostConstruct
    void seed() {
        // 数据源种子数据已由 ServerToolSeeder 统一管理
        // 这里只做日志提示
        long count = dsRepo.count();
        log.info("[DataSourceSeeder] {} data sources in database", count);
    }
}
