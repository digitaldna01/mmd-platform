import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./foundations.module.css";
import { contrast, cx, Page, Ratio, Section, Token, tokenValue, Value } from "./parts";

const meta = {
  title: "기초/색",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const v = (token: string) => `var(--${token})`;
const surfaces = ["bg-app", "bg-surface", "bg-sunken", "bg-raised"] as const;

const backgrounds = [
  { token: "bg-app", role: "창 바탕", use: "앱 전체 배경. 사이드 메뉴(--bg-nav)도 같은 값입니다." },
  { token: "bg-surface", role: "패널", use: "그리드, 입력 영역, 카드, 입력 칸의 면" },
  { token: "bg-sunken", role: "그리드 머리글", use: "조회 조건 패널, 그리드 머리글, 읽기 전용 칸" },
  {
    token: "bg-raised",
    role: "떠 있는 면",
    use: "드롭다운, 토스트, 다이얼로그. 라이트는 패널과 같고 그림자로 띄웁니다. 다크는 한 단계 밝은 면입니다.",
  },
];

const texts = [
  { token: "text", role: "본문", use: "본문, 주요 버튼 면, 포커스 링" },
  { token: "text-muted", role: "보조 글자", use: "라벨, 그리드 머리글, 코드 옆 이름, 고스트 버튼, 필수 표시 *" },
  { token: "text-subtle", role: "안내 글자", use: "입력 칸 안내 문구, 폐기 행, 메뉴 묶음 이름" },
  {
    token: "text-disabled",
    role: "비활성 글자",
    use: "비활성 버튼, 메뉴, 입력 칸. WCAG 대비 기준의 예외라 2.5:1 이상이면서 안내 글자보다 흐립니다.",
  },
];

export const Neutral: Story = {
  name: "바탕과 글자",
  render: () => (
    <Page
      title="바탕과 글자"
      lead="회색 단계를 OKLCH 명도로 정했습니다. 라이트는 LG Warm Grey와 같은 색상(85°)에 아주 약한 채도, 다크는 차가운 색상(250°)입니다. 순백과 순흑은 쓰지 않습니다."
    >
      <Section title="바탕">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>견본</th>
                <th>역할</th>
                <th>토큰</th>
                <th>지금 값</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {backgrounds.map((b) => (
                <tr key={b.token}>
                  <td>
                    <span className={styles.swatch} style={{ background: v(b.token) }} />
                  </td>
                  <td>{b.role}</td>
                  <td>
                    <Token name={b.token} />
                  </td>
                  <td>
                    <Value>{tokenValue(b.token)}</Value>
                  </td>
                  <td className={styles.muted}>{b.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="글자"
        note="비활성 글자를 뺀 모든 글자는 네 바탕 위에서 4.5:1 이상입니다(WCAG 1.4.3). 본문과 보조 글자는 오래 읽는 창 바탕과 패널 위에서 더 높게 둡니다. 비활성 글자는 WCAG 예외라 2.5:1 이상이면서 안내 글자보다 흐리게 둡니다."
      >
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>견본</th>
                <th>역할</th>
                <th>토큰</th>
                <th>지금 값</th>
                {surfaces.map((s) => (
                  <th key={s} className={styles.num}>
                    {s}
                  </th>
                ))}
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {texts.map((t) => (
                <tr key={t.token}>
                  <td className={styles.sampleText} style={{ color: v(t.token) }}>
                    1010 프레스 성형
                  </td>
                  <td>{t.role}</td>
                  <td>
                    <Token name={t.token} />
                  </td>
                  <td>
                    <Value>{tokenValue(t.token)}</Value>
                  </td>
                  {surfaces.map((s) => (
                    <td key={s} className={styles.num}>
                      <Ratio value={contrast(v(t.token), v(s))} min={t.token === "text-disabled" ? 2.5 : 4.5} />
                    </td>
                  ))}
                  <td className={styles.muted}>{t.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};

const tints = [
  { token: "border", role: "구분선", kind: "line", use: "패널 윤곽, 그리드 선" },
  {
    token: "border-strong",
    role: "강한 테두리",
    kind: "line",
    use: "그리드 머리글 아래, 보조 버튼, 읽기 전용·비활성 칸, 떠 있는 상자 윤곽",
  },
  {
    token: "border-input",
    role: "입력창 테두리",
    kind: "line",
    use: "편집할 수 있는 칸. 글자가 아닌 표시라 3:1 이상입니다(WCAG 1.4.11).",
  },
  { token: "bg-hover", role: "마우스 올림", kind: "fill", use: "보조·고스트 버튼, 그리드 행, 메뉴와 드롭다운 항목" },
  { token: "bg-press", role: "누름", kind: "fill", use: "누르는 동안. 마우스 올림보다 한 단계 진합니다." },
  { token: "bg-selected", role: "선택", kind: "fill", use: "그리드 선택 행(2px 막대와 함께), 미사용 배지 면" },
  { token: "bg-disabled", role: "비활성 면", kind: "fill", use: "비활성 주요 버튼, 비활성 체크한 상자" },
] as const;

export const Tints: Story = {
  name: "선과 면",
  render: () => (
    <Page
      title="선과 면"
      lead="선, 마우스 올림, 누름, 선택은 투명도로 만듭니다. 어떤 바탕 위에 놓여도 한 단계 진하게 보입니다."
    >
      <Section title="투명도 색">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>역할</th>
                <th>토큰</th>
                <th>지금 값</th>
                <th>창 바탕 위</th>
                <th>패널 위</th>
                <th>조회 조건 위</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {tints.map((t) => (
                <tr key={t.token}>
                  <td>{t.role}</td>
                  <td>
                    <Token name={t.token} />
                  </td>
                  <td>
                    <Value>{tokenValue(t.token)}</Value>
                  </td>
                  {(["bg-app", "bg-surface", "bg-sunken"] as const).map((s) => (
                    <td key={s}>
                      <div className={styles.cellStack}>
                        <span className={styles.tintCell} style={{ background: v(s) }}>
                          {t.kind === "line" ? (
                            <span className={styles.tintLine} style={{ borderColor: v(t.token) }} />
                          ) : (
                            <span className={styles.tintFill} style={{ background: v(t.token) }} />
                          )}
                        </span>
                        {t.token === "border-input" && <Ratio value={contrast(v(t.token), v(s))} min={3} />}
                      </div>
                    </td>
                  ))}
                  <td className={styles.muted}>{t.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};

const semantic = [
  { token: "positive", sample: "사용", use: "사용, 저장 완료" },
  { token: "negative", sample: "반려", use: "반려, 저장 실패, 검증 오류" },
  { token: "warning", sample: "저장하지 않은 변경 2건", use: "저장하지 않은 변경, 막지 않는 검증 경고, 수정 충돌" },
  { token: "agent", sample: "에이전트가 바꿈", use: "에이전트가 바꾼 값, 에이전트가 실행한 동작" },
];

export const Semantic: Story = {
  name: "의미색",
  render: () => (
    <Page
      title="의미색"
      lead="의미색은 넷만 둡니다. 정보용 파랑은 없고, 안내는 무채색으로 씁니다. 옅은 면(-soft)은 같은 색의 투명도입니다."
    >
      <Section title="의미색과 옅은 면" note="글자는 패널 위와 자기 옅은 면 위에서 모두 4.5:1 이상입니다.">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>토큰</th>
                <th>지금 값</th>
                <th>패널 위 글자</th>
                <th>옅은 면 (-soft)</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {semantic.map((s) => (
                <tr key={s.token}>
                  <td>
                    <Token name={s.token} />
                  </td>
                  <td>
                    <div className={styles.cellStack}>
                      <Value>{tokenValue(s.token)}</Value>
                      <Value>{tokenValue(`${s.token}-soft`)}</Value>
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellStack}>
                      <span className={styles.sampleText} style={{ color: v(s.token), fontWeight: 600 }}>
                        {s.sample}
                      </span>
                      <Ratio value={contrast(v(s.token), v("bg-surface"))} min={4.5} />
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellStack}>
                      <span className={styles.softChip} style={{ color: v(s.token), background: v(`${s.token}-soft`) }}>
                        {s.sample}
                      </span>
                      <Ratio value={contrast(v(s.token), v("bg-surface"), v(`${s.token}-soft`))} min={4.5} />
                    </div>
                  </td>
                  <td className={styles.muted}>{s.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="규칙">
        <ul className={styles.rules}>
          <li>빨강(negative)은 오류와 반려에만 씁니다. 삭제 버튼에도 쓰지 않습니다.</li>
          <li>warning은 기준정보 상태에 쓰지 않습니다. 지금 사용자가 확인해야 하는 신호에만 씁니다.</li>
          <li>의미색만으로 상태를 나타내지 않습니다. 글자와 모양(체크, ×, !, 삼각형)을 함께 씁니다.</li>
        </ul>
      </Section>
    </Page>
  ),
};

export const Brand: Story = {
  name: "브랜드",
  render: () => (
    <Page
      title="브랜드"
      lead="브랜드 레드는 로고 띠와 활성 메뉴의 2px 막대, 로그인과 빈 화면처럼 업무 데이터가 없는 곳에만 씁니다. 주요 버튼은 레드가 아니라 짙은 차콜입니다."
    >
      <Section
        title="토큰"
        note="표시선은 글자가 아닌 표시라 3:1 이상이어야 합니다. 그래서 다크에서는 Heritage Red(2.4:1) 대신 Active Red를 씁니다."
      >
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>견본</th>
                <th>토큰</th>
                <th>지금 값</th>
                <th>창 바탕 위</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {[
                { token: "brand-heritage", use: "로고 영역, 라이트의 활성 메뉴 표시선" },
                { token: "brand-active", use: "로그인 화면, 빈 화면 안내의 강조, 다크의 활성 메뉴 표시선" },
                { token: "brand-bar", use: "로고 띠와 활성 메뉴 막대. 라이트는 Heritage, 다크는 Active입니다." },
              ].map((b) => (
                <tr key={b.token}>
                  <td>
                    <span className={styles.swatch} style={{ background: v(b.token) }} />
                  </td>
                  <td>
                    <Token name={b.token} />
                  </td>
                  <td>
                    <Value>{tokenValue(b.token)}</Value>
                  </td>
                  <td>
                    <Ratio value={contrast(v(b.token), v("bg-app"))} min={b.token === "brand-bar" ? 3 : undefined} />
                  </td>
                  <td className={styles.muted}>{b.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section
        title="사이드 메뉴"
        note="로고 띠와 활성 메뉴 막대는 같은 세로선 위에 둡니다. 탭 밑줄과 그리드 막대에는 빨강을 쓰지 않습니다."
      >
        <div className={styles.navDemo}>
          <div className={styles.navLogo}>MMD</div>
          <div className={styles.navLabel}>공정 기준정보</div>
          <div className={styles.navItem}>공정 정책 관리</div>
          <div className={cx(styles.navItem, styles.navItemOn)}>Route 관리</div>
          <div className={cx(styles.navItem, styles.navItemHover)}>대체/재작업 Route</div>
          <div className={styles.navItem}>Route 공정</div>
        </div>
      </Section>
    </Page>
  ),
};
