package com.example.agent.datasource;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DataSourceRepository extends JpaRepository<DataSourceEntity, String> {
    List<DataSourceEntity> findByOwnerId(String ownerId);
    List<DataSourceEntity> findByEnabledTrue();
}
