package com.lgdisplay.mmd.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "mmd.mcp.allowed-origins=https://allowed.example")
class McpOriginTest {

    private static final String LIST_TOOLS = "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}";

    @LocalServerPort
    private int port;

    private int post(String origin) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/mcp"))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json, text/event-stream")
                .POST(HttpRequest.BodyPublishers.ofString(LIST_TOOLS));
        if (origin != null) {
            request.header("Origin", origin);
        }
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request.build(), HttpResponse.BodyHandlers.discarding()).statusCode();
        }
    }

    @Test
    void acceptsClientWithoutOrigin() throws Exception {
        assertThat(post(null)).isEqualTo(200);
    }

    @Test
    void acceptsAllowedOrigin() throws Exception {
        assertThat(post("https://allowed.example")).isEqualTo(200);
    }

    @Test
    void rejectsOtherOrigin() throws Exception {
        assertThat(post("http://evil.example")).isEqualTo(403);
    }
}
