import type { ScreenId } from "../screens/registry";
import type { MenuGroup } from "../shared/ui/SideMenu";

/**
 * 메뉴 검색 칸. 켜면 화면 이름과 레거시 화면 ID로 모든 묶음에서 찾습니다.
 * 회사에서 화면 수와 사용 습관을 확인한 뒤 정합니다(디자인 가이드 '사이드 메뉴').
 */
export const MENU_SEARCH = true;

interface AppMenuItem {
  screenId: ScreenId;
  name: string;
  legacyId?: string;
}

/**
 * 메뉴 묶음과 화면. 화면을 만들면 screens/registry.ts와 여기에 함께 더합니다.
 * 이름은 화면 머리의 제목과 같게 씁니다.
 */
export const menu: ReadonlyArray<MenuGroup & { items: readonly AppMenuItem[] }> = [
  {
    name: "시스템",
    items: [{ screenId: "system.info", name: "시스템 정보" }],
  },
];

/** 처음 여는 화면 */
export const HOME_SCREEN: ScreenId = "system.info";
