package com.example.agent.tool;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServerToolRepository extends JpaRepository<ServerTool, String> {
    Optional<ServerTool> findByName(String name);
    boolean existsByName(String name);
    List<ServerTool> findByEnabledTrue();
    /** 按渠道查询已启用的服务端工具 */
    List<ServerTool> findByEnabledTrueAndOwnerId(String ownerId);
    /** 查询已启用且无归属渠道的平台内置工具(ownerId 为空) */
    List<ServerTool> findByEnabledTrueAndOwnerIdIsNull();
}
