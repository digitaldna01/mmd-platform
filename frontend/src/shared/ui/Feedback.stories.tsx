import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ApiRequestError } from "../../api/client";
import { ErrorNotice } from "../feedback/ErrorNotice";
import { Page, Section } from "../styles/foundations/parts";
import { Banner } from "./Banner";
import { Button } from "./Button";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import styles from "./Feedback.stories.module.css";
import { useToast } from "./Toast";

const meta = {
  title: "컴포넌트/알림",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type QueryState = "before" | "rows" | "empty" | "failed";

const connectionError = new ApiRequestError({
  status: 503,
  code: "COMMON-503",
  message: "서버에 연결할 수 없습니다. 잠시 뒤 다시 조회해 주세요.",
  traceId: "0f3a9c2e5d7b4a18b2c6e9f01d3a7b41",
});

const rows = [
  { code: "1200", name: "조립 1차", min: "120.0", state: "•" },
  { code: "1010", name: "자재 투입", min: "98.0", state: "•" },
  { code: "1600", name: "출하 검사", min: "99.5", state: "+" },
];

/** 오류는 일이 일어난 자리에: 조회 실패는 그리드 자리, 저장 실패는 걸린 칸 + 상태줄 + 오류 토스트 */
function ErrorPlaces() {
  const toast = useToast();
  const [query, setQuery] = useState<QueryState>("rows");
  const [rowError, setRowError] = useState(false);
  const show = (next: QueryState) => {
    setQuery(next);
    setRowError(false);
  };

  const body = {
    before: <EmptyState bare icon="search" title="공장과 Shop을 선택하고 조회해 주세요." />,
    empty: (
      <EmptyState
        bare
        icon="filter"
        title="조건에 맞는 공정 정책이 없습니다."
        description="조건을 바꿔 다시 조회해 주세요."
      />
    ),
    failed: (
      <div>
        <ErrorNotice bare error={connectionError} onRetry={() => setQuery("rows")} />
      </div>
    ),
    rows: (
      <table className={styles.table}>
        <thead>
          <tr>
            <th />
            <th>공정 코드</th>
            <th>공정명</th>
            <th>수율 하한</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.code}>
              <td>{row.state}</td>
              <td>{row.code}</td>
              <td>{row.name}</td>
              <td className={rowError && i === 0 ? styles.cellError : undefined}>
                {rowError && i === 0 ? "! " : ""}
                {row.min}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  }[query];

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Button onClick={() => show("before")}>조회 전</Button>
        <Button onClick={() => show("empty")}>결과 없음</Button>
        <Button onClick={() => show("failed")}>조회 실패</Button>
        <Button onClick={() => show("rows")}>조회 성공</Button>
      </div>
      <div className={styles.gridBox}>
        <div className={styles.gridTools}>
          <span>
            <span className={styles.gridTitle}>공정 정책</span>
            {query === "rows" && <span className={styles.count}>총 32건</span>}
          </span>
          <div className={styles.row}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRowError(true);
                toast.error({
                  title: "저장하지 못했습니다",
                  description: "1200 조립 1차의 수율 하한은 100 이하여야 합니다.",
                });
              }}
              disabledReason={query === "rows" ? undefined : "조회한 뒤에 저장할 수 있습니다"}
            >
              저장 실패 (행 오류)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toast.error({
                  title: "저장하지 못했습니다",
                  description: "서버에 연결할 수 없습니다. 잠시 뒤 다시 저장해 주세요.",
                  traceId: connectionError.traceId,
                })
              }
              disabledReason={query === "rows" ? undefined : "조회한 뒤에 저장할 수 있습니다"}
            >
              저장 실패 (연결)
            </Button>
            <Button
              variant="primary"
              count={3}
              countUnit="건"
              onClick={() => {
                setRowError(false);
                toast.success({ title: "저장했습니다", description: "공정 정책 3건 (신규 1, 수정 2)" });
              }}
              disabledReason={query === "rows" ? undefined : "조회한 뒤에 저장할 수 있습니다"}
            >
              저장
            </Button>
          </div>
        </div>
        {body}
        <div className={styles.statusBar}>
          <span className={styles.bad}>{rowError ? "저장하지 못했습니다. 오류 1건" : ""}</span>
          <span>{query === "rows" ? "+ 신규 1 · • 수정 2" : ""}</span>
        </div>
      </div>
    </div>
  );
}

