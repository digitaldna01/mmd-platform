package com.lgdisplay.mmd.backend.messaging;

import com.lgdisplay.mmd.backend.messaging.adapter.inmemory.InMemoryTransport;
import com.lgdisplay.mmd.backend.messaging.gateway.DefaultMmdGateway;
import com.lgdisplay.mmd.backend.messaging.gateway.MmdGateway;
import com.lgdisplay.mmd.backend.messaging.port.MessageTransport;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MessagingProperties.class)
public class MessagingConfig {

    @Bean
    MessageTransport messageTransport(MessagingProperties properties) {
        return switch (properties.adapter()) {
            case "memory" -> new InMemoryTransport();
            default -> throw new IllegalStateException("지원하지 않는 메시징 어댑터입니다: " + properties.adapter());
        };
    }

    @Bean
    MmdGateway mmdGateway(MessageTransport transport, MessagingProperties properties) {
        return new DefaultMmdGateway(transport, properties.requestTimeout());
    }
}
