package com.example.agent.extract;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 内存版"工具注册表"。按 sessionId 索引,每个 sessionId 下挂多个 RegisteredTool。
 *
 * <p>线程安全:外层用 ConcurrentHashMap,内层每个 sid 也用 ConcurrentHashMap。
 * register/unregister 都走 compute,避免竞态。
 *
 * <p>生命周期:由 {@link ToolRegistryCleaner} 定时清理无活动的 sid(默认 30 分钟)。
 */
@Component
public class ToolRegistry {

    /** TTL:超过这个时间没活动就清。 */
    public static final Duration TTL = Duration.ofMinutes(30);

    /** 全量条目视图(供 Cleaner 用)。 */
    public record Entry(List<RegisteredTool> tools) {
        public Instant lastUsedAt() {
            return tools.stream().map(RegisteredTool::lastUsedAt).max(Instant::compareTo).orElse(Instant.EPOCH);
        }
    }

    /** sid → name → tool */
    private final ConcurrentHashMap<String, ConcurrentHashMap<String, RegisteredTool>> store = new ConcurrentHashMap<>();

    /**
     * 全量替换该 sid 下的工具集(简化语义,不做 add/remove 区分)。
     * 同一 sid 重复 register 会**整组替换**。
     */
    public List<String> register(String sid, List<RegisteredTool.Draft> drafts) {
        ConcurrentHashMap<String, RegisteredTool> inner = store.computeIfAbsent(sid, k -> new ConcurrentHashMap<>());
        // 先全清(覆盖式语义)
        inner.clear();
        List<String> registered = new ArrayList<>();
        for (RegisteredTool.Draft d : drafts) {
            RegisteredTool t = RegisteredTool.of(d);  // 校验在 of() 里抛
            inner.put(t.name(), t);
            registered.add(t.name());
        }
        return registered;
    }

    /**
     * 删指定 name;names 为空/null = 全清。
     * @return 实际被删的名字(可能少于传入,因有些不存在)
     */
    public List<String> unregister(String sid, List<String> names) {
        ConcurrentHashMap<String, RegisteredTool> inner = store.get(sid);
        if (inner == null) return List.of();
        if (names == null || names.isEmpty()) {
            // 全清
            List<String> all = new ArrayList<>(inner.keySet());
            inner.clear();
            return all;
        }
        List<String> removed = new ArrayList<>();
        for (String n : names) {
            if (inner.remove(n) != null) removed.add(n);
        }
        return removed;
    }

    /**
     * 列出该 sid 已注册工具的元信息(name + description + 时间戳),**不**返 parameters。
     * 用于 GET /chat/{sid}/tools,避免 SDK 反复读大块 schema。
     */
    public List<Map<String, Object>> list(String sid) {
        ConcurrentHashMap<String, RegisteredTool> inner = store.get(sid);
        if (inner == null) return List.of();
        List<Map<String, Object>> out = new ArrayList<>();
        for (RegisteredTool t : inner.values()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", t.name());
            m.put("description", t.description());
            m.put("strict", t.strict());
            m.put("registeredAt", t.registeredAt());
            m.put("lastUsedAt", t.lastUsedAt());
            out.add(m);
        }
        return out;
    }

    /**
     * 取该 sid 下指定的工具(activate 时用)。会刷新 lastUsedAt。
     *
     * @param names 要激活的工具名;null/空 = 取全部
     * @return 拿到的工具(顺序保持)
     * @throws IllegalArgumentException 任一 name 在该 sid 下未注册
     */
    public List<RegisteredTool> get(String sid, List<String> names) {
        ConcurrentHashMap<String, RegisteredTool> inner = store.get(sid);
        if (inner == null) {
            if (names != null && !names.isEmpty()) {
                throw new IllegalArgumentException(
                    "tool_not_registered: no tools for session " + sid);
            }
            return List.of();
        }
        if (names == null || names.isEmpty()) {
            // 不传 names = 取全部
            return touchAll(inner.values().stream().toList(), inner);
        }
        List<RegisteredTool> picked = new ArrayList<>();
        for (String n : names) {
            RegisteredTool t = inner.get(n);
            if (t == null) {
                throw new IllegalArgumentException(
                    "tool_not_registered: '" + n + "' not registered for session " + sid);
            }
            picked.add(t);
        }
        return touchAll(picked, inner);
    }

    /**
     * 仅刷新 lastUsedAt,不返回工具实例。供 {@code SessionManager.resume()} 调用,
     * 让"提交工具结果"也算活动,ToolRegistry TTL 不会在 TOOL_SUSPENDED 期间被误清。
     *
     * <p>Best-effort:sid 不存在或 names 全未注册都静默返回,不抛错 —— resume() 时
     * 已有 toolUseId,memory 反查是真实判据,这里不阻断流。
     */
    public void touch(String sid, List<String> names) {
        ConcurrentHashMap<String, RegisteredTool> inner = store.get(sid);
        if (inner == null) return;
        if (names == null || names.isEmpty()) {
            touchAll(inner.values().stream().toList(), inner);
            return;
        }
        List<RegisteredTool> picked = new ArrayList<>();
        for (String n : names) {
            RegisteredTool t = inner.get(n);
            if (t != null) picked.add(t);
        }
        if (!picked.isEmpty()) touchAll(picked, inner);
    }

    /** 刷新 lastUsedAt 并写回 inner。 */
    private List<RegisteredTool> touchAll(List<RegisteredTool> tools,
                                          ConcurrentHashMap<String, RegisteredTool> inner) {
        List<RegisteredTool> touched = new ArrayList<>(tools.size());
        for (RegisteredTool t : tools) {
            RegisteredTool t2 = t.touch();
            inner.put(t2.name(), t2);
            touched.add(t2);
        }
        return touched;
    }

    /**
     * Cleaner 用:遍历所有 sid,清过期的(整个 sid 整条)。
     * @return 被清的 sid 列表
     */
    public List<String> evictExpired(Instant cutoff) {
        List<String> evicted = new ArrayList<>();
        for (Map.Entry<String, ConcurrentHashMap<String, RegisteredTool>> e : store.entrySet()) {
            Entry entry = new Entry(new ArrayList<>(e.getValue().values()));
            if (entry.lastUsedAt().isBefore(cutoff)) {
                if (store.remove(e.getKey(), e.getValue())) {
                    evicted.add(e.getKey());
                }
            }
        }
        return evicted;
    }

    /** 测试 / 运维用:拿当前 sid 数。 */
    public int size() { return store.size(); }

    /** 测试 / 运维用:某 sid 下工具数。 */
    public int sizeOf(String sid) {
        ConcurrentHashMap<String, RegisteredTool> inner = store.get(sid);
        return inner == null ? 0 : inner.size();
    }
}
