# CLAUDE.md

레거시 MMD 현대화 모노레포입니다. 구조와 진행 순서는 `README.md`, 기반 항목은 `MMD 현대화 엔터프라이즈급 기반 체크리스트.md`를 봅니다.

## 경로

- 레거시·분석 산출물: `modernizer/` 레포 (회사 PC에서 `modernizer/` 확인 후 기입)
- 명세 위치: 미정 (회사 PC에서 `modernizer/` 확인 후 기입)
- 참조 구현: 없음 (7단계 대표 화면 구현 후 기입)
- 기술 기준: `docs/adr/0001-technical-baseline.md`
- API 계약 결정: `docs/adr/0002-api-contract.md`
- 반입 목록: `docs/import-list.md` (의존성을 추가할 때 함께 갱신)

## 명령

- 테스트: `./gradlew :backend:test`
- 실행: `./gradlew :backend:bootRun`
- API 스펙 갱신: `./gradlew :backend:updateOpenApi`
- FE 코드 생성·타입 체크: `cd frontend && npm run check:api`

## API 규칙

- URL은 `/api/v1/...` 형식입니다.
- 응답은 `ApiResponse`로 감싸고, 에러는 `ErrorCode`와 `ApiException`으로 처리합니다.
- 추적 ID 헤더는 `X-Trace-Id`입니다.
- `contracts/openapi/backend.json`은 손으로 고치지 않습니다. API를 바꾸면 스펙을 갱신해 함께 커밋합니다.
- FE는 생성된 API 함수만 씁니다. `frontend/src/api/client.ts` 밖에서 직접 fetch하지 않습니다.

## 규칙

- `modernizer/` 레포는 읽기 전용입니다. 수정하지 않습니다.
- 한 번에 한 단계만 진행합니다. 폴더는 코드가 들어갈 때 만듭니다.
- 구조에 영향을 주는 결정은 구현 전에 사용자와 합의합니다.
- 업무 규칙과 DB 접근은 BE에만 둡니다.
- 비밀 정보는 커밋하지 않고 환경 변수로 주입합니다.
