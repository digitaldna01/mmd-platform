package com.lgdisplay.mmd.backend.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lgdisplay.mmd.backend.common.trace.TraceIdFilter;
import org.slf4j.MDC;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(T data, ApiError error, String traceId) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, MDC.get(TraceIdFilter.MDC_KEY));
    }

    public static ApiResponse<Void> fail(ApiError error) {
        return new ApiResponse<>(null, error, MDC.get(TraceIdFilter.MDC_KEY));
    }
}
