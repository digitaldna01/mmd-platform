# ADR-0005: MCP 서버

- 상태: 채택
- 날짜: 2026-11-05

## 배경

외부 AI(Claude, 사내 오케스트레이터, 로컬 Qwen)가 MMD 데이터를 쓰는 공통 도구 계층입니다. BE API를 감싸는 얇은 어댑터로 두고, 업무 규칙과 DB 접근은 BE에만 둡니다. 이번에는 샘플 읽기 도구 1개로 구조를 검증합니다.

```
AI 클라이언트
   ↓ MCP (Streamable HTTP, /mcp)
SystemTools 등 도구 → ToolAudit (추적 ID, 감사 로그)
   ↓ OpenAPI에서 생성한 Java 클라이언트 (X-Trace-Id 전달)
BE API
```

## 결정

| 항목 | 결정 |
| --------------- | ------------------------------------------------------------- |
| 구현 스택 | Spring AI 2.0.2 (WebMVC) |
| 전송 방식 | Streamable HTTP, `STATELESS` |
| BE 호출 | OpenAPI Generator `java`/`restclient`, 빌드 때 생성 (커밋 안 함) |
| 감사 | 모든 도구가 `ToolAudit`을 거침 |
| 네트워크 노출 | 기본 `127.0.0.1`, `SERVER_ADDRESS`로 변경 |
| Origin 검증 | 허용 목록 방식, 기본은 모두 거부 (`MCP_ALLOWED_ORIGINS`) |
| 도구 이름 | `영역_동작` 형식 (예: `system_get_version`) |
| 기본 포트 | 8081 |

## 근거

- `STATELESS`는 세션을 저장하지 않아 어느 인스턴스로 요청이 가도 동작합니다. 체크리스트의 이중화 요구와 맞습니다.
- `restclient` 라이브러리는 Spring Boot 4와 Jackson 3를 공식 지원합니다.
- 스펙이 바뀌면 생성 클라이언트가 바뀌어, 어긋난 도구는 컴파일에서 실패합니다.
- 자동 설정은 Origin을 검사하지 않습니다. MCP 명세는 검증을 요구하며, `127.0.0.1`에만 바인딩해도 DNS rebinding으로 브라우저에서 접근할 수 있어서 `McpTransportConfig`에서 공식 검증기를 끼웁니다.
- Origin이 없는 요청은 통과합니다. AI 클라이언트는 브라우저가 아니어서 Origin을 보내지 않습니다.
- 도구 실패는 예외를 던지지 않고 `CallToolResult`로 돌려줍니다. Spring AI가 예외 메시지를 원인 메시지와 합쳐서 문구가 중복되고, 내부 정보가 섞일 수 있기 때문입니다.
- 도구 이름에 점을 쓰지 않습니다. 일부 AI API는 도구 이름에 점을 허용하지 않습니다.

## 데이터 도구 추가 절차

1. BE에 API를 만들고 `./gradlew :backend:updateOpenApi`로 스펙을 갱신합니다.
2. `mcp-server/.../tool/data/`에 도구 클래스를 만듭니다. BE 호출은 생성된 API 클래스로 하고, `BackendClientConfig`에 빈을 추가합니다.
3. `@McpTool` 메서드는 `ToolAudit.call(...)`로 실행합니다.
4. 도구 설명에 언제 쓰는지와 비슷한 도구와의 차이를 적습니다. 화면용 API를 그대로 노출하지 않습니다.

## 알려진 한계

- **인증이 없습니다.** 감사 로그의 `agent`, `user`는 `unknown`입니다. 체크리스트의 사용자별 OAuth를 붙이기 전에는 외부에 노출하지 않습니다.
- **`STATELESS`는 양방향 기능을 쓸 수 없습니다.** 서버가 클라이언트에게 되묻는 elicitation을 쓸 수 없어서, 쓰기 도구의 사용자 확인 방식은 쓰기 도구를 만들 때 다시 정해야 합니다.
- 화면 도구 중계(`ui.*`)는 브라우저 연결을 인스턴스가 보유하는 구조라 별도 설계가 필요합니다. 체크리스트의 `ui.get_context` 같은 이름은 위 도구 이름 규칙에 맞게 바꿔야 합니다.
- 잘못된 `Accept` 헤더를 보내면 라이브러리에서 처리되지 않아 500이 납니다. 정상 클라이언트에는 영향이 없습니다.
- 빌드 시 플러그인 내부에서 Gradle 11에서 제거될 API 경고가 나옵니다. Gradle을 올릴 때 플러그인 버전도 함께 확인합니다.
