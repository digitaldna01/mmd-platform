# 반입 목록

개인 PC에서 추가한 도구와 의존성을 회사 환경에서도 받을 수 있게 기록합니다. 의존성을 추가하는 단계에서 함께 갱신합니다. 회사 환경에서 외부 저장소에 접속할 수 없으면 이 목록을 기준으로 사내 저장소에 반입합니다.

| 항목 | 버전 | 용도 | 쓰는 단계 |
| ------------------ | ------------------- | -------------- | ---- |
| Eclipse Temurin JDK | 21.0.13 | BE, MCP 서버 | 3 |
| Gradle 배포본 | 9.8.2 | 빌드 (`./gradlew`가 내려받음) | 3 |
| Spring Boot 플러그인 | 4.1.2 | 빌드 | 3 |
| Spring Boot | 4.1.2 | BE, MCP 서버 | 3 |
| Spring AI | 2.0.x | MCP 서버 | 8 |

접속 경로는 다음과 같습니다.

- Gradle 배포본: `services.gradle.org`
- Gradle 플러그인: `plugins.gradle.org`
- 라이브러리: Maven Central

사내 저장소를 쓰게 되면 `settings.gradle.kts`의 저장소 설정과 `gradle/wrapper/gradle-wrapper.properties`의 배포본 주소를 바꿉니다.
