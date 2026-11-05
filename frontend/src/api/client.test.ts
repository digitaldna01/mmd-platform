import { describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiRequest } from "./client";

function stubFetch(implementation: (url: string, init: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn(implementation);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function hangUntilAborted(_url: string, init: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  });
}

async function catchError(request: Promise<unknown>): Promise<ApiRequestError> {
  const error = await request.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ApiRequestError);
  return error as ApiRequestError;
}

describe("apiRequest", () => {
  it("추적 ID 헤더를 보내고 응답 본문을 돌려준다", async () => {
    const fetchMock = stubFetch(async () => new Response('{"data":{"version":"0.1.0"}}'));

    const body = await apiRequest("/api/v1/system/version", { method: "GET" });

    expect(body).toEqual({ data: { version: "0.1.0" } });
    const headers = new Headers(fetchMock.mock.calls[0]?.[1].headers);
    expect(headers.get("X-Trace-Id")).toMatch(/^[0-9a-f]{32}$/);
  });

  it("표준 에러 응답을 ApiRequestError로 바꾼다", async () => {
    const body = JSON.stringify({
      error: { code: "COMMON-404", message: "없습니다.", detail: "no handler" },
      traceId: "server-trace",
    });
    stubFetch(async () => new Response(body, { status: 404 }));

    const error = await catchError(apiRequest("/api/v1/unknown", {}));

    expect(error).toMatchObject({
      status: 404,
      code: "COMMON-404",
      message: "없습니다.",
      detail: "no handler",
      traceId: "server-trace",
    });
  });

  it("표준 형식이 아닌 에러 응답은 보낸 추적 ID를 쓴다", async () => {
    const fetchMock = stubFetch(async () => new Response("<html>Bad Gateway</html>", { status: 502 }));

    const error = await catchError(apiRequest("/api/v1/system/version", {}));

    const sent = new Headers(fetchMock.mock.calls[0]?.[1].headers).get("X-Trace-Id");
    expect(error).toMatchObject({ status: 502, code: "HTTP-502", traceId: sent });
    expect(error.message).not.toContain("Bad Gateway");
  });

  it("성공 응답이 JSON이 아니면 실패로 처리한다", async () => {
    stubFetch(async () => new Response("<html>index</html>"));

    const error = await catchError(apiRequest("/api/v1/system/version", {}));

    expect(error.code).toBe("HTTP-200");
  });

  it("서버에 닿지 못하면 네트워크 에러로 바꾼다", async () => {
    stubFetch(async () => {
      throw new TypeError("Failed to fetch");
    });

    const error = await catchError(apiRequest("/api/v1/system/version", {}));

    expect(error).toMatchObject({ status: 0, code: "CLIENT-NETWORK" });
  });

  it("호출자가 signal을 넘겨도 30초가 지나면 타임아웃된다", async () => {
    vi.useFakeTimers();
    stubFetch(hangUntilAborted);

    const request = catchError(apiRequest("/api/v1/system/version", { signal: new AbortController().signal }));
    await vi.advanceTimersByTimeAsync(30_000);

    expect(await request).toMatchObject({ status: 0, code: "CLIENT-TIMEOUT" });
  });

  it("호출자가 취소하면 원래 취소 에러를 그대로 던진다", async () => {
    stubFetch(hangUntilAborted);
    const controller = new AbortController();

    const request = apiRequest("/api/v1/system/version", { signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });
});
