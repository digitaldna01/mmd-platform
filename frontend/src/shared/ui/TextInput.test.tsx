import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextInput, type TextInputProps } from "./TextInput";

function Controlled(props: Partial<TextInputProps> & { label: string }) {
  const [value, setValue] = useState(props.value ?? "");
  return <TextInput {...props} value={value} onChange={setValue} />;
}

describe("TextInput", () => {
  it("라벨이 칸의 이름이 되고, 입력하면 onChange로 값을 넘긴다", () => {
    const onChange = vi.fn();
    render(<TextInput label="LOT 번호" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "LOT 번호" }), { target: { value: "L2611" } });
    expect(onChange).toHaveBeenCalledWith("L2611");
  });

  it("필수 칸은 aria-required이고 라벨 뒤 '*'는 읽지 않는다", () => {
    render(<Controlled label="Route 이름" required />);
    const input = screen.getByRole("textbox", { name: "Route 이름" });
    expect(input.getAttribute("aria-required")).toBe("true");
  });

  it("오류 문구를 칸 아래에 보이고 칸의 설명으로 잇는다", () => {
    render(<Controlled label="Route 이름" required error="Route 이름을 입력하세요." />);
    const input = screen.getByRole("textbox", { name: "Route 이름", description: "Route 이름을 입력하세요." });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Route 이름을 입력하세요.")).toBeTruthy();
  });

  it("읽기 전용 칸은 고칠 수 없지만 포커스는 받는다", () => {
    render(<Controlled label="Route" value="RT-0102" readOnly code />);
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Route" });
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(false);
  });

  it("비활성 칸은 이유를 자리 표시 글자와 설명으로 알린다", () => {
    render(<Controlled label="Shop 메모" disabledReason="Shop을 먼저 선택" />);
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Shop 메모", description: "Shop을 먼저 선택" });
    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe("Shop을 먼저 선택");
  });
});
