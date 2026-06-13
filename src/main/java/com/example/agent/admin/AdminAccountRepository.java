package com.example.agent.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 管理员账号数据访问层。
 */
public interface AdminAccountRepository extends JpaRepository<AdminAccount, String> {
    Optional<AdminAccount> findByUsername(String username);
    boolean existsByUsername(String username);
}
