import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Page, Section } from "../styles/foundations/parts";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import styles from "./Choices.stories.module.css";
import form from "./Inputs.stories.module.css";
import { RadioGroup } from "./RadioGroup";
import { SegmentedControl } from "./SegmentedControl";
import { TextInput } from "./TextInput";
import { type YesNo, YesNoField } from "./YesNoField";

const meta = {
  title: "컴포넌트/체크박스, 라디오, 세그먼트",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const noop = () => {};

/** 새 Route: 사용여부는 명세의 기본값 Y, 필수공정여부는 기본값이 없어 비어 있습니다 */
function NewRouteForm() {
  const [name, setName] = useState("조립 라인 기본");
  const [useYn, setUseYn] = useState<YesNo | null>("Y");
  const [requiredYn, setRequiredYn] = useState<YesNo | null>(null);
  const [tried, setTried] = useState(false);
  const [log, setLog] = useState("");
  const missing = (label: string, value: YesNo | null) =>
    tried && value === null ? `${label}를 선택하세요.` : undefined;

  return (
    <form
      className={form.form}
      onSubmit={(event) => {
        event.preventDefault();
        setTried(true);
        setLog(useYn && requiredYn ? `저장: 사용여부=${useYn}, 필수공정여부=${requiredYn}` : "");
      }}
    >
      <div className={form.formHead}>
        Route 등록 <span>· 신규</span>
      </div>
      <div className={form.fields}>
        <TextInput label="Route 이름" required value={name} onChange={setName} />
        <YesNoField label="사용여부" required value={useYn} onChange={setUseYn} error={missing("사용여부", useYn)} />
        <YesNoField
          label="필수공정여부"
          required
          value={requiredYn}
          onChange={setRequiredYn}
          error={missing("필수공정여부", requiredYn)}
        />
      </div>
      <div className={form.foot}>
        <span className={form.log} role="status">
          {log}
        </span>
        <Button
          onClick={() => {
            setUseYn("Y");
            setRequiredYn(null);
            setTried(false);
            setLog("");
          }}
        >
          처음으로
        </Button>
        <Button variant="primary" type="submit">
          저장
        </Button>
      </div>
    </form>
  );
}

function Segments() {
  const [anchor, setAnchor] = useState<string | null>("below");
  const [theme, setTheme] = useState<string | null>("system");
  const [step, setStep] = useState<string | null>("required");
  return (
    <div className={styles.row}>
      <div className={styles.toolbar}>
        <SegmentedControl
          label="기준 행"
          hideLabel
          value={anchor}
          onChange={setAnchor}
          options={[
            { value: "below", label: "아래" },
            { value: "above", label: "위" },
          ]}
        />
        <Button variant="ghost" icon="add">
          행 추가
        </Button>
      </div>
      <SegmentedControl
        label="테마"
        size="sm"
        value={theme}
        onChange={setTheme}
        options={[
          { value: "system", label: "시스템" },
          { value: "light", label: "라이트" },
          { value: "dark", label: "다크" },
        ]}
      />
      <SegmentedControl
        label="추가할 때"
        value={step}
        onChange={setStep}
        options={[
          { value: "required", label: "필수공정" },
          { value: "optional", label: "선택공정" },
        ]}
      />
      <SegmentedControl
        label="기준 행"
        value="below"
        onChange={noop}
        disabledReason="행을 먼저 고르세요"
        options={[
          { value: "below", label: "아래" },
          { value: "above", label: "위" },
        ]}
      />
    </div>
  );
}

function DownloadDialog() {
  const [columns, setColumns] = useState<string | null>("visible");
  const [rows, setRows] = useState<string | null>("all");
  const [requery, setRequery] = useState(true);
  return (
    <div className={styles.dialog}>
      <span className={styles.dialogTitle}>엑셀로 내려받기</span>
      <RadioGroup
        label="내려받을 열"
        value={columns}
        onChange={setColumns}
        options={[
          { value: "visible", label: "보이는 열", description: "화면에서 숨긴 열은 빼고, 지금 순서대로 내려받습니다." },
          { value: "all", label: "모든 열", description: "숨긴 열과 코드 열까지 모두 내려받습니다." },
        ]}
      />
      <SegmentedControl
        label="내려받을 행"
        value={rows}
        onChange={setRows}
        options={[
          { value: "all", label: "조회한 행" },
          { value: "picked", label: "고른 행" },
        ]}
      />
      <Checkbox checked={requery} onChange={setRequery}>
        내려받은 뒤 다시 조회
      </Checkbox>
      <div className={form.foot}>
        <Button>취소</Button>
        <Button variant="primary">내려받기</Button>
      </div>
    </div>
  );
}

function Checkboxes() {
  const [picked, setPicked] = useState<Record<string, boolean>>({ "1010": true, "1100": false, "1300": false });
  const values = Object.values(picked);
  const all = values.every(Boolean);
  const some = values.some(Boolean);
  return (
    <div className={styles.row}>
      <div className={styles.stack}>
        <Checkbox
          checked={all}
          indeterminate={some && !all}
          onChange={(next) => setPicked(Object.fromEntries(Object.keys(picked).map((key) => [key, next])))}
        >
          전체 고르기
        </Checkbox>
        <div className={`${styles.stack} ${styles.indent}`}>
          {Object.entries(picked).map(([code, checked]) => (
            <Checkbox
              key={code}
              size="sm"
              checked={checked}
              onChange={(next) => setPicked({ ...picked, [code]: next })}
            >
              {code}
            </Checkbox>
          ))}
        </div>
      </div>
      <div className={styles.stack}>
        <Checkbox checked={false} onChange={noop}>
          숨긴 열도 내려받기
        </Checkbox>
        <Checkbox checked onChange={noop}>
          다시 묻지 않기
        </Checkbox>
        <Checkbox checked={false} onChange={noop} disabledReason="조회한 뒤에 고를 수 있습니다">
          고른 행만
        </Checkbox>
      </div>
    </div>
  );
}

export const Overview: Story = {
  name: "체크박스, 라디오, 세그먼트",
  render: () => (
    <Page
      title="체크박스, 라디오, 세그먼트"
      lead="저장하는 Y/N 값은 YesNoField(세그먼트 Y | N), 짧은 선택지 2~4개는 SegmentedControl, 선택지마다 설명이 필요하면 RadioGroup, 저장하지 않는 옵션과 여러 개 고르기는 Checkbox를 씁니다."
    >
      <Section
        title="Y/N 값"
        note="새로 만들 때 명세의 기본값이 있으면 골라 두고(사용여부 Y), 없으면 비워 둡니다(필수공정여부). 비운 채로 저장해 보세요. 체크박스였다면 그대로 N으로 저장됐을 값입니다."
      >
        <NewRouteForm />
        <div className={form.form}>
          <div className={form.fields}>
            <TextInput label="Route 이름" readOnly value="조립 라인 기본" onChange={noop} />
            <YesNoField label="사용여부" readOnly value="Y" onChange={noop} />
            <YesNoField label="필수공정여부" readOnly value="N" onChange={noop} />
          </div>
        </div>
      </Section>
      <Section
        title="세그먼트"
        note="모든 칸이 가장 긴 글자의 폭을 따르고, 한 칸은 적어도 정사각형입니다. 툴바처럼 라벨 자리가 없으면 라벨을 숨깁니다. ←→로 옮겨 고릅니다."
      >
        <Segments />
      </Section>
      <Section
        title="라디오"
        note="선택지마다 설명이 필요할 때만, 세로로 쌓아 씁니다. 주로 확인 창과 설정 화면에 나오고, 조회 조건과 그리드에는 쓰지 않습니다."
      >
        <DownloadDialog />
      </Section>
      <Section
        title="체크박스"
        note="저장하지 않는 옵션과 여러 개 고르기에만 씁니다. 일부만 고르면 머리글 상자가 가로줄이 됩니다. 비활성 상자에 마우스를 올리면 이유가 보입니다."
      >
        <Checkboxes />
      </Section>
    </Page>
  ),
};
