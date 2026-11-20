import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell, useLeaveGuard } from "./AppShell";
import { Button } from "./Button";
import { DetailForm, FormWide } from "./DetailForm";
import { QueryBar } from "./QueryBar";
import { ScreenHeader, ScreenLayout, WorkArea } from "./Screen";
import { type MenuGroup, SideMenu } from "./SideMenu";
import { Tabs } from "./Tabs";
import { TextInput } from "./TextInput";

const groups: MenuGroup[] = [
  {
    name: "기준정보",
    items: [
      { screenId: "base.plant", name: "공장 관리", legacyId: "SIC01001" },
      { screenId: "base.shop", name: "Shop 관리", legacyId: "SIC01002" },
    ],
  },
  {
    name: "공정 정책",
    items: [
      { screenId: "process.policy", name: "공정 정책 관리", legacyId: "SIC01061" },
      { screenId: "process.route", name: "Route 관리", legacyId: "SIC01062" },
    ],
  },
];

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.textSize;
});

const itemNames = () => screen.queryAllByRole("button", { name: /SIC/ }).map((b) => b.textContent);

describe("SideMenu", () => {
  it("지금 화면의 묶음만 펼치고, 지금 화면을 알린다", () => {
    render(<SideMenu groups={groups} current="process.policy" onNavigate={() => {}} />);
    expect(itemNames()).toEqual(["공정 정책 관리SIC01061", "Route 관리SIC01062"]);
    expect(screen.getByRole("button", { name: /공정 정책 관리/ }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: /기준정보/ }).getAttribute("aria-expanded")).toBe("false");
  });

  it("묶음을 펼치고 접으며, 펼친 묶음을 기억한다", () => {
    const { unmount } = render(<SideMenu groups={groups} current="process.policy" onNavigate={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /기준정보/ }));
    expect(itemNames()).toContain("공장 관리SIC01001");
    unmount();
    render(<SideMenu groups={groups} current="process.policy" onNavigate={() => {}} />);
    expect(itemNames()).toContain("공장 관리SIC01001");
  });

  it("레거시 화면 ID로 모든 묶음에서 찾고, Enter로 첫 화면을 연다", () => {
    const onNavigate = vi.fn();
    render(<SideMenu groups={groups} current="process.policy" onNavigate={onNavigate} />);
    const search = screen.getByRole("searchbox", { name: "화면 찾기" });
    fireEvent.change(search, { target: { value: "sic0100" } });
    expect(itemNames()).toEqual(["공장 관리SIC01001", "Shop 관리SIC01002"]);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onNavigate).toHaveBeenCalledWith("base.plant");
  });

  it("찾는 화면이 없으면 알린다", () => {
    render(<SideMenu groups={groups} current="process.policy" onNavigate={() => {}} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "없는 화면" } });
    expect(screen.getByText("찾는 화면이 없습니다.")).toBeTruthy();
  });

  it("검색을 끄면 검색 칸이 없다", () => {
    render(<SideMenu groups={groups} current="process.policy" onNavigate={() => {}} search={false} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("화면 설정을 바꾸면 <html>에 적용하고 기억한다", () => {
    render(<SideMenu groups={groups} current="process.policy" onNavigate={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "다크" }));
    fireEvent.click(screen.getByRole("radio", { name: "크게" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.textSize).toBe("large");
    expect(JSON.parse(window.localStorage.getItem("mmd.display") ?? "{}")).toEqual({
      theme: "dark",
      textSize: "large",
    });
  });
});

function setWindowWidth(width: number) {
  vi.stubGlobal("innerWidth", width);
  act(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function Screen({ changes = 0 }: { changes?: number }) {
  useLeaveGuard(changes);
  return (
    <ScreenLayout>
      <ScreenHeader title="공정 정책 관리" ids={["PANEL_TPFOPOLICY", "레거시 SIC01061"]} />
      <WorkArea>그리드</WorkArea>
    </ScreenLayout>
  );
}

function Shell({ changes, onNavigate = () => {} }: { changes?: number; onNavigate?: (id: string) => void }) {
  return (
    <AppShell menu={groups} current="process.policy" onNavigate={onNavigate}>
      <Screen changes={changes} />
    </AppShell>
  );
}

describe("AppShell", () => {
  it("넓은 창에서는 메뉴를 펼쳐 두고, 접으면 화면 머리의 메뉴 버튼으로 서랍을 연다", () => {
    setWindowWidth(1600);
    render(<Shell />);
    expect(screen.getByRole("navigation", { name: "메뉴" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "메뉴 접기" }));
    expect(screen.queryByRole("navigation", { name: "메뉴" })).toBeNull();
    expect(window.localStorage.getItem("mmd.menu.collapsed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    const drawer = screen.getByRole("dialog", { name: "메뉴" });
    expect(within(drawer).getByRole("navigation", { name: "메뉴" })).toBeTruthy();

    fireEvent.click(within(drawer).getByRole("button", { name: "메뉴 펼쳐 두기" }));
    expect(screen.queryByRole("button", { name: "메뉴 열기" })).toBeNull();
  });

  it("1024px 미만에서는 메뉴가 서랍이고 Esc로 닫힌다", () => {
    setWindowWidth(900);
    render(<Shell />);
    fireEvent.click(screen.getByRole("button", { name: "메뉴 열기" }));
    const drawer = screen.getByRole("dialog", { name: "메뉴" });
    expect(within(drawer).getByRole("button", { name: "메뉴 닫기" })).toBeTruthy();
    fireEvent.keyDown(drawer, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "메뉴" })).toBeNull();
  });

  it("화면 머리에 제목과 ID 줄을 보인다", () => {
    setWindowWidth(1600);
    render(<Shell />);
    expect(screen.getByRole("heading", { level: 1, name: "공정 정책 관리" })).toBeTruthy();
    expect(screen.getByText("PANEL_TPFOPOLICY · 레거시 SIC01061")).toBeTruthy();
  });

  it("저장하지 않은 변경이 있으면 다른 화면으로 옮기기 전에 묻는다", async () => {
    setWindowWidth(1600);
    const onNavigate = vi.fn();
    render(<Shell changes={4} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: /기준정보/ }));
    fireEvent.click(screen.getByRole("button", { name: /공장 관리/ }));
    const dialog = await screen.findByRole("alertdialog", { name: "저장하지 않은 변경 4건을 버릴까요?" });
    expect(onNavigate).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "버리고 이동" }));
    });
    expect(onNavigate).toHaveBeenCalledWith("base.plant");
  });

  it("변경이 없으면 바로 옮긴다", () => {
    setWindowWidth(1600);
    const onNavigate = vi.fn();
    render(<Shell onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: /Route 관리/ }));
    return Promise.resolve().then(() => expect(onNavigate).toHaveBeenCalledWith("process.route"));
  });
});

