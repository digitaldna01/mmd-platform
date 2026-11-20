import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { formatNumber } from "../format/format";
import styles from "./AppShell.module.css";
import { useConfirm } from "./ConfirmDialog";
import { cx } from "./FieldParts";
import { type MenuGroup, SideMenu, type SideMenuProps } from "./SideMenu";

/** 이 창 폭 이상이면 에이전트 패널을 열어도 메뉴가 그대로입니다. 규칙: docs/design-guide.md '화면 배치 구간' */
export const WIDE_WINDOW_MIN_WIDTH = 1440;
/** 이 창 폭 이상에서만 메뉴를 펼쳐 둡니다. 미만이면 늘 서랍입니다 */
export const DOCKED_MENU_MIN_WIDTH = 1024;

const COLLAPSED_KEY = "mmd.menu.collapsed";

interface ShellState {
  /** docked: 왼쪽에 펼쳐 둠, drawer: 화면 머리의 메뉴 버튼으로 엽니다 */
  menuMode: "docked" | "drawer";
  openMenu: () => void;
  /** 에이전트 패널이 있는지 */
  hasDock: boolean;
  dockOpen: boolean;
  toggleDock: () => void;
  registerChanges: (key: symbol, count: number) => void;
}

const ShellContext = createContext<ShellState>({
  menuMode: "docked",
  openMenu: () => {},
  hasDock: false,
  dockOpen: false,
  toggleDock: () => {},
  registerChanges: () => {},
});

/** 화면 머리 등이 앱 틀의 상태를 읽을 때 씁니다 */
export function useShell(): ShellState {
  return useContext(ShellContext);
}

/**
 * 저장하지 않은 변경 수를 앱 틀에 알립니다. 0보다 크면 다른 화면으로 옮기거나 창을 닫을 때 확인 창을 띄웁니다.
 * 규칙: docs/design-guide.md '확인 창을 띄우는 때'
 *
 * @example
 * useLeaveGuard(changedRows.length);
 */
export function useLeaveGuard(changedCount: number): void {
  const { registerChanges } = useShell();
  const [key] = useState(() => Symbol("screen-changes"));
  useEffect(() => {
    registerChanges(key, changedCount);
    return () => registerChanges(key, 0);
  }, [key, changedCount, registerChanges]);
}

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function useWindowWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

export interface AppShellProps {
  /** 메뉴 묶음과 화면 */
  menu: readonly MenuGroup[];
  /** 지금 화면 ID */
  current: string;
  /** 화면을 옮깁니다. 저장하지 않은 변경이 있으면 확인한 뒤에만 불립니다 */
  onNavigate: (screenId: string) => void;
  /** 메뉴 검색 칸(src/app/menu.ts의 MENU_SEARCH) */
  menuSearch?: boolean;
  user?: SideMenuProps["user"];
  /** 에이전트 패널. 있으면 화면 머리에 에이전트 버튼이 생깁니다(에이전트 단계에서 채움) */
  dock?: ReactNode;
  /** 지금 화면 */
  children: ReactNode;
}

/**
 * 앱 틀: 위쪽 막대 없이 왼쪽 사이드 메뉴, 가운데 화면, 오른쪽 에이전트 패널.
 * 메뉴는 창 폭과 사용자가 접은 상태에 따라 펼쳐 두거나 서랍이 됩니다.
 * - 1440 이상: 펼침, 에이전트 패널을 열어도 그대로
 * - 1024~1439: 펼침, 에이전트 패널을 열면 서랍
 * - 1024 미만: 서랍
 * 사용자가 접은 상태는 창 폭과 상관없이 기억합니다.
 * 규칙: docs/design-guide.md '화면 골격', '화면 배치 구간'
 */
export function AppShell({ menu, current, onNavigate, menuSearch = true, user, dock, children }: AppShellProps) {
  const width = useWindowWidth();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const changes = useRef(new Map<symbol, number>());
  const firstRender = useRef(true);
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    firstRender.current = false;
  }, []);

  const hasDock = dock !== undefined;
  const narrow = width < DOCKED_MENU_MIN_WIDTH;
  const crowded = hasDock && dockOpen && width < WIDE_WINDOW_MIN_WIDTH;
  const menuMode = collapsed || narrow || crowded ? "drawer" : "docked";

  useEffect(() => {
    if (menuMode === "docked") setDrawerOpen(false);
  }, [menuMode]);

  const remember = (next: boolean) => {
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
      // 저장소를 쓸 수 없으면 이번 창에서만 기억합니다
    }
  };

  const changedCount = () => [...changes.current.values()].reduce((sum, n) => sum + n, 0);

  const registerChanges = useCallback((key: symbol, count: number) => {
    if (count > 0) changes.current.set(key, count);
    else changes.current.delete(key);
  }, []);

  // 저장하지 않은 변경이 있으면 창을 닫거나 새로 고칠 때 브라우저가 묻습니다
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (changedCount() > 0) event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const navigate = async (screenId: string) => {
    setDrawerOpen(false);
    if (screenId === current) return;
    const count = changedCount();
    if (
      count > 0 &&
      !(await confirm({
        title: `저장하지 않은 변경 ${formatNumber(count)}건을 버릴까요?`,
        description: "다른 화면으로 옮기면 고친 내용이 사라집니다.",
        confirmLabel: "버리고 이동",
      }))
    ) {
      return;
    }
    changes.current.clear();
    onNavigate(screenId);
  };

  // 로고 줄 오른쪽 버튼: 펼친 메뉴는 '접기', 사용자가 접은 서랍은 '펼쳐 두기', 창이 좁아 생긴 서랍은 '닫기'
  const edgeButton: SideMenuProps["edgeButton"] =
    menuMode === "docked"
      ? { icon: "chevron-left", label: "메뉴 접기", onPress: () => remember(true) }
      : collapsed && !narrow && !crowded
        ? { icon: "chevron-right", label: "메뉴 펼쳐 두기", onPress: () => remember(false) }
        : { icon: "close", label: "메뉴 닫기", onPress: () => setDrawerOpen(false) };

  const sideMenu = (
    <SideMenu
      groups={menu}
      current={current}
      onNavigate={(screenId) => void navigate(screenId)}
      search={menuSearch}
      edgeButton={edgeButton}
      user={user}
    />
  );

  const state: ShellState = {
    menuMode,
    openMenu: () => setDrawerOpen(true),
    hasDock,
    dockOpen,
    toggleDock: () => setDockOpen((open) => !open),
    registerChanges,
  };

  return (
    <ShellContext.Provider value={state}>
      <div className={styles.shell}>
        {menuMode === "docked" && (
          <div className={cx(styles.navDock, !firstRender.current && styles.enter)}>{sideMenu}</div>
        )}
        <main className={styles.main}>{children}</main>
        {hasDock && dockOpen && (
          <aside className={styles.dock} aria-label="에이전트">
            <div className={styles.dockInner}>{dock}</div>
          </aside>
        )}
      </div>
      <ModalOverlay
        className={styles.scrim}
        isOpen={menuMode === "drawer" && drawerOpen}
        onOpenChange={setDrawerOpen}
        isDismissable
      >
        <Modal className={styles.drawer}>
          <Dialog className={styles.drawerDialog} aria-label="메뉴">
            {sideMenu}
          </Dialog>
        </Modal>
      </ModalOverlay>
      {dialog}
    </ShellContext.Provider>
  );
}
