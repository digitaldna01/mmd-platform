# 빌드 컨텍스트는 레포 루트입니다.
ARG BASE_REGISTRY=docker.io

FROM ${BASE_REGISTRY}/library/eclipse-temurin:21.0.13_9-jdk-noble AS build
WORKDIR /src
COPY gradlew settings.gradle.kts gradle.properties ./
COPY gradle gradle
COPY contracts contracts
COPY mcp-server mcp-server
COPY backend/build.gradle.kts backend/
RUN --mount=type=cache,target=/root/.gradle ./gradlew --no-daemon :mcp-server:bootJar

FROM ${BASE_REGISTRY}/library/eclipse-temurin:21.0.13_9-jre-noble
WORKDIR /app
COPY --from=build /src/mcp-server/build/libs/mcp-server-*.jar app.jar
USER 1001:1001
EXPOSE 8081
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
