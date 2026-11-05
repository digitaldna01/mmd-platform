package com.lgdisplay.mmd.mcp.audit;

import io.modelcontextprotocol.spec.McpSchema.CallToolResult;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.function.Supplier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * 도구 호출마다 추적 ID를 정하고 감사 로그를 남깁니다. 모든 도구는 이 클래스를 거쳐 실행합니다.
 */
@Component
public class ToolAudit {

    public static final String MDC_KEY = "traceId";

    // 인증을 붙이기 전까지는 호출자를 알 수 없습니다.
    private static final String UNKNOWN = "unknown";

    private static final Logger log = LoggerFactory.getLogger(ToolAudit.class);

    private final JsonMapper jsonMapper;

    public ToolAudit(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    public <T> CallToolResult call(
            String tool, Map<String, Object> input, Supplier<T> action, Function<T, String> summary) {
        String traceId = UUID.randomUUID().toString();
        MDC.put(MDC_KEY, traceId);
        long startedAt = System.nanoTime();
        try {
            T result = action.get();
            CallToolResult toolResult = CallToolResult.builder()
                    .addTextContent(jsonMapper.writeValueAsString(result))
                    .build();
            write(tool, input, "success", summary.apply(result), startedAt);
            return toolResult;
        } catch (RuntimeException e) {
            log.error("tool failed", e);
            write(tool, input, "failure", e.getClass().getSimpleName(), startedAt);
            // 내부 주소나 원인은 AI에게 보내지 않고 로그와 추적 ID로 찾습니다.
            return CallToolResult.builder()
                    .isError(true)
                    .addTextContent("도구 실행에 실패했습니다. 추적 ID: " + traceId)
                    .build();
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    private void write(String tool, Map<String, Object> input, String outcome, String result, long startedAt) {
        log.atInfo()
                .addKeyValue("agent", UNKNOWN)
                .addKeyValue("user", UNKNOWN)
                .addKeyValue("tool", tool)
                .addKeyValue("input", input)
                .addKeyValue("outcome", outcome)
                .addKeyValue("result", result)
                .addKeyValue("durationMs", TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt))
                .log("tool completed");
    }
}
