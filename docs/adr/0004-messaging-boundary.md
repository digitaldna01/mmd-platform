# ADR-0004: 메시징 경계

- 상태: 채택
- 날짜: 2026-11-05

## 배경

TIBRV를 Kafka 등으로 바꿔도 업무 코드는 그대로 두는 것이 목표입니다. TIBRV 라이브러리와 MMD 서버 규격은 회사 PC에서 확인해야 하므로, 먼저 메모리 어댑터로 경계를 만들고 검증합니다.

```
업무 코드
   ↓ MmdGateway (업무 용어)
DefaultMmdGateway
   ↓ MessageTransport (요청/응답, 발행, 구독)
어댑터: InMemoryTransport | TibrvAdapter(예정) | KafkaAdapter(예정)
```

## 결정

| 항목 | 결정 |
| ------------- | -------------------------------------------------------------- |
| 경계 강제 | ArchUnit 테스트 (`MessagingBoundaryTest`) |
| 어댑터 선택 | `MESSAGING_ADAPTER` 설정, 기본값 없음 |
| 메시지 | 헤더(추적 ID, 상관 ID, 유형, 버전, 시각) + 본문 `Map<String, Object>` |
| 시간 초과 | `MESSAGING_REQUEST_TIMEOUT` (기본 10초), 초과 시 504 |
| 연결 실패 | 503 |
| 재시도 | 기본 없음 |
| 어댑터 검증 | 모든 어댑터가 `MessageTransportContractTest` 통과 |
| 모듈 구성 | `backend` 안의 패키지 |

## 근거

- 어댑터 기본값이 없으면, 운영에서 설정을 빠뜨렸을 때 메시지가 조용히 사라지는 대신 기동에 실패합니다.
- 쓰기 요청을 재시도하면 Track-in 같은 작업이 두 번 실행될 수 있습니다. 재시도는 멱등 키를 정한 뒤 업무별로 결정합니다.
- 메시징 5xx 에러의 subject는 내부 정보이므로 응답에 싣지 않고 로그와 추적 ID로 찾습니다.
- 메모리 어댑터도 실제 미들웨어처럼 응답을 비동기로 받아 상관 ID로 짝지어서, 계약 테스트가 어댑터 교체 후에도 같은 의미를 갖습니다.

## TibrvAdapter 추가 절차

1. `messaging/adapter/tibrv/`에 `MessageTransport` 구현체를 만듭니다. TIBRV 클래스는 이 패키지 밖에서 쓸 수 없습니다.
2. `MessagingConfig`의 `switch`에 `tibrv`를 추가합니다.
3. `MessageTransportContractTest`를 상속한 테스트를 만들어 통과시킵니다.
4. `MmdGateway`에 업무 메서드를 추가합니다. 업무 코드는 이 메서드만 호출합니다.

## 임시로 둔 것

- `ping()`의 subject `mmd.system.ping`과 유형 `PING`은 임시 값입니다. 실제 값은 MMD 서버 규격을 확인한 뒤 정합니다.
- `trackIn` 등 업무 메서드와 메시지 스키마는 규격을 확인한 뒤 추가합니다.
- 본문 `Map<String, Object>`가 실제 메시지 형식에 맞는지는 회사에서 확인합니다.

## 다시 볼 조건

- TIBRV가 Java 21에서 동작하지 않거나 JNI 격리가 필요하면 TIBRV 게이트웨이를 별도 프로세스로 분리합니다. 이때도 업무 코드는 바꾸지 않습니다.
- 구독 처리를 쓰기로 하면 분산 큐와 멱등 처리를 정합니다.
