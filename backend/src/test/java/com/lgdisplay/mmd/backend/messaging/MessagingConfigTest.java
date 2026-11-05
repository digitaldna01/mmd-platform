package com.lgdisplay.mmd.backend.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.lgdisplay.mmd.backend.BackendApplication;
import com.lgdisplay.mmd.backend.messaging.adapter.inmemory.InMemoryTransport;
import com.lgdisplay.mmd.backend.messaging.gateway.MmdGateway;
import com.lgdisplay.mmd.backend.messaging.port.MessageTransport;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

class MessagingConfigTest {

    private ConfigurableApplicationContext start(String adapter) {
        return new SpringApplicationBuilder(BackendApplication.class)
                .properties("server.port=0")
                .run("--mmd.messaging.adapter=" + adapter);
    }

    @Test
    void selectsAdapterFromConfiguration() {
        try (ConfigurableApplicationContext context = start("memory")) {
            assertThat(context.getBean(MessageTransport.class)).isInstanceOf(InMemoryTransport.class);
            assertThat(context.getBean(MmdGateway.class)).isNotNull();
            assertThat(context.getBean(MessagingProperties.class).requestTimeout()).isEqualTo(Duration.ofSeconds(10));
        }
    }

    @Test
    void failsToStartWithoutAdapter() {
        assertThatThrownBy(() -> start(""))
                .rootCause()
                .hasMessageContaining("MESSAGING_ADAPTER");
    }

    @Test
    void failsToStartWithUnknownAdapter() {
        assertThatThrownBy(() -> start("kafka"))
                .rootCause()
                .hasMessageContaining("kafka");
    }
}
