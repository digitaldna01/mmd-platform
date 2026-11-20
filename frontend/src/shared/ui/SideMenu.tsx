import { type ReactNode, useEffect, useId, useState } from "react";
import { Input, SearchField } from "react-aria-components";
import { Icon } from "../icons/Icon";
import {
  applyDisplaySettings,
  type DisplaySettings,
  readDisplaySettings,
  type TextSize,
  type ThemePreference,
} from "../styles/display";
import { Button } from "./Button";
import field from "./field.module.css";
import { cx } from "./FieldParts";
import { SegmentedControl } from "./SegmentedControl";
import styles from "./SideMenu.module.css";

export interface MenuItem {
  /** 화면 ID(registry의 열쇠) */
  screenId: string;
  /** 메뉴에 보이는 화면 이름 */
  name: string;
  /** 레거시 화면 ID(SIC01061). 이름 뒤에 보이고 검색됩니다 */
  legacyId?: string;
}

export interface MenuGroup {
  name: string;
  items: readonly MenuItem[];
}

export interface SideMenuProps {
  groups: readonly MenuGroup[];
  /** 지금 화면 ID */
  current: string;
  onNavigate: (screenId: string) => void;
  /** 메뉴 검색 칸. 회사에서 화면 수와 사용 습관을 확인한 뒤 켜고 끕니다(src/app/menu.ts의 MENU_SEARCH) */
  search?: boolean;
  /** 로고 줄 오른쪽 버튼: 메뉴를 접거나, 서랍을 닫거나, 접은 메뉴를 다시 펼칩니다 */
  edgeButton?: { icon: "chevron-left" | "chevron-right" | "close"; label: string; onPress: () => void };
  /** 아래에 보이는 사용자. 로그인을 만들면 넘깁니다 */
  user?: { name: string; detail?: string; onLogout?: () => void };
}

const OPEN_GROUPS_KEY = "mmd.menu.openGroups";

function readOpenGroups(): string[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem(OPEN_GROUPS_KEY) ?? "[]") as unknown;
    return Array.isArray(saved) ? saved.filter((name): name is string => typeof name === "string") : [];
  } catch {
    return [];
  }
}

function saveOpenGroups(names: string[]) {
  try {
    window.localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(names));
  } catch {
    // 저장소를 쓸 수 없으면 이번 창에서만 기억합니다
  }
}

const matches = (item: MenuItem, term: string) =>
  `${item.name} ${item.legacyId ?? ""}`.toLowerCase().includes(term.toLowerCase());

/** 검색어와 맞는 글자를 굵게 밑줄로 */
function highlight(text: string, term: string): ReactNode {
  const at = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className={styles.match}>{text.slice(at, at + term.length)}</mark>
      {text.slice(at + term.length)}
    </>
  );
}

/**
 * 사이드 메뉴: 로고, 메뉴 검색, 묶음별 화면, 화면 설정(테마, 글자 크기), 사용자.
 * 묶음은 접고 펼 수 있고(지금 화면의 묶음은 늘 펼침), 펼친 묶음을 기억합니다.
 * 보통은 AppShell이 그리므로 화면에서 직접 쓰지 않습니다.
 * 규칙: docs/design-guide.md '사이드 메뉴'
 */
export function SideMenu({ groups, current, onNavigate, search = true, edgeButton, user }: SideMenuProps) {
  const [term, setTerm] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>(readOpenGroups);
  const [display, setDisplay] = useState<DisplaySettings>(readDisplaySettings);
  const listId = useId();
  const currentGroup = groups.find((group) => group.items.some((item) => item.screenId === current))?.name;

  // 화면에 들어오면 그 화면의 묶음을 펼칩니다. 그 뒤에는 사용자가 접을 수 있습니다
  useEffect(() => {
    if (currentGroup) setOpenGroups((names) => (names.includes(currentGroup) ? names : [...names, currentGroup]));
  }, [currentGroup]);

  const toggleGroup = (name: string) => {
    const next = openGroups.includes(name) ? openGroups.filter((n) => n !== name) : [...openGroups, name];
    setOpenGroups(next);
    saveOpenGroups(next);
  };

  const changeDisplay = (next: Partial<DisplaySettings>) => {
    const merged = { ...display, ...next };
    setDisplay(merged);
    applyDisplaySettings(merged);
  };

  const query = term.trim();
  const visible = groups
    .map((group) => ({ ...group, items: query ? group.items.filter((item) => matches(item, query)) : group.items }))
    .filter((group) => group.items.length > 0);

  const navigate = (screenId: string) => {
    setTerm("");
    onNavigate(screenId);
  };

  return (
    <nav className={styles.nav} aria-label="메뉴">
      <div className={styles.logo}>
        <span className={styles.grow}>MMD</span>
        {edgeButton && (
          <Button
            variant="ghost"
            size="sm"
            icon={edgeButton.icon}
            label={edgeButton.label}
            onClick={edgeButton.onPress}
          />
        )}
      </div>

      {search && (
        <SearchField
          className={styles.search}
          aria-label="화면 찾기"
          aria-controls={listId}
          value={term}
          onChange={setTerm}
          onSubmit={() => {
            const first = visible[0]?.items[0];
            if (first) navigate(first.screenId);
          }}
        >
          <Icon name="search" className={styles.searchIcon} />
          <Input className={cx(field.control, styles.searchInput)} placeholder="화면 이름, ID" />
        </SearchField>
      )}

      <div className={styles.list} id={listId}>
        {visible.length === 0 && <p className={styles.empty}>찾는 화면이 없습니다.</p>}
        {visible.map((group, index) => {
          // 검색 중에는 맞는 화면이 있는 묶음을 모두 펼칩니다
          const open = query !== "" || openGroups.includes(group.name);
          const groupId = `${listId}-group-${index}`;
          return (
            <div key={group.name} className={styles.group}>
              <button
                type="button"
                className={styles.groupButton}
                aria-expanded={open}
                aria-controls={groupId}
                onClick={() => toggleGroup(group.name)}
              >
                <Icon name="chevron-down" size="sm" className={styles.chevron} />
                {group.name}
                <span className={styles.count}>{group.items.length}</span>
              </button>
              {open && (
                <div id={groupId} className={styles.group}>
                  {group.items.map((item) => (
                    <button
                      key={item.screenId}
                      type="button"
                      className={styles.item}
                      aria-current={item.screenId === current ? "page" : undefined}
                      onClick={() => navigate(item.screenId)}
                    >
                      <span className={styles.name}>{highlight(item.name, query)}</span>
                      {item.legacyId && <span className={styles.legacyId}>{highlight(item.legacyId, query)}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <SegmentedControl
          label="테마"
          size="sm"
          value={display.theme}
          onChange={(theme) => changeDisplay({ theme: theme as ThemePreference })}
          options={[
            { value: "system", label: "시스템" },
            { value: "light", label: "라이트" },
            { value: "dark", label: "다크" },
          ]}
        />
        <SegmentedControl
          label="글자 크기"
          size="sm"
          value={display.textSize}
          onChange={(textSize) => changeDisplay({ textSize: textSize as TextSize })}
          options={[
            { value: "normal", label: "보통" },
            { value: "large", label: "크게" },
          ]}
        />
        {user && (
          <div className={styles.user}>
            <Icon name="user" />
            <span className={styles.grow}>
              {user.name}
              {user.detail && <span className={styles.userDetail}> · {user.detail}</span>}
            </span>
            {user.onLogout && (
              <Button variant="ghost" size="sm" icon="logout" label="로그아웃" onClick={user.onLogout} />
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
