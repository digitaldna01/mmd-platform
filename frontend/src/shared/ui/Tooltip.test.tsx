import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";

function renderTwo() {
  render(
    <>
      <Tooltip content="신규">
        <span tabIndex={0}>+</span>
      </Tooltip>
      <Tooltip content="수정">
        <span tabIndex={0}>•</span>
      </Tooltip>
    </>,
  );
  return [screen.getByText("+"), screen.getByText("•")] as const;
}

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("마우스를 올리고 0.5초 뒤에 나타난다", () => {
    const [first] = renderTwo();
    fireEvent.pointerEnter(first, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(499));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("tooltip").textContent).toBe("신규");
  });

  it("지나가기만 하는 마우스에는 뜨지 않는다", () => {
    const [first] = renderTwo();
    fireEvent.pointerEnter(first, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerLeave(first, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("떠 있는 동안 옆 대상으로 옮기면 바로 바뀐다", () => {
    const [first, second] = renderTwo();
    fireEvent.pointerEnter(first, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerLeave(first, { pointerType: "mouse" });
    fireEvent.pointerEnter(second, { pointerType: "mouse" });
    // 앞 툴팁은 페이드 없이 바로 빠져 둘이 겹치지 않습니다
    expect(screen.getAllByRole("tooltip").map((t) => t.textContent)).toEqual(["수정"]);
  });

  it("마우스가 떠나면 0.1초 기다렸다가 닫는다", () => {
    const [first] = renderTwo();
    fireEvent.pointerEnter(first, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerLeave(first, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(99));
    expect(screen.getByRole("tooltip")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    // 사라지는 페이드(150ms)가 끝나면 요소를 뺍니다
    act(() => vi.advanceTimersByTime(150));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("툴팁 위로 마우스를 옮기면 닫지 않는다", () => {
    const [first] = renderTwo();
    fireEvent.pointerEnter(first, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerLeave(first, { pointerType: "mouse" });
    fireEvent.pointerEnter(screen.getByRole("tooltip"), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("키보드 포커스에는 바로 뜨고, 대상을 설명하며, Esc로 닫힌다", () => {
    const [first] = renderTwo();
    act(() => first.focus());
    const tooltip = screen.getByRole("tooltip");
    expect(first.getAttribute("aria-describedby")).toBe(tooltip.id);

    fireEvent.keyDown(first, { key: "Escape" });
    act(() => vi.advanceTimersByTime(150));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("손가락 터치에는 뜨지 않는다", () => {
    const [first] = renderTwo();
    fireEvent.pointerEnter(first, { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
