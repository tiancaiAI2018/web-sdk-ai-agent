package com.example.agent.admin;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

/**
 * 管理员认证服务 —— 验证用户名+密码。
 */
@Service
public class AdminAuthService {

    private final AdminAccountRepository repo;

    public AdminAuthService(AdminAccountRepository repo) {
        this.repo = repo;
    }

    /**
     * 验证管理员凭据。
     *
     * @param username 用户名
     * @param password 明文密码
     * @return 验证通过返回 AdminAccount，失败返回 null
     */
    public AdminAccount authenticate(String username, String password) {
        if (username == null || password == null) return null;
        return repo.findByUsername(username)
            .filter(AdminAccount::isEnabled)
            .filter(account -> BCrypt.checkpw(password, account.getPassword()))
            .orElse(null);
    }
}
