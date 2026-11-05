# 빌드 컨텍스트는 레포 루트입니다.
ARG BASE_REGISTRY=docker.io

FROM ${BASE_REGISTRY}/library/eclipse-temurin:21.0.13_9-jdk-noble AS build
WORKDIR /src
COPY gradlew settings.gradle.kts gradle.properties ./
COPY gradle gradle
COPY contracts contracts
COPY backend backend
COPY mcp-server/build.gradle.kts mcp-server/
RUN --mount=type=cache,target=/root/.gradle ./gradlew --no-daemon :backend:bootJar

FROM ${BASE_REGISTRY}/library/eclipse-temurin:21.0.13_9-jre-noble
WORKDIR /app
COPY --from=build /src/backend/build/libs/backend-*.jar app.jar
USER 1001:1001
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
