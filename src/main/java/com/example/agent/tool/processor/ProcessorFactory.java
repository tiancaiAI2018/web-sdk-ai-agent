package com.example.agent.tool.processor;

import com.example.agent.dict.DictMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 处理器工厂 —— 按 processorType 创建对应的 ToolProcessor。
 *
 * 内置处理器:
 * - fuzzy_match: 模糊搜索+精排
 * - passthrough: 原样透传
 *
 * 可通过 register() 扩展自定义处理器。
 */
@Component
public class ProcessorFactory {

    private static final Logger log = LoggerFactory.getLogger(ProcessorFactory.class);

    private final Map<String, ToolProcessor> processors = new ConcurrentHashMap<>();

    public ProcessorFactory(DictMatcher matcher) {
        // 注册内置处理器
        register(new FuzzyMatchProcessor(matcher));
        register(new PassthroughProcessor());
    }

    /** 注册处理器 */
    public void register(ToolProcessor processor) {
        processors.put(processor.type(), processor);
        log.debug("[ProcessorFactory] registered processor: {}", processor.type());
    }

    /** 获取所有已注册的处理器类型 */
    public List<String> availableTypes() {
        return List.copyOf(processors.keySet());
    }

    /** 按 type 获取处理器,不存在则返回 passthrough 作为兜底 */
    public ToolProcessor create(String type) {
        ToolProcessor p = processors.get(type);
        if (p == null) {
            log.warn("[ProcessorFactory] unknown processor type: {}, fallback to passthrough", type);
            return processors.get("passthrough");
        }
        return p;
    }
}
