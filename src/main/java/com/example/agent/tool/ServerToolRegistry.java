package com.example.agent.tool;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * 服务端工具注册表。从数据库加载已启用的 ServerTool,
 * 提供查询接口供 SessionManager 和 ServerToolExecutor 使用。
 */
@Component
public class ServerToolRegistry {

    private static final Logger log = LoggerFactory.getLogger(ServerToolRegistry.class);

    private final ServerToolRepository repo;

    public ServerToolRegistry(ServerToolRepository repo) {
        this.repo = repo;
    }

    /** 返回所有已启用的服务端工具 */
    public List<ServerTool> findAllEnabled() {
        return repo.findByEnabledTrue();
    }

    /**
     * 返回指定渠道已启用的服务端工具 + 平台内置工具(ownerId 为空)。
     * 第三方渠道只能看到自己的工具和平台公共工具,不能看到其他渠道的。
     */
    public List<ServerTool> findEnabledByOwner(String clientId) {
        List<ServerTool> result = new java.util.ArrayList<>();
        // 平台内置工具(ownerId 为空)
        result.addAll(repo.findByEnabledTrueAndOwnerIdIsNull());
        // 该渠道的工具
        if (clientId != null && !clientId.isBlank()) {
            result.addAll(repo.findByEnabledTrueAndOwnerId(clientId));
        }
        return result;
    }

    /** 按名称查找 */
    public Optional<ServerTool> findByName(String name) {
        return repo.findByName(name);
    }

    /** 保存或更新 */
    public ServerTool save(ServerTool tool) {
        return repo.save(tool);
    }

    /** 检查是否存在 */
    public boolean existsByName(String name) {
        return repo.existsByName(name);
    }
}
