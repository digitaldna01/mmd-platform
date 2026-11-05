package com.lgdisplay.mmd.backend.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI openApi() {
        // 서버 주소와 앱 버전을 넣으면 환경과 배포마다 스펙 파일이 달라집니다.
        return new OpenAPI()
                .info(new Info().title("MMD Backend API").version("v1"))
                .servers(List.of(new Server().url("/")));
    }
}
