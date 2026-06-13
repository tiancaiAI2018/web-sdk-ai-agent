package com.example.agent.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * 启动时确保存在默认 super_admin 账号。
 * 仅在记录不存在时插入,不会覆盖已有数据。
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final AdminAccountRepository repo;

    public AdminSeeder(AdminAccountRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        String username = "admin";
        String defaultPassword = "admin123";
        if (repo.existsByUsername(username)) {
            log.info("[AdminSeeder] admin account already exists, skip");
            return;
        }
        AdminAccount account = new AdminAccount();
        account.setId(UUID.randomUUID().toString());
        account.setUsername(username);
        account.setPassword(BCrypt.hashpw(defaultPassword, BCrypt.gensalt(10)));
        account.setRole("super_admin");
        account.setEnabled(true);
        repo.save(account);
        log.warn("=========================================================");
        log.warn("[AdminSeeder] created default admin account: admin / admin123");
        log.warn("               生产部署必须修改默认密码!");
        log.warn("=========================================================");
    }
}
