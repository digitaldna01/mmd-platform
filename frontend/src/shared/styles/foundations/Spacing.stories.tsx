import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./foundations.module.css";
import { measure, Page, Section, Token } from "./parts";

const meta = {
  title: "기초/간격",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const steps = ["space-1", "space-2", "space-3", "space-4", "space-5", "space-6"];

const usage = [
  { token: "gap-inline", use: "아이콘과 글자" },
  { token: "gap-label", use: "라벨과 입력창" },
  { token: "pad-input-x", use: "입력창 안 좌우" },
  { token: "pad-cell-x", use: "그리드 셀 안 좌우" },
  { token: "pad-button-x", use: "버튼 안 좌우" },
  { token: "gap-buttons", use: "같은 묶음의 버튼 사이" },
  { token: "gap-field-x", use: "조회 조건과 폼의 칸 사이 (가로)" },
  { token: "gap-field-y", use: "조회 조건과 폼의 칸 사이 (세로)" },
  { token: "pad-panel", use: "작업 패널 안: 조회 조건, 툴바, 상세 폼" },
  { token: "pad-float", use: "떠 있는 상자 안: 다이얼로그, 토스트" },
  { token: "gap-panel", use: "패널 사이" },
  { token: "page-gutter", use: "화면 가장자리" },
  { token: "pad-empty", use: "빈 상태 안" },
];

export const Spacing: Story = {
  name: "간격",
  render: () => (
    <Page
      title="간격"
      lead="기본 단계는 4px 단위 6단계입니다. 화면과 컴포넌트는 기본 단계 대신 쓰는 곳으로 이름 붙인 쓰임 토큰을 씁니다. 간격은 글자 크기 설정과 모니터 보정에 따라 바뀌지 않습니다."
    >
      <Section title="기본 단계">
        <div className={styles.box}>
          <table className={styles.table}>
            <tbody>
              {steps.map((s) => (
                <tr key={s}>
                  <td style={{ width: "1%" }}>
                    <Token name={s} />
                  </td>
                  <td className={styles.num} style={{ width: "1%" }}>
                    {measure(`var(--${s})`)}px
                  </td>
                  <td>
                    <span className={styles.spaceBar} style={{ width: `var(--${s})` }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="쓰임 토큰">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>토큰</th>
                <th className={styles.num}>값</th>
                <th>크기</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.token}>
                  <td>
                    <Token name={u.token} />
                  </td>
                  <td className={styles.num}>{measure(`var(--${u.token})`)}px</td>
                  <td>
                    <span className={styles.spaceBar} style={{ width: `var(--${u.token})` }} />
                  </td>
                  <td className={styles.muted}>{u.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="규칙">
        <ul className={styles.rules}>
          <li>안쪽 간격은 바깥 간격보다 크지 않습니다. 관계가 가까운 것끼리 더 붙어 보이게 합니다.</li>
          <li>CSS Modules에 px 숫자를 직접 쓰지 않습니다.</li>
        </ul>
      </Section>
    </Page>
  ),
};
