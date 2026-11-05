package com.lgdisplay.mmd.backend.messaging.gateway;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.lgdisplay.mmd.backend.common.trace.TraceIdFilter;
import com.lgdisplay.mmd.backend.messaging.adapter.inmemory.InMemoryTransport;
import com.lgdisplay.mmd.backend.messaging.model.Message;
import com.lgdisplay.mmd.backend.messaging.model.MessagingTimeoutException;
import com.lgdisplay.mmd.backend.messaging.model.MessagingUnavailableException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

class DefaultMmdGatewayTest {

    private static final String PING_SUBJECT = "mmd.system.ping";

    private final InMemoryTransport transport = new InMemoryTransport();
    private final MmdGateway gateway = new DefaultMmdGateway(transport, Duration.ofMillis(200));

    @AfterEach
    void tearDown() {
        MDC.clear();
        transport.close();
    }

    private AtomicReference<Message> captureRequests() {
        AtomicReference<Message> captured = new AtomicReference<>();
        transport.respondTo(PING_SUBJECT, request -> {
            captured.set(request);
            return request.reply(Map.of());
        });
        return captured;
    }

    @Test
    void pingRoundTripsThroughTransport() {
        captureRequests();

        assertThatCode(gateway::ping).doesNotThrowAnyException();
    }

    @Test
    void passesCurrentTraceIdInMessageHeader() {
        AtomicReference<Message> captured = captureRequests();
        MDC.put(TraceIdFilter.MDC_KEY, "trace-from-request");

        gateway.ping();

        assertThat(captured.get().header().traceId()).isEqualTo("trace-from-request");
        assertThat(captured.get().header().messageType()).isEqualTo("PING");
        assertThat(captured.get().header().version()).isEqualTo(1);
        assertThat(captured.get().header().timestamp()).isNotNull();
    }

    @Test
    void createsTraceIdOutsideHttpRequest() {
        AtomicReference<Message> captured = captureRequests();

        gateway.ping();

        assertThat(captured.get().header().traceId()).isNotBlank();
    }

    @Test
    void failsWhenServerDoesNotReply() {
        assertThatThrownBy(gateway::ping).isInstanceOf(MessagingTimeoutException.class);
    }

    @Test
    void failsWhenMiddlewareIsDisconnected() {
        transport.disconnect();

        assertThatThrownBy(gateway::ping).isInstanceOf(MessagingUnavailableException.class);
    }
}
