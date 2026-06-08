package com.example.agent.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

/**
 * 按 clientId 维护 TokenBucket。共用一组配置(v2 简化)。
 * 后续可按 (clientId, path) 切分不同桶。
 */
@Component
public class TokenBucketRegistry {

    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Value("${agentscope.ratelimit.capacity:60}")
    private double capacity;
    @Value("${agentscope.ratelimit.refill-per-sec:0.2}")
    private double refillPerSec; // 默认 12/分钟

    public TokenBucket forClient(String clientId) {
        return buckets.computeIfAbsent(clientId, id -> new TokenBucket(capacity, refillPerSec));
    }

    /** 给运维一个清空入口(管理接口或定时任务用,本 v2 不暴露)。 */
    public void clear() {
        buckets.clear();
    }
}
