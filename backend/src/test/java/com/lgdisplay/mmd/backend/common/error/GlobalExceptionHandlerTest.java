package com.lgdisplay.mmd.backend.common.error;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.lgdisplay.mmd.backend.messaging.model.MessagingTimeoutException;
import com.lgdisplay.mmd.backend.messaging.model.MessagingUnavailableException;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootTest
@AutoConfigureMockMvc
@Import(GlobalExceptionHandlerTest.FailingController.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void unknownUrlReturnsStandardError() throws Exception {
        mockMvc.perform(get("/api/v1/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("COMMON-404"))
                .andExpect(jsonPath("$.error.message").value(ErrorCode.NOT_FOUND.message()))
                .andExpect(jsonPath("$.error.detail", notNullValue()))
                .andExpect(jsonPath("$.traceId", notNullValue()))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void unknownUrlReturnsJsonEvenWhenClientAcceptsHtml() throws Exception {
        mockMvc.perform(get("/api/v1/unknown").accept(MediaType.TEXT_HTML))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error.code").value("COMMON-404"));
    }

    @Test
    void wrongMethodReturnsStandardErrorAndKeepsAllowHeader() throws Exception {
        mockMvc.perform(post("/api/v1/system/version"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().exists("Allow"))
                .andExpect(jsonPath("$.error.code").value("COMMON-405"));
    }

    @Test
    void apiExceptionUsesItsErrorCodeAndDetail() throws Exception {
        mockMvc.perform(get("/test/api-exception"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("COMMON-400"))
                .andExpect(jsonPath("$.error.detail").value("lotId is required"));
    }

    @Test
    void unexpectedExceptionHidesInternalMessage() throws Exception {
        mockMvc.perform(get("/test/unexpected"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error.code").value("COMMON-500"))
                .andExpect(jsonPath("$.error.message").value(ErrorCode.INTERNAL_ERROR.message()))
                .andExpect(jsonPath("$.error.detail").doesNotExist())
                .andExpect(jsonPath("$.traceId", notNullValue()));
    }

    @Test
    void messagingTimeoutHidesSubject() throws Exception {
        mockMvc.perform(get("/test/messaging-timeout"))
                .andExpect(status().isGatewayTimeout())
                .andExpect(jsonPath("$.error.code").value("MESSAGING-504"))
                .andExpect(jsonPath("$.error.message").value(ErrorCode.MESSAGING_TIMEOUT.message()))
                .andExpect(jsonPath("$.error.detail").doesNotExist())
                .andExpect(jsonPath("$.traceId", notNullValue()));
    }

    @Test
    void messagingUnavailableHidesSubject() throws Exception {
        mockMvc.perform(get("/test/messaging-unavailable"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error.code").value("MESSAGING-503"))
                .andExpect(jsonPath("$.error.detail").doesNotExist());
    }

    @Test
    void springErrorsAreNotReportedAsMessagingErrors() {
        assertThat(ErrorCode.from(HttpStatus.SERVICE_UNAVAILABLE)).isEqualTo(ErrorCode.INTERNAL_ERROR);
        assertThat(ErrorCode.from(HttpStatus.GATEWAY_TIMEOUT)).isEqualTo(ErrorCode.INTERNAL_ERROR);
    }

    @RestController
    static class FailingController {

        @GetMapping("/test/messaging-timeout")
        void messagingTimeout() {
            throw new MessagingTimeoutException("mmd.lot.track-in", Duration.ofSeconds(10));
        }

        @GetMapping("/test/messaging-unavailable")
        void messagingUnavailable() {
            throw new MessagingUnavailableException("mmd.lot.track-in");
        }

        @GetMapping("/test/api-exception")
        void apiException() {
            throw new ApiException(ErrorCode.BAD_REQUEST, "lotId is required");
        }

        @GetMapping("/test/unexpected")
        void unexpected() {
            throw new IllegalStateException("jdbc:oracle:thin:@internal-db:1521/MMD");
        }
    }
}
