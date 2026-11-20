import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs as AriaTabs } from "react-aria-components";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  /** 탭 묶음의 이름(보조 기술용) */
  label: string;
  items: readonly TabItem[];
  selected: string;
  onChange: (id: string) => void;
  /** 고른 탭의 내용: 조회 조건과 작업 영역 */
  children: (id: string) => ReactNode;
}

/**
 * 탭: 화면 머리 바로 아래에 둡니다. 탭마다 조회 조건과 작업 영역이 따로 있습니다.
 * 탭을 바꿔도 앞 탭에서 고른 조회 조건은 다음 탭의 맥락 칸(읽기 전용)으로 넘깁니다.
 * ←→로 옮기고, 저장하지 않은 변경이 있으면 확인 창을 띄운 뒤 바꿉니다(useConfirm).
 * 규칙: docs/design-guide.md '탭'
 *
 * @example
 * <Tabs label="Route" items={[{ id: "route", label: "Route" }, { id: "process", label: "Route 공정" }]}
 *   selected={tab} onChange={setTab}>
 *   {(id) => (id === "route" ? <RouteTab /> : <RouteProcessTab route={route} />)}
 * </Tabs>
 */
export function Tabs({ label, items, selected, onChange, children }: TabsProps) {
  return (
    <AriaTabs className={styles.tabs} selectedKey={selected} onSelectionChange={(key) => onChange(String(key))}>
      <TabList className={styles.list} aria-label={label}>
        {items.map((item) => (
          <Tab key={item.id} id={item.id} className={styles.tab}>
            {item.label}
          </Tab>
        ))}
      </TabList>
      {items.map((item) => (
        <TabPanel key={item.id} id={item.id} className={styles.panel}>
          {children(item.id)}
        </TabPanel>
      ))}
    </AriaTabs>
  );
}
