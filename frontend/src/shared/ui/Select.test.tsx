import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select, SELECT_SEARCH_THRESHOLD, type SelectItem, type SelectProps } from "./Select";

const processes: SelectItem[] = [
  { value: "1010", code: "1010", name: "자재 투입" },
  { value: "1100", code: "1100", name: "프레스 성형" },
  { value: "1300", code: "1300", name: "도장", meta: "사용 안 함" },
];

const partNumbers: SelectItem[] = Array.from({ length: SELECT_SEARCH_THRESHOLD + 5 }, (_, i) => ({
  value: `PN-${2001 + i}`,
  code: `PN-${2001 + i}`,
  name: i === 3 ? "수출형" : "개발 모델",
}));

function Controlled(props: Partial<SelectProps> & { onValue?: (value: string | null) => void }) {
  const [value, setValue] = useState<string | null>(props.value ?? null);
  return (
    <Select
      label="공정"
      items={processes}
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onValue?.(next);
      }}
    />
  );
}

function trigger(name: RegExp | string = /공정/) {
  return screen.getByRole("button", { name });
}

function open(name?: RegExp | string) {
  fireEvent.keyDown(trigger(name), { key: "ArrowDown" });
  return screen.getByRole("listbox");
}

describe("Select", () => {
  it("고른 값을 '코드 · 이름'으로 보이고, 고르면 onChange로 값을 넘긴다", () => {
    const onValue = vi.fn();
    render(<Controlled value="1010" onValue={onValue} />);
    expect(trigger().textContent).toContain("1010 · 자재 투입");

    const list = open();
    fireEvent.click(within(list).getByRole("option", { name: /1100/ }));
    expect(onValue).toHaveBeenCalledWith("1100");
    expect(trigger().textContent).toContain("1100 · 프레스 성형");
  });

  it("고르지 않았으면 자리 표시 글자 '선택'을 보인다", () => {
    render(<Controlled />);
    expect(trigger().textContent).toContain("선택");
  });

  it("비워도 되는 칸은 맨 위 '전체'로 비우고 null을 넘긴다", () => {
    const onValue = vi.fn();
    render(<Controlled value="1100" emptyLabel="전체" onValue={onValue} />);
    const list = open();
    const options = within(list).getAllByRole("option");
    expect(options[0]?.textContent).toBe("전체");

    fireEvent.click(options[0] as HTMLElement);
    expect(onValue).toHaveBeenCalledWith(null);
    expect(trigger().textContent).toContain("전체");
  });

  it("항목 오른쪽 끝에 보조 정보를 보인다", () => {
    render(<Controlled />);
    const list = open();
    expect(within(list).getByRole("option", { name: /1300/ }).textContent).toContain("사용 안 함");
  });

  it(`항목이 ${SELECT_SEARCH_THRESHOLD}개를 넘으면 검색 칸으로 거른다`, () => {
    render(<Controlled label="P/N" items={partNumbers} />);
    const list = open(/P\/N/);
    expect(within(list).getAllByRole("option")).toHaveLength(partNumbers.length);

    const search = screen.getByRole("searchbox", { name: "검색" });
    fireEvent.change(search, { target: { value: "수출" } });
    expect(
      within(screen.getByRole("listbox"))
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["PN-2004 · 수출형"]);

    fireEvent.change(search, { target: { value: "없는 값" } });
    expect(screen.getByText("검색 결과가 없습니다.")).toBeTruthy();
  });

  it("항목이 적으면 검색 칸이 없다", () => {
    render(<Controlled />);
    open();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("오류 문구를 보이고 칸을 오류 상태로 둔다", () => {
    render(<Controlled required error="공정을 선택하세요." />);
    expect(screen.getByText("공정을 선택하세요.")).toBeTruthy();
    expect(trigger().closest("[data-invalid]")).not.toBeNull();
  });

  it("비활성 칸은 열리지 않고 이유를 보인다", () => {
    render(<Controlled label="Shop" disabledReason="공장을 먼저 선택" />);
    const button = trigger(/Shop/);
    expect(button.textContent).toContain("공장을 먼저 선택");
    act(() => {
      fireEvent.keyDown(button, { key: "ArrowDown" });
    });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("연쇄 선택에서 비활성이고 값이 없으면 '전체' 대신 이유를 보인다", () => {
    render(<Controlled label="Shop" emptyLabel="전체" items={[]} disabledReason="공장을 먼저 선택" />);
    expect(trigger(/Shop/).textContent).toContain("공장을 먼저 선택");
  });

  it("읽기 전용 칸은 목록 없이 값만 보인다", () => {
    render(<Controlled value="1100" readOnly />);
    const box = screen.getByRole("textbox", { name: "공정" });
    expect(box.getAttribute("aria-readonly")).toBe("true");
    expect(box.textContent).toBe("1100 · 프레스 성형");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
