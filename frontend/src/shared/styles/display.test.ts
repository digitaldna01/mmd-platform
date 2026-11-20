import { afterEach, describe, expect, it } from "vitest";
import { WIDE_SCREEN_MIN_WIDTH, watchScreenSize } from "./display";

function setScreenWidth(width: number) {
  Object.defineProperty(window.screen, "width", { configurable: true, value: width });
}

describe("watchScreenSize", () => {
  let stop: (() => void) | undefined;

  afterEach(() => {
    stop?.();
    delete document.documentElement.dataset.screen;
  });

  it("모니터 폭이 기준 이상이면 넓은 모니터로 표시한다", () => {
    setScreenWidth(WIDE_SCREEN_MIN_WIDTH);
    stop = watchScreenSize();
    expect(document.documentElement.dataset.screen).toBe("wide");
  });

  it("모니터 폭이 기준보다 작으면 표시하지 않는다", () => {
    setScreenWidth(1920);
    stop = watchScreenSize();
    expect(document.documentElement.dataset.screen).toBeUndefined();
  });

  it("다른 모니터로 옮기면 다시 계산한다", () => {
    setScreenWidth(2560);
    stop = watchScreenSize();
    setScreenWidth(1920);
    window.dispatchEvent(new Event("resize"));
    expect(document.documentElement.dataset.screen).toBeUndefined();
  });
});
