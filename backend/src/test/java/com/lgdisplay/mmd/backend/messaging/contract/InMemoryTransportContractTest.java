package com.lgdisplay.mmd.backend.messaging.contract;

import com.lgdisplay.mmd.backend.messaging.adapter.inmemory.InMemoryTransport;
import com.lgdisplay.mmd.backend.messaging.model.Message;
import com.lgdisplay.mmd.backend.messaging.port.MessageTransport;
import java.util.function.UnaryOperator;

class InMemoryTransportContractTest extends MessageTransportContractTest {

    @Override
    protected MessageTransport createTransport() {
        return new InMemoryTransport();
    }

    @Override
    protected void respondTo(String subject, UnaryOperator<Message> responder) {
        ((InMemoryTransport) transport).respondTo(subject, responder);
    }

    @Override
    protected void disconnect() {
        ((InMemoryTransport) transport).disconnect();
    }
}
