# 배포

Docker Compose로 전체 구성을 띄웁니다. 개발과 검증용이며, 쿠버네티스로 옮겨도 이미지와 환경 변수 이름은 그대로 씁니다.

```
브라우저 → gateway (nginx, 127.0.0.1:8088)
             ├─ /api/  → backend-1, backend-2
             └─ /      → frontend

AI 클라이언트 → mcp-server (127.0.0.1:8081) → gateway → backend
```

## 실행

레포 루트에서 실행합니다. Docker가 필요합니다.

```bash
cd deploy/compose
docker compose up -d --build --wait    # 빌드하고 실행
docker compose ps                      # 상태 확인
docker compose down                    # 종료
./check-failover.sh                    # 무중단 검증 (실행 중일 때)
```

화면은 `http://127.0.0.1:8088`, MCP는 `http://127.0.0.1:8081/mcp`입니다.

## 환경 변수

`deploy/compose/.env.example`을 `.env`로 복사해 바꿉니다. `.env`는 커밋하지 않습니다.

| 변수 | 기본값 | 내용 |
| ------------------- | ----------- | ----------------------------------------- |
| `BASE_REGISTRY` | `docker.io` | 베이스 이미지 레지스트리 |
| `IMAGE_TAG` | `local` | 빌드한 이미지 태그 |
| `GATEWAY_PORT` | `8088` | 게이트웨이 포트 |
| `MCP_PORT` | `8081` | MCP 서버 포트 |
| `MESSAGING_ADAPTER` | `memory` | 메시징 어댑터. 메모리 어댑터는 개발용입니다 |

## 사내 레지스트리

`BASE_REGISTRY`를 사내 레지스트리로 바꾸면 모든 베이스 이미지를 거기서 받습니다. 사내 레지스트리에 [반입 목록](../docs/import-list.md)의 이미지를 같은 경로(`library/eclipse-temurin` 등)로 올려 둡니다.

이미지 안의 빌드는 Maven Central과 npm에 접속합니다. 막혀 있으면 Gradle과 npm을 사내 저장소로 향하게 바꾸거나, Dockerfile의 빌드 단계를 CI에서 만든 결과물을 복사하는 방식으로 바꿉니다.

## 순차 재시작

한 번에 한 대씩 재시작하고, **healthy가 된 뒤 5초 이상 기다렸다가** 다음 인스턴스로 넘어갑니다.

게이트웨이는 연결에 실패한 서버를 `fail_timeout`(3초) 동안 제외합니다. healthy 직후 다음 서버를 내리면, 앞 서버가 아직 제외된 상태라 살아 있는 서버가 없다고 판단해 502가 납니다. `check-failover.sh`가 이 절차대로 동작합니다.

## 주의

- 포트는 `127.0.0.1`에만 엽니다. MCP 서버에 인증을 붙이기 전에는 외부에 노출하지 않습니다.
- 게이트웨이는 `/api/`만 BE로 넘깁니다. `/actuator`와 `/v3/api-docs`는 외부로 나가지 않습니다.
- 게이트웨이는 연결 실패만 다른 BE로 넘깁니다. BE의 503, 504와 POST 요청은 재전송하지 않습니다.
- 자세한 결정과 한계는 [ADR-0006](../docs/adr/0006-container-deployment.md)을 봅니다.
