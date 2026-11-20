# 반입 목록

이 프로젝트에 필요한 도구와 의존성입니다. 의존성을 추가할 때 함께 갱신합니다. 회사 환경에서 외부 저장소에 접속할 수 없으면 이 목록을 기준으로 사내 저장소에 반입합니다.

| 항목 | 버전 | 용도 | 쓰는 단계 |
| ------------------ | ------------------- | -------------- | ---- |
| Eclipse Temurin JDK | 21.0.13 | BE, MCP 서버 | 3 |
| Gradle 배포본 | 9.8.2 | 빌드 (`./gradlew`가 내려받음) | 3 |
| Spring Boot 플러그인 | 4.1.2 | 빌드 | 3 |
| Spring Boot | 4.1.2 | BE, MCP 서버 | 3 |
| springdoc-openapi | 3.2.0 | OpenAPI 스펙 생성 | 4 |
| ArchUnit | 1.5.1 | 메시징 경계 테스트 | 6 |
| Node.js | 26 LTS | FE 빌드 | 4 |
| Orval | 8.46.0 | FE API 코드 생성 | 4 |
| TypeScript | 7.0.2 | FE 타입 체크 | 4 |
| React, React DOM | 19.3.1 | FE | 5 |
| Vite | 8.3.6 | FE 빌드 | 5 |
| TanStack Query | 5.106.1 | FE 서버 상태 | 5 |
| Storybook | 10.6.5 | 컴포넌트 개발 | 5 |
| Vitest, jsdom, Testing Library | 5.1.0, 31.0.0, 16.3.3 | FE 테스트 | 5 |
| Pretendard | 1.3.9 | FE 기본 글꼴 (SIL OFL) | 5 |
| D2Coding | 1.3.2 | FE 고정폭 글꼴 (SIL OFL) | 5 |
| Fluent UI System Icons (`@fluentui/svg-icons`) | 1.1.345 | FE 아이콘 원본, 개발 의존성 (MIT) | 5 |
| stylelint | 17.16.0 | FE CSS 검사, 개발 의존성 (MIT) | 5 |
| React Aria Components (`react-aria-components`) | 1.22.1 | FE 입력 컴포넌트 동작 (Apache-2.0, ADR-0007) | 5 |
| `@react-aria/optimize-locales-plugin` | 2.1.0 | FE 빌드에서 쓰지 않는 언어 문구 제거, 개발 의존성 (Apache-2.0) | 5 |
| Spring AI | 2.0.2 | MCP 서버 | 8 |
| OpenAPI Generator 플러그인 | 7.27.0 | BE 호출용 Java 클라이언트 생성 | 8 |

컨테이너 베이스 이미지입니다.

| 이미지 | 태그 | 용도 |
| ------------------------------- | ------------------------ | ---------------- |
| `library/eclipse-temurin` | `21.0.13_9-jdk-noble` | BE, MCP 서버 빌드 |
| `library/eclipse-temurin` | `21.0.13_9-jre-noble` | BE, MCP 서버 실행 |
| `library/node` | `26.13.0-bookworm-slim` | FE 빌드 |
| `nginxinc/nginx-unprivileged` | `1.30.6-alpine` | FE, 게이트웨이 |

접속 경로는 다음과 같습니다.

- Gradle 배포본: `services.gradle.org`
- Gradle 플러그인: `plugins.gradle.org`
- 라이브러리: Maven Central
- FE 패키지: npm 레지스트리 (전체 목록은 `frontend/package-lock.json`)
- 컨테이너 이미지: Docker Hub (`BASE_REGISTRY`로 변경)

사내 저장소를 쓰게 되면 `settings.gradle.kts`의 저장소 설정과 `gradle/wrapper/gradle-wrapper.properties`의 배포본 주소를 바꿉니다.
