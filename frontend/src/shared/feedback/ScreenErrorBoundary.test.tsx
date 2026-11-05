import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ScreenErrorBoundary } from "./ScreenErrorBoundary";

function BrokenScreen(): never {
  throw new Error("ORA-00942: table or view does not exist");
}

it("화면 렌더링 오류를 잡고 내부 메시지는 숨긴다", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  render(
    <ScreenErrorBoundary>
      <BrokenScreen />
    </ScreenErrorBoundary>,
  );

  const alert = screen.getByRole("alert").textContent;
  expect(alert).toContain("화면을 표시하는 중 오류가 발생했습니다.");
  expect(alert).not.toContain("ORA-00942");
});
