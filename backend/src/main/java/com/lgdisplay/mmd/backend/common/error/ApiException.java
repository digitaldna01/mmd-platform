package com.lgdisplay.mmd.backend.common.error;

public class ApiException extends RuntimeException {

    private final ErrorCode errorCode;

    /**
     * @param detail 개발자용 메시지. 응답의 detail로 나갑니다.
     */
    public ApiException(ErrorCode errorCode, String detail) {
        super(detail);
        this.errorCode = errorCode;
    }

    public ErrorCode errorCode() {
        return errorCode;
    }
}
