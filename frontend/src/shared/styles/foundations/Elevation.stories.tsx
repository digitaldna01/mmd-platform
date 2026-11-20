import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./foundations.module.css";
import { cx, Icon, Page, Section, Token } from "./parts";

const meta = {
  title: "기초/그림자와 층",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const layers = [
  { token: "z-sticky", value: 10, use: "고정 머리글" },
  { token: "z-dock", value: 20, use: "도킹 패널" },
  { token: "z-dialog", value: 30, use: "다이얼로그, 서랍" },
  { token: "z-popover", value: 40, use: "드롭다운, 메뉴 (다이얼로그 안에서도 열림)" },
  { token: "z-toast", value: 50, use: "토스트" },
  { token: "z-tooltip", value: 60, use: "툴팁 (다이얼로그와 토스트 안의 버튼에도 뜸)" },
];

export const Elevation: Story = {
  name: "그림자와 층",
  render: () => (
    <Page
      title="그림자와 층"
      lead="높이는 세 단계입니다. 다크에서는 그림자가 보이지 않아 면의 밝기로 높이를 나타냅니다."
    >
      <Section
        title="0 평면, 1 떠 있음"
        note="패널과 조회 조건은 그림자 없이 테두리로 구분합니다. 드롭다운은 떠 있는 면(--bg-raised) + 강한 테두리 + 그림자(라이트)입니다. 다크의 떠 있는 면은 조회 조건보다 밝아서 그 위에서도 묻히지 않습니다."
      >
        <div className={styles.stage}>
          <div className={styles.levelSunken}>
            <div className={styles.field} style={{ width: 220 }}>
              <span className={styles.fieldLabel}>공정</span>
              <span className={cx(styles.input, styles.inputOpen)}>
                <span>1100</span>
                <span className={styles.optionName}>· 프레스 성형</span>
                <Icon name="chevron-down" />
              </span>
              <div className={styles.floating}>
                {[
                  ["1010", "자재 투입", false, false],
                  ["1020", "절단", false, true],
                  ["1100", "프레스 성형", true, false],
                  ["1200", "조립 1차", false, false],
                ].map(([code, name, chosen, pointed]) => (
                  <span
                    key={String(code)}
                    className={cx(
                      styles.option,
                      chosen === true && styles.optionChosen,
                      pointed === true && styles.optionPointed,
                    )}
                  >
                    <Icon name="check" />
                    {code} <span className={styles.optionName}>· {name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.levelFlat}>0 평면: 그리드 상자, 패널</div>
        </div>
      </Section>
      <Section title="2 화면을 막음" note="다이얼로그와 확인 창입니다. 막은 사이드 메뉴까지 앱 전체를 덮습니다.">
        <div className={styles.dialogStage}>
          <div className={styles.fakeApp}>
            <span />
            <span />
          </div>
          <div className={styles.scrim} />
          <div className={styles.dialog}>
            <b>메시지 미리 보기</b>
            <p>보낼 메시지를 확인합니다.</p>
          </div>
        </div>
      </Section>
      <Section title="토큰">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>단계</th>
                <th>면</th>
                <th>그림자</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0 평면</td>
                <td>
                  <Token name="bg-surface" />
                </td>
                <td className={styles.muted}>없음. 테두리로 구분</td>
                <td className={styles.muted}>패널, 조회 조건, 그리드, 도킹한 에이전트 패널</td>
              </tr>
              <tr>
                <td>1 떠 있음</td>
                <td>
                  <Token name="bg-raised" />
                </td>
                <td>
                  <Token name="shadow-float" />
                </td>
                <td className={styles.muted}>드롭다운, 메뉴, 툴팁, 토스트</td>
              </tr>
              <tr>
                <td>2 화면을 막음</td>
                <td>
                  <Token name="bg-raised" />
                </td>
                <td>
                  <Token name="shadow-dialog" /> + <Token name="scrim" />
                </td>
                <td className={styles.muted}>다이얼로그, 확인 창</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="층 순서 (z-index)">
        <div className={styles.box}>
          <table className={styles.table}>
            <tbody>
              {layers.map((l) => (
                <tr key={l.token}>
                  <td style={{ width: "1%" }}>
                    <Token name={l.token} />
                  </td>
                  <td className={styles.num} style={{ width: "1%" }}>
                    {l.value}
                  </td>
                  <td className={styles.muted}>{l.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};
