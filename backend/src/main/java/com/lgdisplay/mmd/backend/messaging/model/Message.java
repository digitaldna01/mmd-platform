package com.lgdisplay.mmd.backend.messaging.model;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public record Message(MessageHeader header, Map<String, Object> body) {

    public Message {
        body = Collections.unmodifiableMap(new LinkedHashMap<>(body));
    }

    public static Message of(String traceId, String messageType, int version, Map<String, Object> body) {
        String correlationId = UUID.randomUUID().toString();
        return new Message(new MessageHeader(traceId, correlationId, messageType, version, Instant.now()), body);
    }

    /** 추적 ID와 상관 ID를 유지한 응답을 만듭니다. */
    public Message reply(Map<String, Object> replyBody) {
        MessageHeader replyHeader = new MessageHeader(
                header.traceId(), header.correlationId(), header.messageType(), header.version(), Instant.now());
        return new Message(replyHeader, replyBody);
    }
}
