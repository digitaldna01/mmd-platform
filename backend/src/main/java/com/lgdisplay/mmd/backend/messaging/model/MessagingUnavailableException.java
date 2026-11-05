package com.lgdisplay.mmd.backend.messaging.model;

import com.lgdisplay.mmd.backend.common.error.ApiException;
import com.lgdisplay.mmd.backend.common.error.ErrorCode;

public class MessagingUnavailableException extends ApiException {

    public MessagingUnavailableException(String subject) {
        super(ErrorCode.MESSAGING_UNAVAILABLE, "messaging unavailable for " + subject);
    }
}
