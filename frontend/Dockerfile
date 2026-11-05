# 빌드 컨텍스트는 레포 루트입니다.
ARG BASE_REGISTRY=docker.io

FROM ${BASE_REGISTRY}/library/node:26.13.0-bookworm-slim AS build
WORKDIR /src
COPY contracts contracts
COPY frontend frontend
WORKDIR /src/frontend
RUN npm ci && npm run build

FROM ${BASE_REGISTRY}/nginxinc/nginx-unprivileged:1.30.6-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/frontend/dist /usr/share/nginx/html
EXPOSE 8080
