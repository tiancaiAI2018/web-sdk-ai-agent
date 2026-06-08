package com.example.agent.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
    @NotBlank String clientId,
    @NotBlank String clientSecret
) {}
