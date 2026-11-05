package com.lgdisplay.mmd.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/**
 * 코드에서 뽑은 스펙이 커밋된 계약과 같은지 검사합니다.
 * 의도한 변경이면 ./gradlew :backend:updateOpenApi 로 계약을 갱신합니다.
 */
@SpringBootTest(properties = "springdoc.api-docs.enabled=true")
@AutoConfigureMockMvc
class OpenApiContractTest {

    private static final Path SPEC = Path.of("../contracts/openapi/backend.json");

    @Autowired
    private MockMvc mockMvc;

    @Test
    void committedSpecMatchesCode() throws Exception {
        String actual = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8)
                .stripTrailing() + "\n";

        if (Boolean.getBoolean("openapi.update")) {
            Files.createDirectories(SPEC.getParent());
            Files.writeString(SPEC, actual);
            return;
        }

        assertThat(SPEC).as("스펙 파일이 없습니다. ./gradlew :backend:updateOpenApi 를 실행하세요.").exists();
        assertThat(Files.readString(SPEC))
                .as("API가 스펙과 다릅니다. 의도한 변경이면 ./gradlew :backend:updateOpenApi 를 실행하세요.")
                .isEqualTo(actual);
    }
}
