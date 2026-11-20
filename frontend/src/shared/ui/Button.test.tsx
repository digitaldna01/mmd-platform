import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("form을 실수로 보내지 않도록 기본 type은 button이다", () => {
    render(<Button>취소</Button>);
    expect(screen.getByRole("button", { name: "취소" }).getAttribute("type")).toBe("button");
  });

  it("누르면 onClick을 부른다", () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" icon="search" onClick={onClick}>
        조회
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "조회" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("개수를 표기 규칙대로 글자 뒤에 붙인다", () => {
    render(
      <Button variant="primary" count={1234} countUnit="건">
        저장
      </Button>,
    );
    expect(screen.getByRole("button", { name: "저장 1,234건" })).toBeTruthy();
  });

  it("방향을 뜻하는 아이콘은 글자와 개수 뒤에 붙일 수 있다", () => {
    render(
      <Button icon="arrow-right" iconPosition="end" count={3}>
        추가
      </Button>,
    );
    const button = screen.getByRole("button", { name: "추가 3" });
    expect(button.lastElementChild?.tagName).toBe("SPAN");
    expect(button.textContent).toBe("추가 3");
  });

  it("아이콘만 있는 버튼은 label이 이름이고, 키보드 포커스에 이름 툴팁을 띄운다", () => {
    render(<Button variant="ghost" icon="refresh" label="새로 고침" />);
    const button = screen.getByRole("button", { name: "새로 고침" });
    act(() => button.focus());
    expect(screen.getByRole("tooltip").textContent).toBe("새로 고침");
  });

  it("비활성 버튼은 포커스를 받고, 누르지 않으며, 이유를 설명으로 단다", () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" disabledReason="저장할 변경이 없습니다" onClick={onClick}>
        저장
      </Button>,
    );
    const button = screen.getByRole("button", { name: "저장", description: "저장할 변경이 없습니다" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    act(() => button.focus());
    expect(document.activeElement).toBe(button);
    expect(screen.getByRole("tooltip").textContent).toBe("저장할 변경이 없습니다");
  });

  it("form 안의 비활성 submit 버튼은 form을 보내지 않는다", () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button type="submit" variant="primary" disabledReason="필수 값을 입력하세요">
          저장
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("처리 중에는 누른 순간부터 다시 누를 수 없고, 0.3초 뒤에 아이콘 자리에 스피너를 그린다", () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    render(
      <Button variant="primary" icon="search" busy onClick={onClick}>
        조회
      </Button>,
    );
    const button = screen.getByRole("button", { name: "조회" });
    expect(button.getAttribute("aria-busy")).toBe("true");

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    expect(button.querySelector("circle")).toBeNull();
    act(() => vi.advanceTimersByTime(300));
    expect(button.querySelector("circle")).not.toBeNull();
  });

  it("개수가 0인데 비활성이 아니면 개발 중에 경고한다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Button variant="primary" count={0} countUnit="건">
        저장
      </Button>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
