package com.lgdisplay.mmd.mcp.config;

import com.lgdisplay.mmd.mcp.audit.ToolAudit;
import com.lgdisplay.mmd.mcp.backend.api.VersionControllerApi;
import com.lgdisplay.mmd.mcp.backend.client.ApiClient;
import org.slf4j.MDC;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * BE는 contracts/openapi/backend.json에서 생성한 클라이언트로만 호출합니다.
 */
@Configuration
@EnableConfigurationProperties(BackendProperties.class)
public class BackendClientConfig {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    @Bean
    ApiClient backendApiClient(BackendProperties properties) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.timeout());
        requestFactory.setReadTimeout(properties.timeout());

        RestClient restClient = ApiClient.buildRestClientBuilder()
                .requestFactory(requestFactory)
                .requestInterceptor((request, body, execution) -> {
                    request.getHeaders().set(TRACE_ID_HEADER, MDC.get(ToolAudit.MDC_KEY));
                    return execution.execute(request, body);
                })
                .build();

        return new ApiClient(restClient).setBasePath(properties.url());
    }

    @Bean
    VersionControllerApi versionControllerApi(ApiClient backendApiClient) {
        return new VersionControllerApi(backendApiClient);
    }
}
