package com.lgdisplay.mmd.backend.messaging.model;

import com.lgdisplay.mmd.backend.common.error.ApiException;
import com.lgdisplay.mmd.backend.common.error.ErrorCode;
import java.time.Duration;

public class MessagingTimeoutException extends ApiException {

    public MessagingTimeoutException(String subject, Duration timeout) {
        super(ErrorCode.MESSAGING_TIMEOUT, "no reply from " + subject + " within " + timeout);
    }
}
