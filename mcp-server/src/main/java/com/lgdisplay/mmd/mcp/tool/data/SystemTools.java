package com.lgdisplay.mmd.mcp.tool.data;

import com.lgdisplay.mmd.mcp.audit.ToolAudit;
import com.lgdisplay.mmd.mcp.backend.api.VersionControllerApi;
import io.modelcontextprotocol.spec.McpSchema.CallToolResult;
import java.util.Map;
import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.stereotype.Component;

@Component
public class SystemTools {

    private static final String GET_VERSION = "system_get_version";

    private final VersionControllerApi versionApi;
    private final ToolAudit audit;

    public SystemTools(VersionControllerApi versionApi, ToolAudit audit) {
        this.versionApi = versionApi;
        this.audit = audit;
    }

    @McpTool(
            name = GET_VERSION,
            description = "MMD 백엔드의 현재 배포 버전을 조회합니다. 어떤 버전이 실행 중인지 확인할 때 사용합니다.",
            annotations = @McpTool.McpAnnotations(
                    title = "백엔드 버전 조회",
                    readOnlyHint = true,
                    destructiveHint = false,
                    idempotentHint = true))
    public CallToolResult getVersion() {
        return audit.call(GET_VERSION, Map.of(),
                () -> new BackendVersion(versionApi.getVersion().getData().getVersion()),
                result -> "version=" + result.version());
    }

    public record BackendVersion(String version) {
    }
}
