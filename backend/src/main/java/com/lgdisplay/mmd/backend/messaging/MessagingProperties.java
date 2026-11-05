package com.lgdisplay.mmd.backend.messaging;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param adapter 기본값을 두지 않습니다. 운영에서 설정을 빠뜨렸을 때 메모리 어댑터로 떠서
 *                메시지가 조용히 사라지는 것보다 기동 실패가 안전합니다.
 */
@ConfigurationProperties("mmd.messaging")
public record MessagingProperties(String adapter, Duration requestTimeout) {

    public MessagingProperties {
        if (adapter == null || adapter.isBlank()) {
            throw new IllegalStateException("메시징 어댑터 설정이 없습니다. MESSAGING_ADAPTER를 지정하세요.");
        }
    }
}
