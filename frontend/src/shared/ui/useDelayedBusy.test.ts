import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDelayedBusy } from "./useDelayedBusy";

describe("useDelayedBusy", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("0.3초 안에 끝나면 표시하지 않는다", () => {
    const { result, rerender } = renderHook(({ busy }) => useDelayedBusy(busy), { initialProps: { busy: true } });
    act(() => vi.advanceTimersByTime(299));
    rerender({ busy: false });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });

  it("0.3초가 넘으면 표시하고, 한번 보이면 0.5초는 둔다", () => {
    const { result, rerender } = renderHook(({ busy }) => useDelayedBusy(busy), { initialProps: { busy: true } });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe(true);

    act(() => vi.advanceTimersByTime(100));
    rerender({ busy: false });
    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it("0.5초가 지난 뒤 끝나면 바로 내린다", () => {
    const { result, rerender } = renderHook(({ busy }) => useDelayedBusy(busy), { initialProps: { busy: true } });
    act(() => vi.advanceTimersByTime(2000));
    rerender({ busy: false });
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe(false);
  });
});
