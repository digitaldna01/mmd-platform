import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Icon } from "./Icon";
import { iconArt, iconNames } from "./icons.generated";

describe("Icon", () => {
  afterEach(() => {
    delete document.documentElement.dataset.textSize;
  });

  it("글자 옆에 붙는 아이콘은 보조 기술에서 숨긴다", () => {
    const { container } = render(<Icon name="search" />);
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("이름을 주면 그림으로 읽힌다", () => {
    render(<Icon name="more" label="더 보기" />);
    expect(screen.getByRole("img", { name: "더 보기" })).toBeTruthy();
  });

  it("보통과 크게에 쓸 그림을 함께 그린다", () => {
    const { container } = render(<Icon name="check" size="sm" />);
    const boxes = [...container.querySelectorAll("svg")].map((svg) => svg.getAttribute("viewBox"));
    expect(boxes).toEqual(["0 0 12 12", "0 0 16 16"]);
  });

  it("모든 아이콘에 모든 크기의 그림이 있다", () => {
    for (const name of iconNames) {
      for (const size of [12, 16, 20, 24, 28] as const) {
        expect(iconArt[name][size].length).toBeGreaterThan(1);
      }
    }
  });
});
