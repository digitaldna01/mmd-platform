package com.lgdisplay.mmd.backend.messaging.gateway;

import com.lgdisplay.mmd.backend.common.trace.TraceIdFilter;
import com.lgdisplay.mmd.backend.messaging.model.Message;
import com.lgdisplay.mmd.backend.messaging.port.MessageTransport;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.slf4j.MDC;

public class DefaultMmdGateway implements MmdGateway {

    // 임시 값입니다. 실제 subject 규칙은 MMD 서버 규격을 확인한 뒤 정합니다.
    private static final String PING_SUBJECT = "mmd.system.ping";
    private static final String PING_TYPE = "PING";
    private static final int MESSAGE_VERSION = 1;

    private final MessageTransport transport;
    private final Duration requestTimeout;

    public DefaultMmdGateway(MessageTransport transport, Duration requestTimeout) {
        this.transport = transport;
        this.requestTimeout = requestTimeout;
    }

    @Override
    public void ping() {
        transport.request(PING_SUBJECT, newRequest(PING_TYPE, Map.of()), requestTimeout);
    }

    private Message newRequest(String messageType, Map<String, Object> body) {
        return Message.of(currentTraceId(), messageType, MESSAGE_VERSION, body);
    }

    private String currentTraceId() {
        // 스케줄러처럼 HTTP 요청 밖에서 호출하면 MDC에 추적 ID가 없습니다.
        String traceId = MDC.get(TraceIdFilter.MDC_KEY);
        return traceId != null ? traceId : UUID.randomUUID().toString();
    }
}
