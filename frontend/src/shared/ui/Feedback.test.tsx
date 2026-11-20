import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Banner } from "./Banner";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { TOAST_DURATION_MS, TOAST_MAX_VISIBLE, useToast } from "./Toast";
import { UiProvider } from "./UiProvider";

describe("EmptyState", () => {
  it("제목과 설명을 보이고, 오류면 바로 알린다", () => {
    const { rerender } = render(<EmptyState icon="filter" title="조건에 맞는 공정 정책이 없습니다." />);
    expect(screen.queryByRole("alert")).toBeNull();
    rerender(<EmptyState tone="error" title="조회하지 못했습니다." detail="추적 ID abc" />);
    expect(screen.getByRole("alert").textContent).toContain("추적 ID abc");
  });
});

describe("Banner", () => {
  it("안내 글을 보인다", () => {
    render(<Banner tone="warning">데모 데이터입니다.</Banner>);
    expect(screen.getByText("데모 데이터입니다.")).toBeTruthy();
  });
});

function ToastButtons() {
  const toast = useToast();
  return (
    <>
      <button type="button" onClick={() => toast.success({ title: "저장했습니다", description: "공정 정책 6건" })}>
        성공
      </button>
      <button
        type="button"
        onClick={() =>
          toast.error({ title: "저장하지 못했습니다", description: "서버에 연결할 수 없습니다.", traceId: "t-1" })
        }
      >
        오류
      </button>
    </>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  function renderToasts() {
    render(
      <UiProvider>
        <ToastButtons />
      </UiProvider>,
    );
  }

  const visibleTitles = () =>
    [...document.querySelectorAll("section[aria-label='알림'] li")].map((li) => li.querySelector("p")?.textContent);

  it("성공은 5초 뒤 사라지고, 마우스를 올린 동안에는 멈춘다", () => {
    renderToasts();
    fireEvent.click(screen.getByText("성공"));
    const toast = document.querySelector("section[aria-label='알림'] li") as HTMLElement;

    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 1000));
    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(10_000));
    expect(visibleTitles()).toEqual(["저장했습니다"]);

    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(150));
    expect(visibleTitles()).toEqual([]);
  });

  it("오류는 닫을 때까지 남고, 추적 ID와 복사 버튼을 보인다", () => {
    renderToasts();
    fireEvent.click(screen.getByText("오류"));
    act(() => vi.advanceTimersByTime(60_000));
    expect(visibleTitles()).toEqual(["저장하지 못했습니다"]);
    expect(screen.getByText("추적 ID t-1")).toBeTruthy(); // 16자 이하는 줄이지 않습니다
    expect(screen.getByRole("button", { name: "추적 ID 복사" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    act(() => vi.advanceTimersByTime(150));
    expect(visibleTitles()).toEqual([]);
  });

  it("오류는 바로(assertive), 성공은 차례로(polite) 스크린 리더에 알린다", () => {
    renderToasts();
    fireEvent.click(screen.getByText("오류"));
    fireEvent.click(screen.getByText("성공"));
    act(() => vi.advanceTimersByTime(60));
    expect(screen.getByRole("alert").textContent).toBe("저장하지 못했습니다. 서버에 연결할 수 없습니다.");
    expect(screen.getByRole("status").textContent).toBe("저장했습니다. 공정 정책 6건");
  });

  it(`한 번에 ${TOAST_MAX_VISIBLE}개까지 보이고 오래된 것부터 뺀다`, () => {
    renderToasts();
    for (let i = 0; i < TOAST_MAX_VISIBLE + 2; i++) fireEvent.click(screen.getByText("오류"));
    expect(visibleTitles()).toHaveLength(TOAST_MAX_VISIBLE);
  });
});

function DeleteSave({ onSave }: { onSave: () => void }) {
  const { confirm, dialog } = useConfirm();
  const [answer, setAnswer] = useState("");
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const ok = await confirm({
            title: "삭제 2건을 포함해 6건을 저장할까요?",
            description: "삭제한 공정 정책은 되돌릴 수 없습니다.",
            confirmLabel: "저장",
          });
          setAnswer(ok ? "저장함" : "취소함");
          if (ok) onSave();
        }}
      >
        저장 6건
      </button>
      <span>{answer}</span>
      {dialog}
    </>
  );
}

describe("useConfirm", () => {
  it("물음과 결과를 보이고, 처음 포커스는 취소에 둔다", () => {
    render(<DeleteSave onSave={() => {}} />);
    fireEvent.click(screen.getByText("저장 6건"));
    const dialog = screen.getByRole("alertdialog", { name: "삭제 2건을 포함해 6건을 저장할까요?" });
    expect(dialog.textContent).toContain("삭제한 공정 정책은 되돌릴 수 없습니다.");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "취소" }));
  });

  it("하는 일을 누르면 true로 진행한다", async () => {
    const onSave = vi.fn();
    render(<DeleteSave onSave={onSave} />);
    fireEvent.click(screen.getByText("저장 6건"));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "저장" }));
    });
    expect(onSave).toHaveBeenCalledOnce();
    expect(screen.getByText("저장함")).toBeTruthy();
  });

  it("Esc는 취소로 끝난다", async () => {
    const onSave = vi.fn();
    render(<DeleteSave onSave={onSave} />);
    fireEvent.click(screen.getByText("저장 6건"));
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("취소함")).toBeTruthy();
  });
});
