package com.example.agent.auth;

import com.example.agent.config.DemoProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Component;

/**
 * 启动时确保存在一条 demo-app 凭据。仅在记录不存在时插入,
 * 不会覆盖已有数据(避免每次启动改写用户改过的 secret)。
 */
@Component
public class DemoAppSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoAppSeeder.class);

    private final AppCredentialsRepository repo;
    private final DemoProperties demo;

    public DemoAppSeeder(AppCredentialsRepository repo, DemoProperties demo) {
        this.repo = repo;
        this.demo = demo;
    }

    @Override
    public void run(String... args) {
        String id = demo.getClientId();
        if (repo.existsById(id)) {
            log.info("[DemoAppSeeder] {} already exists, skip", id);
            return;
        }
        AppCredentials row = new AppCredentials();
        row.setId(id);
        row.setName("Demo Third-Party App");
        row.setSecretHash(BCrypt.hashpw(demo.getClientSecret(), BCrypt.gensalt(demo.getSecretBcryptCost())));
        row.setEnabled(true);
        repo.save(row);
        log.info("[DemoAppSeeder] seeded {} (secret bcrypt cost={})", id, demo.getSecretBcryptCost());
    }
}
