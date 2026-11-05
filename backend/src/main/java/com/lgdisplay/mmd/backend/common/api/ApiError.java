package com.lgdisplay.mmd.backend.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * @param message 사용자에게 보여 주는 메시지
 * @param detail  개발자용 메시지. 없으면 응답에서 생략합니다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String code, String message, String detail) {
}
