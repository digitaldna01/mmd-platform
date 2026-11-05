package com.lgdisplay.mmd.backend.messaging.port;

import com.lgdisplay.mmd.backend.messaging.model.Message;
import com.lgdisplay.mmd.backend.messaging.model.MessagingTimeoutException;
import com.lgdisplay.mmd.backend.messaging.model.MessagingUnavailableException;
import java.time.Duration;
import java.util.function.Consumer;

/**
 * 어떤 미들웨어로 보내는지 감추는 전송 포트입니다.
 * 어댑터는 모두 MessageTransportContractTest를 통과해야 합니다.
 */
public interface MessageTransport extends AutoCloseable {

    /**
     * 요청을 보내고 상관 ID가 같은 응답을 기다립니다. 재시도하지 않습니다.
     *
     * @throws MessagingTimeoutException     제한 시간 안에 응답이 없을 때
     * @throws MessagingUnavailableException 미들웨어에 연결할 수 없을 때
     */
    Message request(String subject, Message request, Duration timeout);

    /**
     * @throws MessagingUnavailableException 미들웨어에 연결할 수 없을 때
     */
    void publish(String subject, Message message);

    Subscription subscribe(String subject, Consumer<Message> handler);

    @Override
    void close();

    interface Subscription extends AutoCloseable {

        @Override
        void close();
    }
}
