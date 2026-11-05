package com.lgdisplay.mmd.backend.messaging.gateway;

/**
 * 업무 코드가 쓰는 MMD 서버 호출 인터페이스입니다.
 * 업무 코드는 이 인터페이스만 보고, 어떤 미들웨어로 보내는지는 알지 못합니다.
 */
public interface MmdGateway {

    /** MMD 서버 연결을 확인합니다. 응답이 없으면 예외가 납니다. */
    void ping();
}
