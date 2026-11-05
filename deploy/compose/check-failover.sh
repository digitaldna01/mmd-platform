#!/usr/bin/env bash
# BE 인스턴스를 중지·재시작하는 동안 게이트웨이로 계속 요청을 보내 실패 건수를 셉니다.
set -euo pipefail

cd "$(dirname "$0")"
URL="http://127.0.0.1:${GATEWAY_PORT:-8088}/api/v1/system/version"
RESULTS="$(mktemp)"
# gateway.conf의 fail_timeout보다 길어야 합니다.
SETTLE_SECONDS=5

send_requests() {
  while :; do
    curl -s -o /dev/null -m 10 -w '%{http_code}\n' "$URL" >> "$RESULTS" || true
    sleep 0.02
  done
}

# healthy가 되어도 게이트웨이가 다시 쓰기까지 시간이 걸립니다.
wait_ready() {
  local id
  id="$(docker compose ps -q "$1")"
  for _ in $(seq 1 60); do
    if [ "$(docker inspect -f '{{.State.Health.Status}}' "$id")" = "healthy" ]; then
      sleep "$SETTLE_SECONDS"
      return 0
    fi
    sleep 1
  done
  echo "$1 did not become healthy" >&2
  return 1
}

report() {
  local total failed
  total="$(wc -l < "$RESULTS" | tr -d ' ')"
  failed="$(grep -vc '^200$' "$RESULTS" || true)"
  printf '%-28s total=%s failed=%s\n' "$1" "$total" "$failed"
}

send_requests &
LOAD_PID=$!
trap 'kill "$LOAD_PID" 2>/dev/null || true; rm -f "$RESULTS"' EXIT

sleep 3
report "baseline"

docker compose stop backend-1 >/dev/null
sleep 3
report "backend-1 stopped"
docker compose start backend-1 >/dev/null
wait_ready backend-1

docker compose kill -s KILL backend-2 >/dev/null
sleep 3
report "backend-2 crashed"
docker compose start backend-2 >/dev/null
wait_ready backend-2

for service in backend-1 backend-2; do
  docker compose up -d --no-deps --force-recreate "$service" >/dev/null 2>&1
  wait_ready "$service"
done
sleep 3
report "rolling recreate"

kill "$LOAD_PID"
wait "$LOAD_PID" 2>/dev/null || true

failed="$(grep -vc '^200$' "$RESULTS" || true)"
if [ "$failed" -ne 0 ]; then
  echo "FAILED: non-200 responses:" >&2
  sort "$RESULTS" | uniq -c >&2
  exit 1
fi
echo "OK: no failed requests"
