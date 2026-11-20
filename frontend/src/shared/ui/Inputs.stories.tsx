import type { Meta, StoryObj } from "@storybook/react-vite";
import { type FormEvent, useState } from "react";
import base from "../styles/foundations/foundations.module.css";
import { Page, Section } from "../styles/foundations/parts";
import { Button } from "./Button";
import styles from "./Inputs.stories.module.css";
import { Select, type SelectItem } from "./Select";
import { TextInput } from "./TextInput";

const meta = {
  title: "컴포넌트/입력창과 선택 상자",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const plants: SelectItem[] = [
  { value: "P9", code: "P9", name: "구미" },
  { value: "P7", code: "P7", name: "파주" },
  { value: "C1", code: "C1", name: "난징" },
];

const shops: Record<string, SelectItem[]> = {
  P9: [
    { value: "P9T", code: "P9T", name: "조립" },
    { value: "P9M", code: "P9M", name: "가공" },
  ],
  P7: [{ value: "P7A", code: "P7A", name: "조립" }],
  C1: [{ value: "C1A", code: "C1A", name: "조립" }],
};

const processes: SelectItem[] = [
  { value: "1010", code: "1010", name: "자재 투입" },
  { value: "1020", code: "1020", name: "절단" },
  { value: "1100", code: "1100", name: "프레스 성형" },
  { value: "1200", code: "1200", name: "조립 1차" },
  { value: "1210", code: "1210", name: "조립 2차" },
  { value: "1300", code: "1300", name: "도장", meta: "사용 안 함" },
  { value: "1400", code: "1400", name: "검사" },
  { value: "1500", code: "1500", name: "포장" },
];

const modelNames = ["개발 모델", "양산 A", "양산 B", "시험 생산", "수출형", "내수형", "보급형", "고급형"];
const partNumbers: SelectItem[] = Array.from({ length: 40 }, (_, i) => ({
  value: `PN-${2001 + i * 7}`,
  code: `PN-${2001 + i * 7}`,
  name: modelNames[i % modelNames.length] ?? "",
  meta: i % 9 === 4 ? "사용 안 함" : undefined,
}));

const yesNo: SelectItem[] = [
  { value: "Y", name: "예" },
  { value: "N", name: "아니요" },
];

const noop = () => {};

function States() {
  const [text, setText] = useState("조립 라인 기본");
  const [plant, setPlant] = useState<string | null>("P9");
  return (
    <div className={base.box}>
      <table className={base.table}>
        <thead>
          <tr>
            <th>칸</th>
            <th>기본 (마우스 올림, 포커스는 직접)</th>
            <th>오류</th>
            <th>읽기 전용</th>
            <th>비활성</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.kind}>입력창</td>
            <td className={styles.cell}>
              <TextInput label="설명" value={text} onChange={setText} />
            </td>
            <td className={styles.cell}>
              <TextInput
                label="Route 이름"
                required
                value=""
                onChange={noop}
                placeholder="Route 이름"
                error="Route 이름을 입력하세요."
              />
            </td>
            <td className={styles.cell}>
              <TextInput label="Route" code readOnly value="RT-0102" onChange={noop} />
            </td>
            <td className={styles.cell}>
              <TextInput label="Shop 메모" value="" onChange={noop} disabledReason="Shop을 먼저 선택" />
            </td>
          </tr>
          <tr>
            <td className={styles.kind}>선택 상자</td>
            <td className={styles.cell}>
              <Select label="공장" required items={plants} value={plant} onChange={setPlant} />
            </td>
            <td className={styles.cell}>
              <Select label="공장" required items={plants} value={null} onChange={noop} error="공장을 선택하세요." />
            </td>
            <td className={styles.cell}>
              <Select label="공장" readOnly items={plants} value="P9" onChange={noop} />
            </td>
            <td className={styles.cell}>
              <Select label="Shop" items={[]} value={null} onChange={noop} disabledReason="공장을 먼저 선택" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function QueryBar() {
  const [plant, setPlant] = useState<string | null>(null);
  const [shop, setShop] = useState<string | null>(null);
  const [process, setProcess] = useState<string | null>(null);
  const [part, setPart] = useState<string | null>(null);
  const [lot, setLot] = useState("");
  const [plantError, setPlantError] = useState<string>();
  const [log, setLog] = useState("");

  const search = (event: FormEvent) => {
    event.preventDefault();
    if (!plant) {
      setPlantError("공장을 선택하세요.");
      return;
    }
    setPlantError(undefined);
    setLog(
      `조회: 공장=${plant} Shop=${shop ?? "전체"} 공정=${process ?? "전체"} P/N=${part ?? "전체"} LOT=${lot || "-"}`,
    );
  };
  const reset = () => {
    setPlant(null);
    setShop(null);
    setProcess(null);
    setPart(null);
    setLot("");
    setPlantError(undefined);
    setLog("");
  };

  return (
    <>
      <form className={styles.query} onSubmit={search}>
        <div className={styles.queryField}>
          <Select
            label="공장"
            required
            items={plants}
            value={plant}
            onChange={(next) => {
              setPlant(next);
              setShop(null);
              if (next) setPlantError(undefined);
            }}
            error={plantError}
          />
        </div>
        <div className={styles.queryField}>
          <Select
            label="Shop"
            emptyLabel="전체"
            items={plant ? (shops[plant] ?? []) : []}
            value={shop}
            onChange={setShop}
            disabledReason={plant ? undefined : "공장을 먼저 선택"}
          />
        </div>
        <div className={styles.queryField}>
          <Select label="공정" emptyLabel="전체" items={processes} value={process} onChange={setProcess} />
        </div>
        <div className={styles.queryField}>
          <Select label="P/N" emptyLabel="전체" items={partNumbers} value={part} onChange={setPart} />
        </div>
        <div className={styles.queryField}>
          <TextInput label="LOT 번호" code value={lot} onChange={setLot} />
        </div>
        <div className={styles.queryButtons}>
          <Button variant="primary" icon="search" type="submit">
            조회
          </Button>
          <Button icon="reset" onClick={reset}>
            초기화
          </Button>
        </div>
      </form>
      <span className={styles.log} role="status">
        {log}
      </span>
    </>
  );
}

function DetailForm() {
  const [name, setName] = useState("");
  const [plant, setPlant] = useState<string | null>("P9");
  const [required, setRequired] = useState<string | null>("Y");
  const [parent, setParent] = useState<string | null>(null);
  const [memo, setMemo] = useState("조립 라인 기본 Route");
  const [tried, setTried] = useState(false);
  const nameError = tried && name.trim() === "" ? "Route 이름을 입력하세요." : undefined;

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        setTried(true);
      }}
    >
      <div className={styles.formHead}>
        Route 상세 <span>· RT-0102</span>
      </div>
      <div className={styles.fields}>
        <TextInput label="Route" code readOnly value="RT-0102" onChange={noop} />
        <TextInput label="Route 이름" required value={name} onChange={setName} error={nameError} />
        <Select label="공장" required items={plants} value={plant} onChange={setPlant} />
        <Select label="추가할 때 필수공정" required items={yesNo} value={required} onChange={setRequired} />
        <Select
          label="상위 Route"
          emptyLabel="없음"
          items={partNumbers.slice(0, 6)}
          value={parent}
          onChange={setParent}
        />
        <div className={styles.span2}>
          <TextInput label="설명" value={memo} onChange={setMemo} />
        </div>
        <TextInput label="수정일시" readOnly value="2026-11-20 09:12" onChange={noop} />
      </div>
      <div className={styles.foot}>
        <Button onClick={() => setTried(false)}>취소</Button>
        <Button variant="primary" type="submit">
          저장
        </Button>
      </div>
    </form>
  );
}