function Confirms() {
  const { confirm, dialog } = useConfirm();
  const toast = useToast();
  const [log, setLog] = useState("");
  return (
    <div className={styles.row}>
      <Button
        variant="primary"
        onClick={async () => {
          const ok = await confirm({
            title: "삭제 2건을 포함해 6건을 저장할까요?",
            description: "삭제한 공정 정책은 되돌릴 수 없습니다.",
            confirmLabel: "저장",
          });
          if (ok) toast.success({ title: "저장했습니다", description: "공정 정책 6건 (신규 2, 수정 2, 삭제 2)" });
          else setLog("저장하지 않았습니다");
        }}
      >
        저장 6건 (삭제 2건 포함)
      </Button>
      <Button
        icon="search"
        onClick={async () => {
          const ok = await confirm({
            title: "저장하지 않은 변경 4건을 버릴까요?",
            description: "다시 조회하면 고친 내용이 사라집니다.",
            confirmLabel: "버리고 조회",
          });
          setLog(ok ? "변경을 버리고 다시 조회했습니다" : "조회하지 않았습니다");
        }}
      >
        조회 (저장하지 않은 변경 4건)
      </Button>
      <span className={styles.log} role="status">
        {log}
      </span>
      {dialog}
    </div>
  );
}

export const Overview: Story = {
  name: "알림",
  render: () => (
    <Page
      title="알림"
      lead="오류는 일이 일어난 자리에 보이고, 확인 창은 되돌릴 수 없을 때만 띄웁니다. 성공과 결과 안내는 토스트(useToast), 늘 보이는 안내는 배너, 그리드 자리의 상태는 빈 상태로 보입니다."
    >
      <Section
        title="오류를 보이는 자리"
        note="조회가 실패하면 그리드 자리에 오류 상태(다시 조회, 추적 ID)를 둬 결과 없음과 헷갈리지 않게 합니다. 저장이 실패하면 걸린 칸이 오류 셀이 되고 상태줄에 요약이, 이유는 오류 토스트(닫을 때까지)에 남습니다. 행과 상관없는 실패는 오류 토스트만 뜹니다."
      >
        <ErrorPlaces />
      </Section>
      <Section
        title="확인 창"
        note="삭제가 든 저장과 저장하지 않은 변경을 버릴 때만 띄웁니다. 처음 포커스는 취소에 있고, Esc는 취소입니다. 평소 저장은 바로 되고 성공 토스트로 알립니다."
      >
        <Confirms />
      </Section>
      <Section title="안내 배너" note="화면에 대해 늘 알아야 할 것만 둡니다. 닫지 않습니다.">
        <div className={styles.stack}>
          <Banner tone="warning">데모 데이터입니다. 저장해도 실제 MMD에는 반영되지 않습니다.</Banner>
          <Banner>이 화면은 조회만 할 수 있습니다. 고치려면 Route 관리에서 합니다.</Banner>
        </div>
      </Section>
      <Section title="빈 상태" note="그리드 자리에 둡니다. 제목은 다음에 할 일을 말합니다.">
        <div className={styles.empties}>
          <EmptyState icon="search" title="공장과 Shop을 선택하고 조회해 주세요." />
          <EmptyState
            icon="filter"
            title="조건에 맞는 공정 정책이 없습니다."
            description="조건을 바꿔 다시 조회해 주세요."
          />
          <ErrorNotice error={connectionError} onRetry={() => {}} />
          <EmptyState
            icon="lock"
            title="이 화면을 볼 권한이 없습니다."
            description="권한이 필요하면 시스템 담당자에게 요청해 주세요."
          />
        </div>
      </Section>
    </Page>
  ),
};
