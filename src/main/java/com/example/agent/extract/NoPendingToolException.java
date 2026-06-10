package com.example.agent.extract;

/**
 * /chat/{sid}/tools/result was called but the session has no pending tool
 * call — either the SDK called /tools/result twice, the session was evicted
 * by TTL, or the caller is using a wrong sessionId.
 */
public class NoPendingToolException extends SessionBusyException {
    public NoPendingToolException(String sessionId) {
        super("Session " + sessionId + " has no pending tool call. "
            + "Did the previous turn complete, get evicted (TTL ~30min), "
            + "or are you using the wrong sessionId?");
    }
}