export const Overview: Story = {
  name: "입력창과 선택 상자",
  render: () => (
    <Page
      title="입력창과 선택 상자"
      lead={
        <>
          화면은 <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code>를 직접 쓰지 않고{" "}
          <code>shared/ui/TextInput</code>, <code>shared/ui/Select</code>를 씁니다. 라벨은 조회 조건과 상세 폼 모두 칸
          위에 둡니다.
        </>
      }
    >
      <Section
        title="상태"
        note="마우스 올림은 테두리만 보조 글자색, 포커스와 열림은 안쪽 2px 본문색입니다. 비활성 칸은 이유를 칸에 보입니다."
      >
        <States />
      </Section>
      <Section
        title="조회 조건"
        note="공장을 고르기 전에는 Shop이 비활성입니다. 비워도 되는 칸은 목록 맨 위 '전체'로 비웁니다. P/N은 항목이 15개를 넘어 목록 위에 검색 칸이 있습니다. 공장 없이 조회하거나, 칸에서 Enter를 눌러 보세요."
      >
        <QueryBar />
      </Section>
      <Section
        title="상세 폼"
        note="칸은 180px 이상의 열로 채우고 긴 칸은 두 열을 차지합니다. 비워도 되는 폼 칸은 맨 위 '없음'으로 비웁니다. 이름 없이 저장해 보세요."
      >
        <DetailForm />
      </Section>
    </Page>
  ),
};
