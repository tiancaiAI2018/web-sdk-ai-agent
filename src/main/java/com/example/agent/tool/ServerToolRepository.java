package com.example.agent.tool;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServerToolRepository extends JpaRepository<ServerTool, String> {
    Optional<ServerTool> findByName(String name);
    boolean existsByName(String name);
    List<ServerTool> findByEnabledTrue();
}
