package com.lgdisplay.mmd.mcp.tool.data;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.client.transport.HttpClientStreamableHttpTransport;
import io.modelcontextprotocol.spec.McpSchema;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * 실제 MCP 클라이언트로 서버에 연결해 도구를 호출합니다. BE는 HTTP 서버로 흉내 냅니다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ExtendWith(OutputCaptureExtension.class)
class SystemToolsMcpTest {

    private static final String TOOL = "system_get_version";
    private static final String VERSION_BODY = "{\"data\":{\"version\":\"0.1.0\"},\"traceId\":\"from-backend\"}";

    private static final List<String> receivedTraceIds = new CopyOnWriteArrayList<>();
    private static volatile int backendStatus = 200;
    private static HttpServer backend;

    @LocalServerPort
    private int port;

    private McpSyncClient client;

    @DynamicPropertySource
    static void backendUrl(DynamicPropertyRegistry registry) throws IOException {
        backend = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        backend.createContext("/api/v1/system/version", exchange -> {
            receivedTraceIds.add(exchange.getRequestHeaders().getFirst("X-Trace-Id"));
            byte[] body = VERSION_BODY.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(backendStatus, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        backend.start();
        registry.add("mmd.backend.url", () -> "http://127.0.0.1:" + backend.getAddress().getPort());
    }

    @AfterAll
    static void stopBackend() {
        backend.stop(0);
    }

    @BeforeEach
    void connect() {
        backendStatus = 200;
        receivedTraceIds.clear();
        client = McpClient.sync(HttpClientStreamableHttpTransport.builder("http://127.0.0.1:" + port).build()).build();
        client.initialize();
    }

    @AfterEach
    void disconnect() {
        client.closeGracefully();
    }

    private static String text(McpSchema.CallToolResult result) {
        return ((McpSchema.TextContent) result.content().getFirst()).text();
    }

    private McpSchema.CallToolResult callTool() {
        return client.callTool(McpSchema.CallToolRequest.builder().name(TOOL).arguments(Map.of()).build());
    }

    @Test
    void listsReadOnlyToolWithDescription() {
        List<McpSchema.Tool> tools = client.listTools().tools();

        assertThat(tools).extracting(McpSchema.Tool::name).containsExactly(TOOL);
        McpSchema.Tool tool = tools.getFirst();
        assertThat(tool.description()).contains("버전");
        assertThat(tool.annotations().readOnlyHint()).isTrue();
    }

    @Test
    void callReturnsBackendVersion() {
        McpSchema.CallToolResult result = callTool();

        assertThat(result.isError()).isNotEqualTo(Boolean.TRUE);
        assertThat(text(result)).contains("0.1.0");
    }

    @Test
    void sendsTraceIdToBackendAndWritesAuditLog(CapturedOutput output) {
        callTool();

        assertThat(receivedTraceIds).hasSize(1);
        String traceId = receivedTraceIds.getFirst();
        assertThat(traceId).matches("[0-9a-f-]{36}");
        String auditLine = output.getOut().lines()
                .filter(line -> line.contains("tool completed"))
                .reduce((first, second) -> second)
                .orElseThrow();
        assertThat(auditLine)
                .contains("\"traceId\":\"" + traceId + "\"")
                .contains("\"tool\":\"" + TOOL + "\"")
                .contains("\"outcome\":\"success\"")
                .contains("\"result\":\"version=0.1.0\"")
                .contains("\"agent\":\"unknown\"")
                .contains("\"user\":\"unknown\"");
    }

    @Test
    void backendFailureBecomesToolErrorWithoutInternals(CapturedOutput output) {
        backendStatus = 500;

        McpSchema.CallToolResult result = callTool();

        assertThat(result.isError()).isTrue();
        String traceId = receivedTraceIds.getFirst();
        assertThat(text(result)).isEqualTo("도구 실행에 실패했습니다. 추적 ID: " + traceId);
        assertThat(output).contains("\"outcome\":\"failure\"");
    }
}
