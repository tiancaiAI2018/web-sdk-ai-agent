package com.example.agent.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * OAuth 风格响应:access_token 必有;refresh_token 在两种 grant 成功时都返。
 * @JsonInclude.NON_NULL 让拒绝响应(只有 error)不包含多余字段。
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TokenResponse(
    @JsonProperty("access_token")  String accessToken,
    @JsonProperty("token_type")    String tokenType,
    @JsonProperty("expires_in")    Long expiresIn,
    @JsonProperty("refresh_token") String refreshToken,
    @JsonProperty("scope")         String scope,
    @JsonProperty("error")         String error
) {
    public static TokenResponse ok(String accessToken, long expiresIn, String refreshToken, String scope) {
        return new TokenResponse(accessToken, "Bearer", expiresIn, refreshToken, scope, null);
    }
    public static TokenResponse error(String code) {
        return new TokenResponse(null, null, null, null, null, code);
    }
}
