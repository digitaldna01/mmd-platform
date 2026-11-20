import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import styles from "./foundations.module.css";
import { cx, Icon, Page, Section, Value } from "./parts";

const meta = {
  title: "기초/상태 표시",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type Status = "active" | "inactive" | "pending" | "draft" | "rejected" | "retired";

const marks: Record<Status, ReactNode> = {
  active: <Icon name="check" size="sm" />,
  inactive: null,
  pending: <Icon name="clock" size="sm" />,
  draft: null,
  rejected: <Icon name="close" size="sm" />,
  retired: null,
};

function Badge({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <span className={cx(styles.badge, styles[status])}>
      {marks[status]}
      {children}
    </span>
  );
}

const statuses: Array<{
  status: Status;
  label: string;
  meaning: string;
  text: string;
  border: string;
  fill: string;
  mark: string;
}> = [
  {
    status: "active",
    label: "사용",
    meaning: "승인되어 유효한 기준정보",
    text: "positive",
    border: "없음",
    fill: "positive-soft",
    mark: "체크",
  },
  {
    status: "inactive",
    label: "미사용",
    meaning: "미사용으로 바꾼 기준정보",
    text: "보조 글자",
    border: "없음",
    fill: "선택 (bg-selected)",
    mark: "없음",
  },
  {
    status: "pending",
    label: "승인 대기",
    meaning: "등록·변경 요청 후 승인 전",
    text: "보조 글자",
    border: "1px 실선, 글자색",
    fill: "없음",
    mark: "시계",
  },
  {
    status: "draft",
    label: "초안",
    meaning: "임시 저장, 미제출",
    text: "보조 글자",
    border: "1px 점선, 글자색",
    fill: "없음",
    mark: "없음",
  },
  {
    status: "rejected",
    label: "반려",
    meaning: "승인 반려, 저장 실패, 검증 오류",
    text: "negative",
    border: "1px 실선, 글자색",
    fill: "없음",
    mark: "×",
  },
  {
    status: "retired",
    label: "폐기",
    meaning: "삭제·만료되어 더 쓰지 않는 데이터",
    text: "안내 글자",
    border: "없음",
    fill: "없음",
    mark: "없음. 행의 코드에 취소선",
  },
];

export const MasterStatus: Story = {
  name: "기준정보 상태",
  render: () => (
    <Page
      title="기준정보 상태"
      lead="상태는 의미색과 모양을 함께 써서 흑백으로 봐도 구분됩니다(WCAG 1.4.1). 배지 높이는 크기 조정을 따르고(기준 20px), 글자는 text-xs SemiBold, 모서리는 3px입니다."
    >
      <Section title="배지">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>배지</th>
                <th>이름</th>
                <th>뜻</th>
                <th>글자</th>
                <th>테두리</th>
                <th>면</th>
                <th>앞 표시</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((s) => (
                <tr key={s.status}>
                  <td>
                    <Badge status={s.status}>{s.label}</Badge>
                  </td>
                  <td>
                    <Value>status-{s.status}</Value>
                  </td>
                  <td>{s.meaning}</td>
                  <td className={styles.muted}>{s.text}</td>
                  <td className={styles.muted}>{s.border}</td>
                  <td className={styles.muted}>{s.fill}</td>
                  <td className={styles.muted}>{s.mark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="흑백으로 보기" note="색을 빼도 테두리, 면, 앞 표시로 서로 구분되어야 합니다.">
        <div className={cx(styles.badges, styles.grayscale)}>
          {statuses.map((s) => (
            <Badge key={s.status} status={s.status}>
              {s.label}
            </Badge>
          ))}
        </div>
      </Section>
      <Section title="규칙">
        <ul className={styles.rules}>
          <li>배지에는 항상 글자를 씁니다.</li>
          <li>배지 글자에는 취소선을 긋지 않습니다. 12px 한글의 가로획이 지워집니다. 폐기는 행의 코드에 긋습니다.</li>
          <li>warning은 기준정보 상태에 쓰지 않습니다.</li>
        </ul>
      </Section>
    </Page>
  ),
};

export const InGrid: Story = {
  name: "그리드 안 표시",
  render: () => (
    <Page
      title="그리드 안 표시"
      lead="저장 전 편집 상태, 검증 오류, 에이전트가 바꾼 값, 선택 행, 폐기 행을 한 그리드에서 봅니다. 상용 그리드를 정하면 그 그리드의 테마를 이 규칙에 맞춥니다."
    >
      <Section title="예시">
        <div className={styles.box}>
          <table className={styles.grid}>
            <thead>
              <tr>
                <th className={styles.check}>
                  <input type="checkbox" aria-label="모두 선택" />
                </th>
                <th className={styles.editState} aria-label="편집 상태" />
                <th className={styles.num}>No</th>
                <th>공정 코드</th>
                <th>공정명</th>
                <th>항목</th>
                <th className={styles.num}>기준값</th>
                <th>단위</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.check}>
                  <input type="checkbox" aria-label="1행 선택" />
                </td>
                <td className={styles.editState} />
                <td className={styles.num}>1</td>
                <td className={styles.key}>1010</td>
                <td>자재 투입</td>
                <td>투입 순서</td>
                <td className={styles.num}>1</td>
                <td>순번</td>
                <td>
                  <Badge status="active">사용</Badge>
                </td>
              </tr>
              <tr className={styles.rowSelected}>
                <td className={styles.check}>
                  <input type="checkbox" defaultChecked aria-label="2행 선택" />
                </td>
                <td className={styles.editState} />
                <td className={styles.num}>2</td>
                <td className={styles.key}>1020</td>
                <td className={styles.cellFocus}>절단</td>
                <td>대기 시간</td>
                <td className={styles.num}>1,280.0</td>
                <td>초</td>
                <td>
                  <Badge status="pending">승인 대기</Badge>
                </td>
              </tr>
              <tr className={styles.rowHover}>
                <td className={styles.check}>
                  <input type="checkbox" aria-label="3행 선택" />
                </td>
                <td className={styles.editState} title="수정">
                  •
                </td>
                <td className={styles.num}>3</td>
                <td className={styles.key}>1100</td>
                <td>프레스 성형</td>
                <td>대기 시간</td>
                <td className={cx(styles.num, styles.cellAgent)}>
                  <span className={styles.ring} />
                  96.0
                </td>
                <td>초</td>
                <td>
                  <Badge status="active">사용</Badge>
                </td>
              </tr>
              <tr>
                <td className={styles.check}>
                  <input type="checkbox" aria-label="4행 선택" />
                </td>
                <td className={styles.editState} title="신규">
                  +
                </td>
                <td className={styles.num}>4</td>
                <td className={styles.key}>1110</td>
                <td>사출</td>
                <td>수율 하한</td>
                <td className={styles.num}>96.40</td>
                <td>%</td>
                <td>
                  <Badge status="draft">초안</Badge>
                </td>
              </tr>
              <tr>
                <td className={styles.check}>
                  <input type="checkbox" aria-label="5행 선택" />
                </td>
                <td className={styles.editState} title="수정">
                  •
                </td>
                <td className={styles.num}>5</td>
                <td className={styles.key}>1200</td>
                <td>조립 1차</td>
                <td>수율 하한</td>
                <td className={cx(styles.num, styles.cellError)}>102.00</td>
                <td>%</td>
                <td>
                  <Badge status="active">사용</Badge>
                </td>
              </tr>
              <tr className={styles.rowDeleted}>
                <td className={styles.check}>
                  <input type="checkbox" aria-label="6행 선택" />
                </td>
                <td className={styles.editState} title="삭제">
                  −
                </td>
                <td className={styles.num}>6</td>
                <td className={styles.key}>1210</td>
                <td>조립 2차</td>
                <td>투입 순서</td>
                <td className={styles.num}>6</td>
                <td>순번</td>
                <td>
                  <Badge status="inactive">미사용</Badge>
                </td>
              </tr>
              <tr>
                <td className={styles.check}>
                  <input type="checkbox" aria-label="7행 선택" />
                </td>
                <td className={styles.editState} />
                <td className={styles.num}>7</td>
                <td className={styles.key}>1300</td>
                <td>용접</td>
                <td>대기 시간</td>
                <td className={styles.num}>512.3</td>
                <td>초</td>
                <td>
                  <Badge status="rejected">반려</Badge>
                </td>
              </tr>
              <tr className={styles.rowRetired}>
                <td className={styles.check}>
                  <input type="checkbox" aria-label="8행 선택" />
                </td>
                <td className={styles.editState} />
                <td className={styles.num}>8</td>
                <td className={styles.key}>1400</td>
                <td>도장</td>
                <td>대기 시간</td>
                <td className={styles.num}>40.0</td>
                <td>초</td>
                <td>
                  <Badge status="retired">폐기</Badge>
                </td>
              </tr>
            </tbody>
          </table>
          <div className={styles.gridFoot}>
            <span className={styles.warnMessage}>
              <Icon name="warning" />
              저장하지 않은 변경 3건이 있습니다.
            </span>
          </div>
        </div>
      </Section>
      <Section title="표시">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>표시</th>
                <th>모양</th>
                <th>예시 행</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>행 편집 상태 (저장 전)</td>
                <td className={styles.muted}>
                  편집 상태 열에 + 신규, • 수정, − 삭제. 삭제 행은 안내 글자에 키 칸만 취소선
                </td>
                <td className={styles.muted}>3, 4, 5, 6</td>
              </tr>
              <tr>
                <td>선택 행</td>
                <td className={styles.muted}>선택 면, 첫 칸에 본문색 2px 막대</td>
                <td className={styles.muted}>2</td>
              </tr>
              <tr>
                <td>마우스 올림</td>
                <td className={styles.muted}>마우스 올림 면</td>
                <td className={styles.muted}>3</td>
              </tr>
              <tr>
                <td>포커스 셀</td>
                <td className={styles.muted}>본문색 2px 안쪽 테두리</td>
                <td className={styles.muted}>2 (공정명)</td>
              </tr>
              <tr>
                <td>에이전트가 바꾼 셀 (저장 전)</td>
                <td className={styles.muted}>agent-soft 면, agent 굵은 글자, 앞에 2px 고리</td>
                <td className={styles.muted}>3 (기준값)</td>
              </tr>
              <tr>
                <td>검증 오류 셀</td>
                <td className={styles.muted}>negative-soft 면, negative 1px 안쪽 테두리, 굵은 글자, 앞에 !</td>
                <td className={styles.muted}>5 (기준값)</td>
              </tr>
              <tr>
                <td>폐기 행</td>
                <td className={styles.muted}>행 글자는 안내 글자, 코드에 취소선</td>
                <td className={styles.muted}>8</td>
              </tr>
              <tr>
                <td>주의 메시지</td>
                <td className={styles.muted}>warning 글자, 앞에 삼각형</td>
                <td className={styles.muted}>그리드 아래</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};
