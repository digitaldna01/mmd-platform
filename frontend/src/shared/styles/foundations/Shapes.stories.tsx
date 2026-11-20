import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./foundations.module.css";
import { cx, Icon, Page, Section, Token } from "./parts";

const meta = {
  title: "기초/모서리와 테두리",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Radius: Story = {
  name: "모서리",
  render: () => (
    <Page
      title="모서리"
      lead="한 줄짜리 컨트롤과 막대는 4px, 여러 요소를 담는 상자는 6px입니다. 알약형은 쓰지 않습니다."
    >
      <Section title="단계">
        <div className={styles.shapes}>
          <div className={styles.shapeItem}>
            <span className={styles.shapeBox} style={{ borderRadius: 0 }}>
              셀
            </span>
            <b>0</b>그리드 셀, 탭, 가장자리에 붙은 패널
          </div>
          <div className={styles.shapeItem}>
            <span className={cx(styles.badge, styles.pending)}>
              <Icon name="clock" size="sm" />
              승인 대기
            </span>
            <b>
              <Token name="radius-sm" /> 3px
            </b>
            배지, 체크박스
          </div>
          <div className={styles.shapeItem}>
            <span className={styles.shapeBox} style={{ borderRadius: "var(--radius-md)" }}>
              버튼, 입력창
            </span>
            <b>
              <Token name="radius-md" /> 4px
            </b>
            버튼, 입력창, 선택 상자, 메뉴 항목, 툴팁, 안내 배너
          </div>
          <div className={styles.shapeItem}>
            <span className={cx(styles.shapeBox, styles.shapePanel)} style={{ borderRadius: "var(--radius-lg)" }}>
              패널
            </span>
            <b>
              <Token name="radius-lg" /> 6px
            </b>
            패널, 그리드 상자, 드롭다운, 다이얼로그, 토스트
          </div>
          <div className={styles.shapeItem}>
            <span className={styles.ring} style={{ width: "var(--space-4)", height: "var(--space-4)" }} />
            <b>원</b>점, 에이전트 고리
          </div>
        </div>
      </Section>
      <Section title="규칙">
        <ul className={styles.rules}>
          <li>모서리는 높이의 절반을 넘지 않습니다.</li>
          <li>안쪽 요소의 모서리는 감싸는 요소보다 크지 않습니다.</li>
          <li>사이드 메뉴의 활성 항목은 막대가 붙는 왼쪽 모서리를 0으로 둡니다.</li>
        </ul>
      </Section>
    </Page>
  ),
};

const colors = [
  { token: "border", name: "구분선", use: "패널 윤곽, 그리드 선" },
  {
    token: "border-strong",
    name: "강한 테두리",
    use: "그리드 머리글 아래, 보조 버튼, 읽기 전용·비활성 칸, 떠 있는 상자 윤곽",
  },
  { token: "border-input", name: "입력창 테두리", use: "편집할 수 있는 칸" },
  { token: "negative", name: "의미색", use: "상태 배지, 오류 칸" },
];

export const Borders: Story = {
  name: "테두리",
  render: () => (
    <Page
      title="테두리"
      lead="굵기는 둘입니다. 1px은 구조, 2px은 상태입니다. 점선은 '아직 확정되지 않음'(초안)에만 씁니다."
    >
      <Section title="굵기">
        <div className={styles.shapes}>
          <div className={styles.shapeItem}>
            <span className={styles.lineSample} style={{ border: "var(--border-width) solid var(--border-input)" }}>
              입력창
            </span>
            <b>
              <Token name="border-width" /> 1px
            </b>
            구조: 패널 윤곽, 구분선, 그리드 선, 입력창, 배지
          </div>
          <div className={styles.shapeItem}>
            <span
              className={styles.lineSample}
              style={{ outline: "var(--border-width-state) solid var(--text)", outlineOffset: "-1px" }}
            >
              열린 입력창
            </span>
            <b>
              <Token name="border-width-state" /> 2px
            </b>
            상태: 포커스, 열린 입력 칸, 편집 중인 셀, 현재 위치 막대, 에이전트 고리
          </div>
          <div className={styles.shapeItem}>
            <span className={cx(styles.badge, styles.draft)}>초안</span>
            <b>점선</b>
            초안에만. 빈 상태를 점선 상자로 그리지 않습니다.
          </div>
        </div>
      </Section>
      <Section title="색">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>견본</th>
                <th>이름</th>
                <th>토큰</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((c) => (
                <tr key={c.token}>
                  <td>
                    <span
                      className={styles.lineSample}
                      style={{ border: `var(--border-width) solid var(--${c.token})` }}
                    >
                      {c.token === "negative" ? (
                        <span style={{ color: "var(--negative)", display: "inline-flex", gap: "var(--gap-inline)" }}>
                          <Icon name="close" />
                          반려
                        </span>
                      ) : (
                        c.name
                      )}
                    </span>
                  </td>
                  <td>{c.name}</td>
                  <td>
                    <Token name={c.token} />
                  </td>
                  <td className={styles.muted}>{c.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};
