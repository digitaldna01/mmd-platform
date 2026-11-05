# CLAUDE.md

레거시 MMD 현대화 모노레포입니다. 구조와 진행 순서는 `README.md`, 기반 항목은 `MMD 현대화 엔터프라이즈급 기반 체크리스트.md`를 봅니다.

## 경로

- 레거시·분석 산출물: `modernize/` 레포 (회사 PC에서 `modernize/` 확인 후 기입)
- 명세 위치: 미정 (회사 PC에서 `modernize/` 확인 후 기입)
- 참조 구현: 없음 (7단계 대표 화면 구현 후 기입)
- 기술 기준: `docs/adr/0001-technical-baseline.md`
- 반입 목록: `docs/import-list.md` (의존성을 추가할 때 함께 갱신)

## 명령

- 테스트: `./gradlew :backend:test`
- 실행: `./gradlew :backend:bootRun`

## API 규칙

- URL은 `/api/v1/...` 형식입니다.
- 응답은 `ApiResponse`로 감싸고, 에러는 `ErrorCode`와 `ApiException`으로 처리합니다.
- 추적 ID 헤더는 `X-Trace-Id`입니다.

## 규칙

- `modernize/` 레포는 읽기 전용입니다. 수정하지 않습니다.
- 한 번에 한 단계만 진행합니다. 폴더는 코드가 들어갈 때 만듭니다.
- 구조에 영향을 주는 결정은 구현 전에 사용자와 합의합니다.
- 업무 규칙과 DB 접근은 BE에만 둡니다.
- 비밀 정보는 커밋하지 않고 환경 변수로 주입합니다.
