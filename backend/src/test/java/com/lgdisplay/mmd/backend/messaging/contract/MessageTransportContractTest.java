package com.lgdisplay.mmd.backend.messaging.contract;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.lgdisplay.mmd.backend.messaging.model.Message;
import com.lgdisplay.mmd.backend.messaging.model.MessagingTimeoutException;
import com.lgdisplay.mmd.backend.messaging.model.MessagingUnavailableException;
import com.lgdisplay.mmd.backend.messaging.port.MessageTransport;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.function.UnaryOperator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * 모든 어댑터가 지켜야 하는 동작입니다. 새 어댑터는 이 클래스를 상속해 같은 테스트를 통과해야 합니다.
 */
public abstract class MessageTransportContractTest {

    private static final String SUBJECT = "contract.test";
    private static final Duration TIMEOUT = Duration.ofSeconds(5);
    private static final Duration SHORT_TIMEOUT = Duration.ofMillis(100);

    protected MessageTransport transport;

    protected abstract MessageTransport createTransport();

    /** subject로 온 요청에 응답하는 상대 서버를 준비합니다. */
    protected abstract void respondTo(String subject, UnaryOperator<Message> responder);

    /** 미들웨어 연결이 끊긴 상태를 만듭니다. */
    protected abstract void disconnect();

    @BeforeEach
    void setUp() {
        transport = createTransport();
    }

    @AfterEach
    void tearDown() {
        transport.close();
    }

    private static Message message(Map<String, Object> body) {
        return Message.of("trace-contract", "TEST", 1, body);
    }

    @Test
    void requestReturnsReplyWithSameIds() {
        respondTo(SUBJECT, request -> request.reply(Map.of("result", "ok")));
        Message request = message(Map.of());

        Message reply = transport.request(SUBJECT, request, TIMEOUT);

        assertThat(reply.body()).containsEntry("result", "ok");
        assertThat(reply.header().correlationId()).isEqualTo(request.header().correlationId());
        assertThat(reply.header().traceId()).isEqualTo("trace-contract");
    }

    @Test
    void concurrentRepliesAreMatchedByCorrelationId() throws Exception {
        respondTo(SUBJECT, request -> {
            sleep(ThreadLocalRandom.current().nextLong(20));
            return request.reply(Map.of("seq", request.body().get("seq")));
        });

        try (ExecutorService callers = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Object>> replies = new ArrayList<>();
            for (int seq = 0; seq < 100; seq++) {
                Map<String, Object> body = Map.of("seq", seq);
                replies.add(callers.submit(() -> transport.request(SUBJECT, message(body), TIMEOUT).body().get("seq")));
            }
            for (int seq = 0; seq < 100; seq++) {
                assertThat(replies.get(seq).get()).isEqualTo(seq);
            }
        }
    }

    @Test
    void requestTimesOutWhenNobodyReplies() {
        assertThatThrownBy(() -> transport.request(SUBJECT, message(Map.of()), SHORT_TIMEOUT))
                .isInstanceOf(MessagingTimeoutException.class);
    }

    @Test
    void replyWithOtherCorrelationIdIsIgnored() {
        respondTo(SUBJECT, request -> message(Map.of("result", "for someone else")));

        assertThatThrownBy(() -> transport.request(SUBJECT, message(Map.of()), SHORT_TIMEOUT))
                .isInstanceOf(MessagingTimeoutException.class);
    }

    @Test
    void lateReplyDoesNotAffectNextRequest() {
        respondTo(SUBJECT, request -> {
            sleep(Boolean.TRUE.equals(request.body().get("slow")) ? 300 : 0);
            return request.reply(request.body());
        });

        assertThatThrownBy(() -> transport.request(SUBJECT, message(Map.of("slow", true)), SHORT_TIMEOUT))
                .isInstanceOf(MessagingTimeoutException.class);

        Message reply = transport.request(SUBJECT, message(Map.of("slow", false)), TIMEOUT);
        assertThat(reply.body()).containsEntry("slow", false);
    }

    @Test
    void publishReachesSubscribersUntilClosed() throws Exception {
        CountDownLatch received = new CountDownLatch(1);
        List<Message> messages = new CopyOnWriteArrayList<>();
        MessageTransport.Subscription subscription = transport.subscribe(SUBJECT, message -> {
            messages.add(message);
            received.countDown();
        });

        transport.publish(SUBJECT, message(Map.of("n", 1)));
        assertThat(received.await(5, TimeUnit.SECONDS)).isTrue();

        subscription.close();
        transport.publish(SUBJECT, message(Map.of("n", 2)));
        sleep(100);
        assertThat(messages).hasSize(1);
    }

    @Test
    void disconnectedTransportFailsFast() {
        disconnect();

        assertThatThrownBy(() -> transport.request(SUBJECT, message(Map.of()), TIMEOUT))
                .isInstanceOf(MessagingUnavailableException.class);
        assertThatThrownBy(() -> transport.publish(SUBJECT, message(Map.of())))
                .isInstanceOf(MessagingUnavailableException.class);
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
