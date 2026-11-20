import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";
import { RadioGroup } from "./RadioGroup";
import { SegmentedControl } from "./SegmentedControl";
import { type YesNo, YesNoField } from "./YesNoField";

describe("Checkbox", () => {
  it("글자가 이름이 되고, 누르면 반대 값을 넘긴다", () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={onChange}>
        숨긴 열도 내려받기
      </Checkbox>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "숨긴 열도 내려받기" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("글자 없이 상자만 둘 때는 label이 이름이다", () => {
    render(<Checkbox size="sm" label="1010 고르기" checked onChange={() => {}} />);
    expect(screen.getByRole<HTMLInputElement>("checkbox", { name: "1010 고르기" }).checked).toBe(true);
  });

  it("일부만 고른 상태를 알린다", () => {
    render(<Checkbox label="전체 고르기" checked={false} indeterminate onChange={() => {}} />);
    expect(screen.getByRole<HTMLInputElement>("checkbox").indeterminate).toBe(true);
  });

  it("비활성 체크박스는 바뀌지 않고 이유를 설명으로 단다", () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={onChange} disabledReason="조회한 뒤에 고를 수 있습니다">
        고른 행만
      </Checkbox>,
    );
    const box = screen.getByRole<HTMLInputElement>("checkbox", {
      name: "고른 행만",
      description: "조회한 뒤에 고를 수 있습니다",
    });
    expect(box.disabled).toBe(true);
    // 사람이 누르는 자리(글자)를 누릅니다. jsdom은 비활성 input에 직접 보낸 click도 처리하므로 input을 누르지 않습니다
    fireEvent.click(screen.getByText("고른 행만"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "visible", label: "보이는 열", description: "화면에서 숨긴 열은 빼고 내려받습니다." },
    { value: "all", label: "모든 열", description: "숨긴 열까지 모두 내려받습니다." },
  ];

  it("선택지와 설명을 보이고, 고르면 값을 넘긴다", () => {
    const onChange = vi.fn();
    render(<RadioGroup label="내려받을 열" options={options} value="visible" onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "내려받을 열" })).toBeTruthy();
    expect(screen.getByText("숨긴 열까지 모두 내려받습니다.")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /모든 열/ }));
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("오류 문구를 묶음의 설명으로 잇는다", () => {
    render(
      <RadioGroup
        label="내려받을 열"
        required
        options={options}
        value={null}
        onChange={() => {}}
        error="내려받을 열을 선택하세요."
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "내려받을 열", description: "내려받을 열을 선택하세요." }),
    ).toBeTruthy();
  });
});

describe("SegmentedControl", () => {
  const options = [
    { value: "below", label: "아래" },
    { value: "above", label: "위" },
  ];

  it("라벨을 숨겨도 묶음의 이름이 되고, 누르면 값을 넘긴다", () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="기준 행" hideLabel options={options} value="below" onChange={onChange} />);
    const group = screen.getByRole("radiogroup", { name: "기준 행" });
    expect(group).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "위" }));
    expect(onChange).toHaveBeenCalledWith("above");
  });

  it("비활성이면 고를 수 없고 이유를 설명으로 단다", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="기준 행"
        options={options}
        value="below"
        onChange={onChange}
        disabledReason="행을 먼저 고르세요"
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "기준 행", description: "행을 먼저 고르세요" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "위" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("YesNoField", () => {
  function NewRecord({ initial }: { initial: YesNo | null }) {
    const [value, setValue] = useState<YesNo | null>(initial);
    const [tried, setTried] = useState(false);
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setTried(true);
        }}
      >
        <YesNoField
          label="필수공정여부"
          required
          value={value}
          onChange={setValue}
          error={tried && value === null ? "필수공정여부를 선택하세요." : undefined}
        />
        <button type="submit">저장</button>
      </form>
    );
  }

  it("기본값이 없으면 Y와 N 어느 쪽도 고르지 않은 채로 시작한다", () => {
    render(<NewRecord initial={null} />);
    const radios = screen.getAllByRole<HTMLInputElement>("radio");
    expect(radios.map((r) => r.labels?.[0]?.textContent)).toEqual(["Y", "N"]);
    expect(radios.every((r) => !r.checked)).toBe(true);
    expect(screen.getByRole("radiogroup", { name: "필수공정여부" }).getAttribute("aria-required")).toBe("true");
  });

  it("고르지 않고 저장하면 오류가 되고, 고르면 오류가 사라진다", () => {
    render(<NewRecord initial={null} />);
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(screen.getByText("필수공정여부를 선택하세요.")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "N" }));
    expect(screen.queryByText("필수공정여부를 선택하세요.")).toBeNull();
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "N" }).checked).toBe(true);
  });

  it("명세의 기본값이 있으면 그 값이 골라진 채로 시작한다", () => {
    render(<NewRecord initial="Y" />);
    expect(screen.getByRole<HTMLInputElement>("radio", { name: "Y" }).checked).toBe(true);
  });

  it("읽기 전용은 Y, N 글자로 보이고 비었으면 –를 보인다", () => {
    const { rerender } = render(<YesNoField label="사용여부" readOnly value="N" onChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "사용여부" }).textContent).toBe("N");
    rerender(<YesNoField label="사용여부" readOnly value={null} onChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "사용여부" }).textContent).toBe("–");
  });
});
