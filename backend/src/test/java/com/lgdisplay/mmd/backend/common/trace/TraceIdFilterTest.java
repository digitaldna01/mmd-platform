package com.lgdisplay.mmd.backend.common.trace;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(OutputCaptureExtension.class)
class TraceIdFilterTest {

    private static final String URL = "/api/v1/system/version";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void reusesValidTraceIdInResponseAndJsonLog(CapturedOutput output) throws Exception {
        String traceId = "trace-abc-12345";

        mockMvc.perform(get(URL).header(TraceIdFilter.HEADER, traceId))
                .andExpect(header().string(TraceIdFilter.HEADER, traceId))
                .andExpect(jsonPath("$.traceId").value(traceId));

        assertThat(output).contains("\"traceId\":\"" + traceId + "\"");
        assertThat(output).contains("\"path\":\"" + URL + "\"");
    }

    @Test
    void generatesTraceIdWhenHeaderIsMissing() throws Exception {
        MvcResult result = mockMvc.perform(get(URL)).andReturn();

        String traceId = result.getResponse().getHeader(TraceIdFilter.HEADER);
        assertThat(traceId).matches("[0-9a-f-]{36}");
    }

    @Test
    void replacesMalformedTraceIdAndKeepsItOutOfLogs(CapturedOutput output) throws Exception {
        String malformed = "bad value\n{\"forged\":true}";

        mockMvc.perform(get(URL).header(TraceIdFilter.HEADER, malformed))
                .andExpect(header().string(TraceIdFilter.HEADER, not(malformed)));

        assertThat(output).doesNotContain("forged");
    }

    @Test
    void clearsTraceIdAfterRequest() throws Exception {
        mockMvc.perform(get(URL));

        assertThat(MDC.get(TraceIdFilter.MDC_KEY)).isNull();
    }
}
