package com.lgdisplay.mmd.backend.system.version;

import com.lgdisplay.mmd.backend.common.api.ApiResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VersionController {

    private final ObjectProvider<BuildProperties> buildProperties;

    public VersionController(ObjectProvider<BuildProperties> buildProperties) {
        this.buildProperties = buildProperties;
    }

    @GetMapping("/api/v1/system/version")
    public ApiResponse<VersionResponse> version() {
        // IDE에서 직접 실행하면 빌드 정보 파일이 없을 수 있습니다.
        BuildProperties properties = buildProperties.getIfAvailable();
        String version = properties != null ? properties.getVersion() : "unknown";
        return ApiResponse.ok(new VersionResponse(version));
    }
}
