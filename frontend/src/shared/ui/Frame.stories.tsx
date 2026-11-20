import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { formatNumber } from "../format/format";
import { AppShell, useLeaveGuard } from "./AppShell";
import { Button } from "./Button";
import { DetailForm, FormWide } from "./DetailForm";
import styles from "./Frame.stories.module.css";
import { QueryBar } from "./QueryBar";
import { ScreenHeader, ScreenLayout, WorkArea } from "./Screen";
import { Select, type SelectItem } from "./Select";
import type { MenuGroup } from "./SideMenu";
import { Tabs } from "./Tabs";
import { TextInput } from "./TextInput";
import { type YesNo, YesNoField } from "./YesNoField";

interface FrameArgs {
  menuSearch: boolean;
  agent: boolean;
  unsavedChanges: number;
}

const meta: Meta<FrameArgs> = {
  title: "컴포넌트/화면 틀",
  parameters: { layout: "fullscreen" },
  args: { menuSearch: true, agent: true, unsavedChanges: 0 },
  argTypes: {
    menuSearch: { name: "메뉴 검색 칸 (MENU_SEARCH)" },
    agent: { name: "에이전트 패널 있음" },
    unsavedChanges: { name: "저장하지 않은 변경 수", control: { type: "number", min: 0 } },
  },
};

export default meta;

type Story = StoryObj<FrameArgs>;

const menu: MenuGroup[] = [
  {
    name: "기준정보",
    items: [
      { screenId: "base.plant", name: "공장 관리", legacyId: "SIC01001" },
      { screenId: "base.shop", name: "Shop 관리", legacyId: "SIC01002" },
      { screenId: "base.process", name: "공정 관리", legacyId: "SIC01010" },
      { screenId: "base.part", name: "P/N 관리", legacyId: "SIC01020" },
    ],
  },
  {
    name: "공정 정책",
    items: [
      { screenId: "process.policy", name: "공정 정책 관리", legacyId: "SIC01061" },
      { screenId: "process.route", name: "Route 관리", legacyId: "SIC01062" },
      { screenId: "process.routeProcess", name: "Route 공정", legacyId: "SIC01063" },
      { screenId: "process.order", name: "공정 순서", legacyId: "SIC01064" },
    ],
  },
  {
    name: "품질",
    items: [
      { screenId: "quality.item", name: "검사 항목", legacyId: "QIC02001" },
      { screenId: "quality.defect", name: "불량 코드", legacyId: "QIC02002" },
      { screenId: "quality.yield", name: "수율 기준", legacyId: "QIC02010" },
    ],
  },
  {
    name: "설비",
    items: [
      { screenId: "equipment.list", name: "설비 관리", legacyId: "EQC03001" },
      { screenId: "equipment.group", name: "설비 그룹", legacyId: "EQC03002" },
    ],
  },
  {
    name: "LOT",
    items: [
      { screenId: "lot.history", name: "LOT 이력", legacyId: "LTC04001" },
      { screenId: "lot.trace", name: "LOT 추적", legacyId: "LTC04002" },
    ],
  },
  {
    name: "시스템",
    items: [
      { screenId: "system.user", name: "사용자", legacyId: "SYC09001" },
      { screenId: "system.info", name: "시스템 정보" },
    ],
  },
];

const plants: SelectItem[] = [
  { value: "P9", code: "P9", name: "구미" },
  { value: "P7", code: "P7", name: "파주" },
];

const processNames = [
  "자재 투입",
  "절단",
  "프레스 성형",
  "사출",
  "조립 1차",
  "조립 2차",
  "도장",
  "검사",
  "포장",
  "출하 검사",
];
const rows = Array.from({ length: 32 }, (_, i) => ({
  code: String(1010 + i * 10),
  name: processNames[i % processNames.length] ?? "",
  value: 120 + i * 7.5,
  at: `2026-11-${String((i % 20) + 1).padStart(2, "0")} 09:12`,
}));

