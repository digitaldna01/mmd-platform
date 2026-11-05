package com.lgdisplay.mmd.backend.common.error;

import java.util.Arrays;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {

    BAD_REQUEST(HttpStatus.BAD_REQUEST, "COMMON-400", "요청 값을 확인해 주세요."),
    NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON-404", "요청한 항목을 찾을 수 없습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "COMMON-405", "허용되지 않은 요청입니다."),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON-500", "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
    MESSAGING_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "MESSAGING-503", "MMD 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."),
    MESSAGING_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, "MESSAGING-504", "MMD 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    /** Spring이 낸 HTTP 오류를 공통 코드로 바꿉니다. 업무 코드의 에러는 ApiException으로 직접 지정합니다. */
    public static ErrorCode from(HttpStatusCode status) {
        return Arrays.stream(values())
                .filter(errorCode -> errorCode.code.startsWith("COMMON-"))
                .filter(errorCode -> errorCode.status.isSameCodeAs(status))
                .findFirst()
                .orElse(status.is5xxServerError() ? INTERNAL_ERROR : BAD_REQUEST);
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }

    public String message() {
        return message;
    }
}
