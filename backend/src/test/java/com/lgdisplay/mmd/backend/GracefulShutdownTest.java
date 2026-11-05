package com.lgdisplay.mmd.backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

class GracefulShutdownTest {

    private static final CountDownLatch requestStarted = new CountDownLatch(1);

    @Test
    void finishesInFlightRequestBeforeClosing() throws Exception {
        ConfigurableApplicationContext context = new SpringApplicationBuilder(
                        BackendApplication.class, SlowController.class)
                .properties("server.port=0")
                .run();
        int port = context.getEnvironment().getRequiredProperty("local.server.port", Integer.class);
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/test/slow")).build();

        try (HttpClient client = HttpClient.newHttpClient()) {
            CompletableFuture<HttpResponse<String>> response =
                    client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
            assertThat(requestStarted.await(5, TimeUnit.SECONDS)).isTrue();

            context.close();

            assertThat(response.get(5, TimeUnit.SECONDS).statusCode()).isEqualTo(200);
            assertThat(response.get().body()).isEqualTo("done");
        }
    }

    @RestController
    static class SlowController {

        @GetMapping("/test/slow")
        String slow() throws InterruptedException {
            requestStarted.countDown();
            Thread.sleep(1000);
            return "done";
        }
    }
}
