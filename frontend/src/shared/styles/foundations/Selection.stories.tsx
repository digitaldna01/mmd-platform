import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./foundations.module.css";
import { cx, Icon, Page, Section } from "./parts";

const meta = {
  title: "기초/선택과 포커스",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selection: Story = {
  name: "선택 표시",
  render: () => (
    <Page
      title="선택 표시"
      lead="표시마다 뜻이 하나입니다. 막대는 지금 있는 곳, 체크는 고른 값, 면은 지금 가리키는 것, 채운 면은 고른 쪽입니다."
    >
      <div className={styles.grammar}>
        <div className={styles.card}>
          <h3>막대 2px: 지금 있는 곳</h3>
          <div className={styles.navDemo} style={{ width: "auto" }}>
            <div className={cx(styles.navItem, styles.navItemOn)}>Route 관리</div>
            <div className={styles.navItem}>Route 공정</div>
          </div>
          <div className={styles.tabs}>
            <span className={cx(styles.tab, styles.tabOn)}>공정 정책</span>
            <span className={styles.tab}>변경 이력</span>
          </div>
          <p>사이드 메뉴는 왼쪽 브랜드 레드, 탭은 아래 본문색, 그리드 현재 행은 왼쪽 본문색입니다.</p>
        </div>
        <div className={styles.card}>
          <h3>체크: 고른 값 · 면: 가리키는 것</h3>
          <div className={styles.list}>
            <span className={styles.option}>
              <Icon name="check" />
              1010 <span className={styles.optionName}>· 자재 투입</span>
            </span>
            <span className={cx(styles.option, styles.optionPointed)}>
              <Icon name="check" />
              1020 <span className={styles.optionName}>· 절단</span>
            </span>
            <span className={cx(styles.option, styles.optionChosen)}>
              <Icon name="check" />
              1100 <span className={styles.optionName}>· 프레스 성형</span>
            </span>
          </div>
          <p>드롭다운 항목에는 막대를 쓰지 않습니다. 막대를 쓰면 '현재 위치'와 '고른 값'이 같아 보입니다.</p>
        </div>
        <div className={styles.card}>
          <h3>채운 면: 고른 쪽</h3>
          <span className={styles.segmented}>
            <span className={styles.segmentOn}>아래</span>
            <span>위</span>
          </span>
          <p>세그먼트 버튼은 고른 쪽을 주요 버튼 면으로 채웁니다.</p>
        </div>
      </div>
    </Page>
  ),
};

const states = [
  { name: "기본", className: undefined, value: "1100", label: "공정" },
  { name: "마우스 올림", className: styles.inputHover, value: "1100", label: "공정" },
  { name: "열림, 포커스", className: styles.inputOpen, value: "1100", label: "공정" },
  {
    name: "오류",
    className: cx(styles.inputInvalid, styles.inputOpen),
    value: "9999",
    label: "공정",
    error: "없는 공정 코드입니다.",
  },
  { name: "읽기 전용", className: styles.inputReadonly, value: "1100", label: "공정" },
  { name: "비활성", className: styles.inputDisabled, value: "공장을 먼저 고르세요", label: "Shop" },
];

export const InputStates: Story = {
  name: "입력 칸 상태",
  render: () => (
    <Page
      title="입력 칸 상태"
      lead="선택 상자와 입력창은 같은 규칙을 씁니다. 편집할 수 있는 칸은 입력창 테두리(3:1 이상), 읽기 전용과 비활성 칸은 강한 테두리입니다."
    >
      <div className={styles.fields}>
        {states.map((s) => (
          <div key={s.name} className={styles.field}>
            <span className={styles.fieldLabel}>
              {s.label}
              <span className={styles.required}>*</span>
            </span>
            <span className={cx(styles.input, s.className)}>
              <span>{s.value}</span>
              <Icon name="chevron-down" />
            </span>
            {s.error ? (
              <span className={styles.fieldError}>{s.error}</span>
            ) : (
              <span className={styles.stateName}>{s.name}</span>
            )}
          </div>
        ))}
      </div>
      <Section title="규칙">
        <ul className={styles.rules}>
          <li>열림과 포커스는 본문색 2px을 안쪽으로 그립니다(outline-offset: -1px).</li>
          <li>오류는 negative 1px, 포커스 때 negative 2px이고 칸 아래에 안내 문구를 씁니다.</li>
          <li>필수 표시 *는 보조 글자색입니다. 빨강은 오류와 반려에만 씁니다.</li>
          <li>코드와 이름을 함께 보일 때는 "PN-2001 · 개발 모델"처럼 가운뎃점으로 나눕니다.</li>
        </ul>
      </Section>
    </Page>
  ),
};

export const Focus: Story = {
  name: "포커스",
  render: () => (
    <Page
      title="포커스"
      lead="키보드 포커스는 본문색 2px입니다. 버튼, 탭, 링크는 바깥에, 입력 칸과 그리드 셀은 안쪽에 그립니다. box-shadow는 Windows 고대비 모드에서 사라져 outline으로 그립니다."
    >
      <div className={styles.focusRow}>
        <div className={styles.sizeItem}>
          버튼 (바깥 2px)
          <span className={cx(styles.buttonSample, styles.focusOutside)}>초기화</span>
        </div>
        <div className={styles.sizeItem}>
          입력 칸 (안쪽 2px)
          <span className={cx(styles.input, styles.inputOpen)} style={{ width: 180 }}>
            <span>1100</span>
          </span>
        </div>
        <div className={styles.sizeItem}>
          그리드 셀 (안쪽 2px)
          <table className={styles.grid} style={{ width: 200 }}>
            <tbody>
              <tr>
                <td>1100</td>
                <td className={styles.cellFocus}>프레스 성형</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Section title="직접 해 보기" note="Tab 키로 이동해 보세요. 전역 기본값은 바깥 2px 링입니다.">
        <div className={styles.focusRow}>
          <button type="button" className={styles.buttonSample}>
            조회
          </button>
          <button type="button" className={styles.buttonSample}>
            초기화
          </button>
        </div>
      </Section>
    </Page>
  ),
};
