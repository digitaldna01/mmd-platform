package com.lgdisplay.mmd.backend.common.error;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
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

    @RestController
    static class FailingController {

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
