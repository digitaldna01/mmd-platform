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
| Spring AI | 2.0.x | MCP 서버 | 8 |

접속 경로는 다음과 같습니다.

- Gradle 배포본: `services.gradle.org`
- Gradle 플러그인: `plugins.gradle.org`
- 라이브러리: Maven Central
- FE 패키지: npm 레지스트리 (전체 목록은 `frontend/package-lock.json`)

사내 저장소를 쓰게 되면 `settings.gradle.kts`의 저장소 설정과 `gradle/wrapper/gradle-wrapper.properties`의 배포본 주소를 바꿉니다.
