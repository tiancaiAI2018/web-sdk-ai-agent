package com.example.agent.auth;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppCredentialsRepository extends JpaRepository<AppCredentials, String> {
}
