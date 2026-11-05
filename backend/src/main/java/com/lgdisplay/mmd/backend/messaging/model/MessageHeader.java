package com.lgdisplay.mmd.backend.messaging.model;

import java.time.Instant;

/**
 * 미들웨어와 무관한 메시지 헤더입니다. 어댑터가 TIBRV 필드나 Kafka 헤더로 옮깁니다.
 *
 * @param correlationId 요청과 응답을 짝짓는 값
 * @param version       메시지 형식 버전
 */
public record MessageHeader(String traceId, String correlationId, String messageType, int version, Instant timestamp) {
}
