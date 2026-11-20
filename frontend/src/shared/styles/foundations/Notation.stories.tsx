import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  EMPTY,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDateTimeSeconds,
  formatNumber,
  formatPercent,
  formatText,
} from "../../format/format";
import styles from "./foundations.module.css";
import { cx, Icon, Page, Section } from "./parts";

const meta = {
  title: "기초/표기와 문구",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const at = new Date(2026, 10, 20, 9, 12, 5);

const examples: Array<[string, string, string]> = [
  ["formatDate(일시)", formatDate(at), "2026.11.20 · 2026/11/20"],
  ["formatDateTime(일시)", formatDateTime(at), "오전 9:12 · 2026-11-20(금)"],
  ["formatDateTimeSeconds(일시)", formatDateTimeSeconds(at), ""],
  ['formatDateRange("2026-11-01", "2026-11-20")', formatDateRange("2026-11-01", "2026-11-20"), "2026-11-01~11-20"],
  ["formatNumber(1280)", formatNumber(1280), "1280 · 1.28K"],
  ["formatNumber(1280, 1)", formatNumber(1280, 1), "1,280"],
  ["formatNumber(96.4, 2)", formatNumber(96.4, 2), "96.4"],
  ["formatNumber(12345678)", formatNumber(12345678), "1,234만 · 12.3M"],
  ["formatNumber(-12.5, 1)", formatNumber(-12.5, 1), "(12.5) · 빨간 글자"],
  ["formatNumber(0)", formatNumber(0), "– · 빈칸"],
  ["formatNumber(null)", formatNumber(null), "빈칸 · 없음 · 0"],
  ["formatPercent(96.4, 2)", formatPercent(96.4, 2), "96.40 % · 0.964"],
  ['formatText("")', formatText(""), "빈칸 · 없음"],
];

const rows = [
  {
    code: "1010",
    name: "자재 투입",
    low: 95,
    qty: 1200,
    by: "김민수",
    note: "설비 교체 후 재설정",
    at: new Date(2026, 10, 18, 9, 12),
  },
  {
    code: "1520",
    name: "편광판 부착 후 기포 제거 및 외관 검사",
    low: null,
    qty: 0,
    by: null,
    note: "2026년 하반기 라인 증설로 대기 시간 기준을 다시 정해야 함. 품질팀 검토 중",
    at: new Date(2026, 10, 19, 16, 40),
  },
  { code: "1530", name: "모듈 조립", low: 90, qty: 840, by: "박지훈", note: "", at: null },
];

export const Values: Story = {
  name: "날짜, 숫자, 빈 값",
  render: () => (
    <Page
      title="날짜, 숫자, 빈 값"
      lead="화면에 날짜, 시각, 숫자, 빈 값을 쓸 때는 shared/format의 함수만 씁니다. 아래 값은 함수가 실제로 만든 결과입니다."
    >
      <Section title="함수와 결과">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>호출</th>
                <th>결과</th>
                <th>쓰지 않음</th>
              </tr>
            </thead>
            <tbody>
              {examples.map(([call, result, not]) => (
                <tr key={call}>
                  <td>
                    <code className={styles.value}>{call}</code>
                  </td>
                  <td className={cx(styles.typeSample, result === EMPTY && styles.empty)}>{result}</td>
                  <td className={styles.no}>{not}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section
        title="그리드에서"
        note="빈 값은 안내 글자색 –, 0은 0입니다. 코드·숫자·날짜는 자르지 않고, 긴 글만 끝을 말줄임하고 잘렸을 때만 툴팁으로 전체를 보입니다. 단위는 머리글에 둡니다."
      >
        <div className={styles.box} style={{ overflow: "visible" }}>
          <table className={cx(styles.grid, styles.fixed)}>
            <colgroup>
              <col style={{ width: 80 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 80 }} />
              <col />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr>
                <th>공정 코드</th>
                <th>공정명</th>
                <th className={styles.num}>하한 (%)</th>
                <th className={styles.num}>수량 (EA)</th>
                <th>수정자</th>
                <th>비고</th>
                <th>수정일시</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.code}>
                  <td>{r.code}</td>
                  <td className={cx(i === 1 && styles.tipHost)}>
                    <span className={cx(styles.truncate)} style={{ display: "block" }}>
                      {r.name}
                    </span>
                    {i === 1 && <span className={styles.tooltip}>{r.name}</span>}
                  </td>
                  <td className={cx(styles.num, r.low === null && styles.empty)}>{formatNumber(r.low, 2)}</td>
                  <td className={styles.num}>{formatNumber(r.qty)}</td>
                  <td className={cx(r.by === null && styles.empty)}>{formatText(r.by)}</td>
                  <td className={cx(styles.truncate, !r.note && styles.empty)}>{formatText(r.note)}</td>
                  <td className={cx(r.at === null && styles.empty)}>{formatDateTime(r.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};

const rules: Array<[string, string, string]> = [
  ["버튼", "하는 일을 명사형으로 짧게. '하기'를 붙이지 않습니다. 대상 개수는 뒤에", "저장 4건 · 행 추가 · 엑셀"],
  ["확인 창 버튼", "'확인' 대신 하는 일. 취소는 왼쪽, 하는 일은 오른쪽", "취소 / 삭제"],
  ["확인 창 제목", "대상과 개수를 넣은 물음. 설명에는 결과", "공정 정책 2건을 삭제할까요?"],
  ["결과 메시지", "능동 과거형. '정상적으로'를 쓰지 않습니다", "저장했습니다"],
  [
    "오류",
    "무엇이 안 됐는지와 어떻게 하면 되는지. 탓하지 않고, 오류 코드와 영어는 본문에 쓰지 않습니다",
    "저장하지 못했습니다. 수율 하한은 100 이하여야 합니다.",
  ],
  ["칸 아래 오류", "고치는 방법만 짧게", "100 이하로 입력하세요."],
  ["빈 상태", "상태(제목)와 다음 할 일(설명)", "조회 결과가 없습니다 · 조건을 바꿔 다시 조회하세요."],
  ["제목, 라벨", "명사로 끝. 콜론과 마침표 없음", "공정 정책 관리 · 공장"],
  ["문장 부호", "문장에만 마침표. 느낌표와 말줄임표(...)는 쓰지 않습니다", ""],
];

const terms: Array<[string, string, string]> = [
  ["조회", "검색, 찾기", "조건으로 서버에서 가져옵니다"],
  ["검색", "찾기, 필터", "이미 받은 목록 안에서 거릅니다"],
  ["초기화", "리셋, 지우기", "조회 조건을 처음 값으로"],
  ["저장", "적용, 반영, 등록", "바뀐 것을 서버에 기록합니다"],
  ["취소", "닫기 (바뀐 것을 버릴 때)", "바뀐 것을 버리고 그만둡니다"],
  ["닫기", "확인", "바뀐 것 없이 창을 닫습니다"],
  ["행 추가, 신규", "생성, 등록", "그리드에 새 행, 상세 폼으로 새 기준정보"],
  ["행 삭제, 삭제", "제거", "기준정보를 지웁니다"],
  ["빼기", "삭제", "이중 목록에서 뺍니다(데이터는 그대로)"],
  ["엑셀", "다운로드, 엑셀 다운", "그리드를 엑셀 파일로 내려받습니다"],
  ["사용, 미사용", "활성, 비활성", "기준정보 상태. '비활성'은 컨트롤에만"],
  ["반려", "거절, 거부", "승인 반려"],
];

export const Wording: Story = {
  name: "문구와 용어",
  render: () => (
    <Page title="문구와 용어" lead="합니다체, 능동형으로 씁니다. 무엇이 일어났고 무엇을 하면 되는지만 짧게 씁니다.">
      <Section title="예">
        <div className={styles.messages}>
          <div className={styles.message}>
            <b style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <Icon name="success" className={styles.positiveIcon} />
              저장했습니다
            </b>
            <p>공정 정책 4건</p>
          </div>
          <div className={styles.message}>
            <b>공정 정책 2건을 삭제할까요?</b>
            <p>저장하면 되돌릴 수 없습니다.</p>
            <div className={styles.messageFoot}>
              <span className={styles.buttonSample}>취소</span>
              <span className={cx(styles.buttonSample, styles.buttonPrimary)}>삭제</span>
            </div>
          </div>
          <div className={styles.message}>
            <b>저장하지 못했습니다</b>
            <p>1200 조립 1차의 수율 하한은 100 이하여야 합니다.</p>
          </div>
          <div className={styles.message}>
            <b>조회 결과가 없습니다</b>
            <p>조건을 바꿔 다시 조회하세요.</p>
          </div>
        </div>
      </Section>
      <Section title="자리별 규칙">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>자리</th>
                <th>규칙</th>
                <th>예</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(([where, rule, example]) => (
                <tr key={where}>
                  <td className={styles.typeSample}>{where}</td>
                  <td className={styles.muted}>{rule}</td>
                  <td>{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="용어" note="같은 일에는 같은 말을 씁니다. 화면, 문구, 에이전트가 모두 이 표를 따릅니다.">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>쓰는 말</th>
                <th>쓰지 않는 말</th>
                <th>뜻</th>
              </tr>
            </thead>
            <tbody>
              {terms.map(([use, avoid, meaning]) => (
                <tr key={use}>
                  <td className={styles.typeSample}>{use}</td>
                  <td className={styles.no}>{avoid}</td>
                  <td className={styles.muted}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};
