import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "../../api/client";
import { SystemInfoView } from "./SystemInfoView";

const error = new ApiRequestError({
  status: 500,
  code: "COMMON-500",
  message: "처리 중 오류가 발생했습니다.",
  traceId: "trace-1234",
});

describe("SystemInfoView", () => {
  it("버전을 표시한다", () => {
    render(<SystemInfoView version="0.1.0" isLoading={false} error={null} onRetry={() => {}} />);

    expect(screen.getByText("BE 버전: 0.1.0")).toBeTruthy();
  });

  it("로딩 중이면 로딩 안내를 표시한다", () => {
    render(<SystemInfoView isLoading error={null} onRetry={() => {}} />);

    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("값이 없으면 빈 상태를 표시한다", () => {
    render(<SystemInfoView isLoading={false} error={null} onRetry={() => {}} />);

    expect(screen.getByText("버전 정보가 없습니다.")).toBeTruthy();
  });

  it("조회 실패를 그 자리에 추적 ID와 함께 보이고 다시 조회할 수 있다", () => {
    const onRetry = vi.fn();
    render(<SystemInfoView isLoading={false} error={error} onRetry={onRetry} />);

    const alert = screen.getByRole("alert").textContent;
    expect(alert).toContain("조회하지 못했습니다.");
    expect(alert).toContain("추적 ID trace-1234");
    fireEvent.click(screen.getByRole("button", { name: "다시 조회" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
