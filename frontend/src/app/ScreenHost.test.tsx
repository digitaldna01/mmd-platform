import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScreenHost } from "./ScreenHost";

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ScreenHost screenId="system.info" />
    </QueryClientProvider>,
  );
}

describe("ScreenHost", () => {
  it("화면 ID로 화면을 띄우고 BE 값을 표시한다", async () => {
    const body = JSON.stringify({ data: { version: "0.1.0" }, traceId: "trace-1234" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body)));

    renderScreen();

    expect(await screen.findByText("BE 버전: 0.1.0")).toBeTruthy();
  });

  it("API 에러를 화면에 표시한다", async () => {
    const body = JSON.stringify({
      error: { code: "COMMON-404", message: "요청한 항목을 찾을 수 없습니다." },
      traceId: "trace-5678",
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status: 404 })));

    renderScreen();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("요청한 항목을 찾을 수 없습니다.");
    expect(alert.textContent).toContain("추적 ID: trace-5678");
  });
});