function PolicyScreen({ title, unsavedChanges }: { title: string; unsavedChanges: number }) {
  useLeaveGuard(unsavedChanges);
  const [tab, setTab] = useState("policy");
  const [plant, setPlant] = useState<string | null>("P9");
  const [process, setProcess] = useState<string | null>(null);
  const [useYn, setUseYn] = useState<YesNo | null>("Y");
  const [memo, setMemo] = useState("조립 라인 기본 정책");

  return (
    <ScreenLayout>
      <ScreenHeader title={title} ids={["PANEL_TPFOPOLICY", "레거시 SIC01061", "화면 ID process.policy"]} />
      <Tabs
        label="공정 정책"
        items={[
          { id: "policy", label: "공정 정책" },
          { id: "detail", label: "정책 상세" },
        ]}
        selected={tab}
        onChange={setTab}
      >
        {(id) =>
          id === "policy" ? (
            <>
              <QueryBar onSearch={() => {}} onReset={() => setProcess(null)}>
                <Select label="공장" required items={plants} value={plant} onChange={setPlant} />
                <Select
                  label="공정"
                  emptyLabel="전체"
                  items={rows.slice(0, 10).map((r) => ({ value: r.code, code: r.code, name: r.name }))}
                  value={process}
                  onChange={setProcess}
                />
                <TextInput label="LOT 번호" code value="" onChange={() => {}} />
              </QueryBar>
              <WorkArea>
                <div className={styles.gridBox}>
                  <div className={styles.gridTools}>
                    <span>
                      <span className={styles.gridTitle}>공정 정책</span>
                      <span className={styles.count}>총 {rows.length}건</span>
                    </span>
                    <Button
                      variant="primary"
                      count={unsavedChanges}
                      countUnit="건"
                      {...(unsavedChanges === 0 ? { disabledReason: "저장할 변경이 없습니다" } : {})}
                    >
                      저장
                    </Button>
                  </div>
                  <div className={styles.scroll}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>공정 코드</th>
                          <th>공정명</th>
                          <th>항목</th>
                          <th className={styles.num}>기준값</th>
                          <th>수정일시</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.code}>
                            <td>{row.code}</td>
                            <td>{row.name}</td>
                            <td>대기 시간</td>
                            <td className={styles.num}>{formatNumber(row.value, 1)}</td>
                            <td>{row.at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.statusBar}>
                    <span>{unsavedChanges > 0 ? `• 수정 ${unsavedChanges}` : ""}</span>
                    <span>{rows.length}건</span>
                  </div>
                </div>
              </WorkArea>
            </>
          ) : (
            <WorkArea>
              <DetailForm
                title="공정 정책 상세"
                targetId="1100"
                standalone
                onSubmit={() => {}}
                actions={
                  <>
                    <Button>취소</Button>
                    <Button variant="primary" type="submit">
                      저장
                    </Button>
                  </>
                }
              >
                <TextInput label="공정 코드" code readOnly value="1100" onChange={() => {}} />
                <Select label="공장" required items={plants} value={plant} onChange={setPlant} />
                <YesNoField label="사용여부" required value={useYn} onChange={setUseYn} />
                <FormWide>
                  <TextInput label="설명" value={memo} onChange={setMemo} />
                </FormWide>
              </DetailForm>
            </WorkArea>
          )
        }
      </Tabs>
    </ScreenLayout>
  );
}

export const Frame: Story = {
  name: "화면 틀",
  render: function Render({ menuSearch, agent, unsavedChanges }) {
    const [current, setCurrent] = useState("process.policy");
    const title = menu.flatMap((g) => g.items).find((item) => item.screenId === current)?.name ?? "";
    return (
      <AppShell
        menu={menu}
        current={current}
        onNavigate={setCurrent}
        menuSearch={menuSearch}
        user={{ name: "홍길동", detail: "P9", onLogout: () => {} }}
        dock={agent ? <div className={styles.dock}>에이전트 패널의 내용은 에이전트 단계에서 정합니다.</div> : undefined}
      >
        <PolicyScreen key={current} title={title} unsavedChanges={unsavedChanges} />
      </AppShell>
    );
  },
};
