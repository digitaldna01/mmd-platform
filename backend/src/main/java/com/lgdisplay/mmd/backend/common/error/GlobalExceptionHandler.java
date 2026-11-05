package com.lgdisplay.mmd.backend.common.error;

import com.lgdisplay.mmd.backend.common.api.ApiError;
import com.lgdisplay.mmd.backend.common.api.ApiResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Object> handleApiException(ApiException ex) {
        ErrorCode errorCode = ex.errorCode();
        if (errorCode.status().is5xxServerError()) {
            logger.error("api exception", ex);
            return toResponse(errorCode.status(), new HttpHeaders(), errorCode, null);
        }
        return toResponse(errorCode.status(), new HttpHeaders(), errorCode, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(Exception ex) {
        return handleExceptionInternal(ex, null, new HttpHeaders(), ErrorCode.INTERNAL_ERROR.status(), null);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        ErrorCode errorCode = ErrorCode.from(statusCode);
        if (statusCode.is5xxServerError()) {
            logger.error("unhandled exception", ex);
            // 서버 오류의 내부 메시지는 응답에 싣지 않고 로그와 추적 ID로 찾습니다.
            return toResponse(statusCode, headers, errorCode, null);
        }
        return toResponse(statusCode, headers, errorCode, ex.getMessage());
    }

    private ResponseEntity<Object> toResponse(
            HttpStatusCode status, HttpHeaders headers, ErrorCode errorCode, String detail) {
        ApiError error = new ApiError(errorCode.code(), errorCode.message(), detail);
        return ResponseEntity.status(status)
                .headers(headers)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.fail(error));
    }
}
