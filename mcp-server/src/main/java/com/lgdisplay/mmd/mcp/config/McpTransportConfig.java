package com.lgdisplay.mmd.mcp.config;

import io.modelcontextprotocol.json.jackson3.JacksonMcpJsonMapper;
import io.modelcontextprotocol.server.transport.DefaultServerTransportSecurityValidator;
import java.util.List;
import org.springframework.ai.mcp.server.common.autoconfigure.properties.McpServerStreamableHttpProperties;
import org.springframework.ai.mcp.server.webmvc.transport.WebMvcStatelessServerTransport;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;

@Configuration
public class McpTransportConfig {

    /**
     * 자동 설정은 Origin을 검사하지 않습니다. MCP 명세대로 검사해서 DNS rebinding을 막습니다.
     */
    @Bean
    WebMvcStatelessServerTransport webMvcStatelessServerTransport(
            @Qualifier("mcpServerJsonMapper") JsonMapper jsonMapper,
            McpServerStreamableHttpProperties serverProperties,
            @Value("${mmd.mcp.allowed-origins}") List<String> allowedOrigins) {
        return WebMvcStatelessServerTransport.builder()
                .jsonMapper(new JacksonMcpJsonMapper(jsonMapper))
                .messageEndpoint(serverProperties.getMcpEndpoint())
                .securityValidator(DefaultServerTransportSecurityValidator.builder()
                        .allowedOrigins(allowedOrigins)
                        .build())
                .build();
    }
}
