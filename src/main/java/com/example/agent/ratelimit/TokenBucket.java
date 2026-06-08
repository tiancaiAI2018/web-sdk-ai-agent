package com.example.agent.ratelimit;

/**
 * 经典 token-bucket:容量 = burst 上限,速率 = 每秒补充 token 数。
 * 每次请求消耗一个 token;不足则返 retry-after(秒)。
 *
 * 单桶,无锁,volatile 读最新值。竞争激烈时近似正确(对限流场景够用)。
 */
public final class TokenBucket {

    private final double capacity;
    private final double refillPerSec;
    private double tokens;
    private long lastRefillNanos;

    public TokenBucket(double capacity, double refillPerSec) {
        this.capacity = capacity;
        this.refillPerSec = refillPerSec;
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    /**
     * 尝试取一个 token。返回 true=取到,放行;false=无 token,按 retryAfterSeconds 等待。
     */
    public synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }

    /** 距离"再够一个 token"还差多少秒。 */
    public synchronized long retryAfterSeconds() {
        if (tokens >= 1.0) return 0;
        double need = 1.0 - tokens;
        return Math.max(1, (long) Math.ceil(need / refillPerSec));
    }

    private void refill() {
        long now = System.nanoTime();
        long elapsedNanos = now - lastRefillNanos;
        if (elapsedNanos <= 0) return;
        double added = (elapsedNanos / 1_000_000_000.0) * refillPerSec;
        if (added > 0) {
            tokens = Math.min(capacity, tokens + added);
            lastRefillNanos = now;
        }
    }
}
