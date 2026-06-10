package com.example.agent.extract;

/**
 * /tools/result 传入的 toolUseId 与 suspendedAgents 中实际等待的 id 不一致。
 * 区分于 {@link NoPendingToolException}(那是没挂起),这是挂起中但 id 错配
 * —— 通常是 SDK 重试时使用了过期的 toolUseId,或 sid 错配。
 */
public class ToolUseIdMismatchException extends SessionBusyException {

    private final String gotToolUseId;

    public ToolUseIdMismatchException(String sid, String got) {
        super("toolUseId '" + got + "' does not match pending tool call for session " + sid);
        this.gotToolUseId = got;
    }

    public String getGotToolUseId() {
        return gotToolUseId;
    }
}
