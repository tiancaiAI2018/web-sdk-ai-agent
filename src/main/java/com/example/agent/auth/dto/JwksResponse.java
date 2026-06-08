package com.example.agent.auth.dto;

import java.util.List;
import java.util.Map;

public record JwksResponse(List<Map<String, Object>> keys) {}