describe("QueryBar", () => {
  function Query({ onSearch, onReset }: { onSearch: () => void; onReset: () => void }) {
    const [lot, setLot] = useState("");
    return (
      <QueryBar onSearch={onSearch} onReset={onReset}>
        <TextInput label="LOT 번호" code value={lot} onChange={setLot} />
      </QueryBar>
    );
  }

  it("조회 버튼과 칸의 Enter로 조회하고, 초기화를 부른다", () => {
    const onSearch = vi.fn();
    const onReset = vi.fn();
    render(<Query onSearch={onSearch} onReset={onReset} />);
    fireEvent.submit(screen.getByRole("form", { name: "조회 조건" }));
    fireEvent.click(screen.getByRole("button", { name: "조회" }));
    expect(onSearch).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "초기화" }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("조회 중에는 다시 조회하지 않는다", () => {
    const onSearch = vi.fn();
    render(
      <QueryBar onSearch={onSearch} busy>
        <span />
      </QueryBar>,
    );
    fireEvent.submit(screen.getByRole("form", { name: "조회 조건" }));
    expect(onSearch).not.toHaveBeenCalled();
  });
});

describe("Tabs", () => {
  it("고른 탭의 내용을 보이고 바꾼 탭을 넘긴다", () => {
    function Route() {
      const [tab, setTab] = useState("route");
      return (
        <Tabs
          label="Route"
          items={[
            { id: "route", label: "Route" },
            { id: "process", label: "Route 공정" },
          ]}
          selected={tab}
          onChange={setTab}
        >
          {(id) => <span>{id === "route" ? "Route 목록" : "Route 공정 목록"}</span>}
        </Tabs>
      );
    }
    render(<Route />);
    expect(screen.getByText("Route 목록")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "Route 공정" }));
    expect(screen.getByText("Route 공정 목록")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Route 공정" }).getAttribute("aria-selected")).toBe("true");
  });
});

describe("DetailForm", () => {
  it("제목과 대상 ID를 보이고, 저장 버튼으로 onSubmit을 부른다", () => {
    const onSubmit = vi.fn();
    render(
      <DetailForm
        title="Route 상세"
        targetId="RT-0102"
        onSubmit={onSubmit}
        actions={
          <Button variant="primary" type="submit">
            저장
          </Button>
        }
      >
        <FormWide>
          <TextInput label="설명" value="" onChange={() => {}} />
        </FormWide>
      </DetailForm>,
    );
    expect(screen.getByRole("heading", { name: "Route 상세 · RT-0102" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
