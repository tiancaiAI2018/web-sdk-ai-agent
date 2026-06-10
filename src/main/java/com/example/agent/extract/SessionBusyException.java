package com.example.agent.extract;

/**
 * Base for 409 conflicts around TOOL_SUSPENDED. Subclasses distinguish the
 * two opposite scenarios that previously shared one confusing message:
 *
 * <ul>
 *   <li>{@link StreamBlockedException} — /stream was called while session IS
 *       suspended (caller should call /tools/result instead)</li>
 *   <li>{@link NoPendingToolException} — /tools/result was called but session
 *       has NO pending tool call (request is invalid)</li>
 * </ul>
 */
public abstract class SessionBusyException extends RuntimeException {
    protected SessionBusyException(String message) {
        super(message);
    }
}