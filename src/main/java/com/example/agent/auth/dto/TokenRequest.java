package com.example.agent.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * OAuth 2.0 风格的 /auth/token 请求体:
 *   { "grant_type": "client_credentials", "client_id": "...", "client_secret": "..." }
 *   { "grant_type": "refresh_token",      "refresh_token": "..." }
 *   { "grant_type": "password",           "username": "...", "password": "..." }  — 管理员登录
 */
public record TokenRequest(
    @JsonProperty("grant_type")     String grantType,
    @JsonProperty("client_id")      String clientId,
    @JsonProperty("client_secret")  String clientSecret,
    @JsonProperty("refresh_token")  String refreshToken,
    @JsonProperty("username")       String username,
    @JsonProperty("password")       String password
) {
    public static final String CLIENT_CREDENTIALS = "client_credentials";
    public static final String REFRESH_TOKEN = "refresh_token";
    public static final String PASSWORD = "password";
}
