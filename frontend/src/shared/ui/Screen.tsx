import type { ReactNode } from "react";
import { useShell } from "./AppShell";
import { Button } from "./Button";
import styles from "./Screen.module.css";

/**
 * 화면의 바깥: 화면 머리, (탭), 조회 조건, 작업 영역을 세로로 놓습니다. 화면 가장자리는 16px입니다.
 * 규칙: docs/design-guide.md '화면 골격'
 *
 * @example
 * <ScreenLayout>
 *   <ScreenHeader title="공정 정책 관리" ids={["PANEL_TPFOPOLICY", "레거시 SIC01061"]} />
 *   <QueryBar onSearch={search} onReset={reset}>...</QueryBar>
 *   <WorkArea>{그리드}</WorkArea>
 * </ScreenLayout>
 */
export function ScreenLayout({ children }: { children: ReactNode }) {
  return <div className={styles.screen}>{children}</div>;
}

export interface ScreenHeaderProps {
  /** 화면 이름. 메뉴의 이름과 같게 씁니다 */
  title: string;
  /** ID 줄: 패널 ID, 레거시 화면 ID, 화면 ID. 가운데점으로 이어 보입니다 */
  ids?: readonly string[];
}

/**
 * 화면 머리: 제목과 ID 줄. 메뉴가 서랍이면 제목 왼쪽에 메뉴 버튼을, 에이전트 패널이 있으면 오른쪽에 에이전트 버튼을 둡니다.
 * 스크롤하지 않습니다.
 */
export function ScreenHeader({ title, ids = [] }: ScreenHeaderProps) {
  const shell = useShell();
  return (
    <header className={styles.header}>
      {shell.menuMode === "drawer" && <Button variant="ghost" icon="menu" label="메뉴 열기" onClick={shell.openMenu} />}
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {ids.length > 0 && <p className={styles.ids}>{ids.join(" · ")}</p>}
      </div>
      {shell.hasDock && (
        <Button variant="ghost" onClick={shell.toggleDock} aria-expanded={shell.dockOpen}>
          <span className={styles.ring} aria-hidden="true" />
          에이전트
        </Button>
      )}
    </header>
  );
}

/** 작업 영역: 화면의 남은 높이를 채웁니다. 그리드, 목록과 상세, 상세 폼을 둡니다 */
export function WorkArea({ children }: { children: ReactNode }) {
  return <div className={styles.work}>{children}</div>;
}
