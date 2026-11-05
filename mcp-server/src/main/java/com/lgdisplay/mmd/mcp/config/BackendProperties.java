package com.lgdisplay.mmd.mcp.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("mmd.backend")
public record BackendProperties(String url, Duration timeout) {
}
