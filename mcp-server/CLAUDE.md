# CLAUDE.md

BE API를 감싸는 얇은 MCP 도구 계층입니다. 결정 내용은 `docs/adr/0005-mcp-server.md`를 봅니다.

## 명령

- 테스트: `./gradlew :mcp-server:test`
- 실행: `./gradlew :mcp-server:bootRun` (BE가 떠 있어야 도구가 동작합니다)

## 규칙

- BE는 `contracts/openapi/backend.json`에서 생성한 클라이언트로만 호출합니다.
- 업무 규칙과 DB 접근을 넣지 않습니다. BE 코드를 참조하지 않습니다.
- 쓰기 도구는 승인 절차 없이 추가하지 않습니다.
- 모든 도구는 `ToolAudit`을 거쳐 실행합니다.
- 인증을 붙이기 전에는 `SERVER_ADDRESS`를 외부 주소로 바꾸지 않습니다.
- 도구 이름은 `영역_동작` 형식의 영문 소문자와 밑줄로 씁니다.
- 도구 설명에는 언제 쓰는지와 비슷한 도구와의 차이를 적습니다.
