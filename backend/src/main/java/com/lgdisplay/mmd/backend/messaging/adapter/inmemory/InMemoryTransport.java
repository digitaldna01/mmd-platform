package com.lgdisplay.mmd.backend.messaging.adapter.inmemory;

import com.lgdisplay.mmd.backend.messaging.model.Message;
import com.lgdisplay.mmd.backend.messaging.model.MessagingTimeoutException;
import com.lgdisplay.mmd.backend.messaging.model.MessagingUnavailableException;
import com.lgdisplay.mmd.backend.messaging.port.MessageTransport;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Consumer;
import java.util.function.UnaryOperator;

/**
 * 테스트와 로컬 실행용 어댑터입니다. 프로세스 안에서만 동작하고 메시지를 보관하지 않습니다.
 * 실제 미들웨어처럼 응답을 비동기로 받아 상관 ID로 짝짓습니다.
 */
public class InMemoryTransport implements MessageTransport {

    private final Map<String, UnaryOperator<Message>> responders = new ConcurrentHashMap<>();
    private final Map<String, List<Consumer<Message>>> subscribers = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<Message>> pendingReplies = new ConcurrentHashMap<>();
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
    private volatile boolean connected = true;

    /** subject로 온 요청에 응답할 상대 서버를 흉내 냅니다. */
    public void respondTo(String subject, UnaryOperator<Message> responder) {
        responders.put(subject, responder);
    }

    public void disconnect() {
        connected = false;
    }

    @Override
    public Message request(String subject, Message request, Duration timeout) {
        ensureConnected(subject);
        String correlationId = request.header().correlationId();
        CompletableFuture<Message> reply = new CompletableFuture<>();
        pendingReplies.put(correlationId, reply);
        try {
            UnaryOperator<Message> responder = responders.get(subject);
            if (responder != null) {
                executor.execute(() -> deliverReply(responder.apply(request)));
            }
            return reply.get(timeout.toMillis(), TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            throw new MessagingTimeoutException(subject, timeout);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new MessagingUnavailableException(subject);
        } catch (ExecutionException e) {
            throw new MessagingUnavailableException(subject);
        } finally {
            pendingReplies.remove(correlationId);
        }
    }

    @Override
    public void publish(String subject, Message message) {
        ensureConnected(subject);
        subscribers.getOrDefault(subject, List.of())
                .forEach(handler -> executor.execute(() -> handler.accept(message)));
    }

    @Override
    public Subscription subscribe(String subject, Consumer<Message> handler) {
        List<Consumer<Message>> handlers = subscribers.computeIfAbsent(subject, key -> new CopyOnWriteArrayList<>());
        handlers.add(handler);
        return () -> handlers.remove(handler);
    }

    @Override
    public void close() {
        connected = false;
        executor.shutdownNow();
    }

    private void deliverReply(Message reply) {
        // 기다리는 요청이 없는 응답은 늦었거나 잘못 온 것이므로 버립니다.
        CompletableFuture<Message> pending = pendingReplies.get(reply.header().correlationId());
        if (pending != null) {
            pending.complete(reply);
        }
    }

    private void ensureConnected(String subject) {
        if (!connected) {
            throw new MessagingUnavailableException(subject);
        }
    }
}
