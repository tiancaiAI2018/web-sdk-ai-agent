package com.example.agent.extract;

/**
 * /chat/{sid}/stream was called while the session is suspended waiting for
 * an external tool result. Caller must POST /chat/{sid}/tools/result first.
 */
public class StreamBlockedException extends SessionBusyException {
    public StreamBlockedException(String sessionId) {
        super("Session " + sessionId + " is suspended waiting for a tool result. "
            + "POST /chat/" + sessionId + "/tools/result before sending a new message.");
    }
}