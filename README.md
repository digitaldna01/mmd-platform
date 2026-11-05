# MMD Platform

레거시 MMD를 React(FE)와 Spring Boot(BE)로 현대화하고, 외부 AI가 쓸 수 있는 MCP 서버를 함께 제공하는 모노레포입니다.

기반 항목 전체는 `MMD 현대화 엔터프라이즈급 기반 체크리스트.md`에 있습니다.

## 현재 상태

BE 최소 기동까지 진행했습니다. DB, 인증, 업무 도메인은 아직 없습니다. 폴더는 코드가 들어가는 단계에서 만듭니다.

- 기술 기준: [docs/adr/0001-technical-baseline.md](docs/adr/0001-technical-baseline.md)
- 반입 목록: [docs/import-list.md](docs/import-list.md)

## 실행

JDK 21이 필요합니다. Gradle은 설치하지 않아도 `./gradlew`가 지정된 버전을 받아서 사용합니다.

```bash
./gradlew :backend:test     # 테스트
./gradlew :backend:bootRun  # 실행 (기본 포트 8080)
```

- 버전 확인: `GET /api/v1/system/version`
- 헬스 체크: `GET /actuator/health/liveness`, `/readiness`, `/startup`

## 예정 구조

| 폴더 | 역할 | 만드는 단계 |
| ------------- | ------------------------------------------------- | ---- |
| `docs/` | 결정 기록(ADR), 규칙, 운영 문서 | 2 |
| `backend/` | 조회, 화면 업무 로직, TIBRV 변환 | 3 |
| `contracts/` | OpenAPI 스펙 등 모듈 간 계약 | 4 |
| `frontend/` | 화면, 공통 그리드, 화면 액션 | 5 |
| `mcp-server/` | BE API를 감싸는 AI 도구 계층 | 8 |
| `deploy/` | Docker Compose, nginx, 환경별 설정 | 9 |

분석 산출물과 레거시는 별도의 `modernize/` 레포에 있으며 조회 전용으로 참조합니다.

## 진행 순서

각 단계는 필요한 폴더만 만들고, 동작을 확인하고, 검토받은 뒤 커밋합니다.

1. 레포 시작: 루트 설정, README, CLAUDE.md
2. 구조 결정 기록: Java 버전, 빌드 도구, MCP 스택, Java 패키지명
3. BE 최소 기동: 헬스 체크, 버전 API, 표준 응답·에러, 추적 ID
4. API 계약 연결: OpenAPI 생성, FE 타입 생성
5. FE 최소 골격: 레이아웃, 생성 클라이언트
6. 메시징 경계: `MmdGateway`, 전송 포트, 메모리 어댑터
7. 대표 화면 1개: LOT 이력 조회를 DB부터 그리드까지 연결
8. MCP 읽기 도구 1개
9. 이중화 검증: BE 2개 인스턴스

## 작업 환경

레거시와 사내 시스템이 필요 없는 2~6단계는 개인 PC에서 진행합니다. 7단계와 TIBRV, Oracle, 상용 그리드 연동은 회사 PC에서 진행합니다.

회사 PC에서 할 일:

- [ ] `git clone`으로 레포 받기
- [ ] `CLAUDE.md`의 `modernize/` 경로와 명세 위치 기입
- [ ] TIBRV 라이브러리를 Java 21에서 테스트
- [ ] 기존 사내 프로젝트의 패키지 규칙이 `com.lgdisplay.mmd`와 맞는지 확인
- [ ] Maven Central, npm 접속 가능 여부 확인 (안 되면 반입 목록 기준으로 사내 저장소에 반입)
