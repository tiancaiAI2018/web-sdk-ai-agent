package com.example.agent.controller;

import com.example.agent.session.SessionManager;
import io.agentscope.core.agent.Event;
import io.agentscope.core.message.Msg;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Two endpoints:
 *   POST /chat/{sessionId}         blocking, returns full response
 *   GET  /chat/{sessionId}/stream SSE stream of incremental deltas
 *
 * The sessionId in the URL is also the JsonSession key. It is sanitized
 * inside SessionManager (see session.md security note).
 */
@RestController
@RequestMapping("/chat")
public class ChatController {

    private final SessionManager sessions;

    public ChatController(SessionManager sessions) {
        this.sessions = sessions;
    }

    /** Blocking request/response. */
    @PostMapping("/{sessionId}")
    public Mono<ChatResponse> chat(@PathVariable String sessionId,
                                   @RequestBody ChatRequest body) {
        if (body == null || body.message() == null || body.message().isBlank()) {
            return Mono.error(new IllegalArgumentException("message must not be blank"));
        }
        return sessions.call(sessionId, body.message())
            .map(resp -> new ChatResponse(
                sessionId,
                resp.getTextContent() == null ? "" : resp.getTextContent()));
    }

    /**
     * SSE stream. Each frame is one Event from the agent — incremental
     * reasoning deltas by default. The last reasoning frame has isLast=true.
     *
     * Heartbeat every 15s so proxies do not close the connection while
     * the model is still working.
     */
    @PostMapping(value = "/{sessionId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> stream(@PathVariable String sessionId,
                                                @RequestHeader(value = "X-User-Message",
                                                               required = false) String headerMsg,
                                                @RequestBody(required = false) ChatRequest body) {
        String text = headerMsg != null ? headerMsg
            : (body == null ? null : body.message());
        if (text == null || text.isBlank()) {
            return Flux.error(new IllegalArgumentException(
                "Provide message via X-User-Message header or JSON body"));
        }

        return sessions.stream(sessionId, text)
            .map(ChatController::toSse);
    }

    private static ServerSentEvent<String> toSse(Event event) {
        Msg msg = event.getMessage();
        String text = msg == null || msg.getTextContent() == null ? "" : msg.getTextContent();
        return ServerSentEvent.<String>builder()
            .event(event.getType().name().toLowerCase())
            .id(event.isLast() ? "last" : null)
            .data(text)
            .build();
    }

    public record ChatRequest(String message) {}
    public record ChatResponse(String sessionId, String reply) {}
}
