import type { Meta, StoryObj } from "@storybook/react-vite";
import { iconNames, iconSources, iconUses } from "../../icons/icons.generated";
import styles from "./foundations.module.css";
import { Icon, measure, Page, Section, Token } from "./parts";

const meta = {
  title: "기초/아이콘",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const sizes = [
  {
    size: "sm",
    token: "icon-size-sm",
    art: "12 / 16",
    use: "배지, 그리드 머리글의 정렬·필터",
    sample: ["check", "clock", "close", "arrow-up", "filter"],
  },
  {
    size: "md",
    token: "icon-size-md",
    art: "16 / 20",
    use: "버튼, 입력 칸, 메뉴, 행 동작, 토스트, 배너",
    sample: ["search", "calendar", "download", "history", "warning"],
  },
  {
    size: "lg",
    token: "icon-size-lg",
    art: "24 / 28",
    use: "빈 상태, 확인 창",
    sample: ["search", "info", "warning", "success", "error"],
  },
] as const;

export const Sizes: Story = {
  name: "크기와 쓰는 법",
  render: () => (
    <Page
      title="아이콘"
      lead="Fluent UI System Icons(Regular)를 씁니다. 크기마다 따로 그려진 그림이라 배율 100% 모니터에서도 선이 픽셀에 맞아 또렷합니다. 색은 글자색을 따릅니다."
    >
      <Section
        title="크기"
        note="아이콘은 1px씩 키우지 않고, 글자 크기 '크게'에서 한 단계 큰 그림으로 건너뜁니다. 모니터 보정으로는 바뀌지 않습니다. 도구 막대에서 글자 크기를 바꿔 보세요."
      >
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>크기</th>
                <th>토큰</th>
                <th className={styles.num}>지금</th>
                <th>그림 (보통 / 크게)</th>
                <th>견본</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s.size}>
                  <td>{s.size}</td>
                  <td>
                    <Token name={s.token} />
                  </td>
                  <td className={styles.num}>{measure(`var(--${s.token})`)}px</td>
                  <td className={styles.muted}>{s.art}</td>
                  <td>
                    <span className={styles.iconLine}>
                      {s.sample.map((n) => (
                        <Icon key={n} name={n} size={s.size} />
                      ))}
                    </span>
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
          <li>
            색은 글자를 따릅니다. 버튼 안 아이콘은 버튼 글자색, 혼자 있는 아이콘(행 동작, 입력 칸 끝의 화살표·달력)은
            보조 글자색입니다.
          </li>
          <li>
            의미색은 뜻이 있을 때만 씁니다: 토스트의 성공·오류, 주의 배너의 삼각형. 브랜드 레드는 아이콘에 쓰지
            않습니다.
          </li>
          <li>버튼은 글자가 먼저이고 아이콘은 앞에 붙습니다(사이 4px).</li>
          <li>
            아이콘만 있는 버튼은 뜻이 분명한 것(더 보기, 닫기, 새로 고침)만 쓰고, 정사각형에 label(aria-label)과 툴팁을
            답니다.
          </li>
          <li>정렬하지 않은 머리글에는 아이콘을 두지 않고, 정렬한 열에만 화살표를 둡니다.</li>
          <li>
            한 개념에 한 아이콘입니다. 아래 목록에 없는 아이콘이 필요하면 scripts/build-icons.mjs의 목록에 더합니다.
          </li>
          <li>에이전트는 아이콘 대신 2px 고리를 씁니다.</li>
        </ul>
      </Section>
    </Page>
  ),
};

export const List: Story = {
  name: "목록",
  render: () => (
    <Page
      title="아이콘 목록"
      lead="화면에서 쓰는 아이콘입니다. 왼쪽이 기본(md), 오른쪽이 크게(lg)입니다. 굵은 글자가 MMD 이름, 그 아래가 쓰는 곳과 Fluent 이름입니다."
    >
      <div className={styles.iconGrid}>
        {iconNames.map((name) => (
          <div key={name} className={styles.iconTile}>
            <span className={styles.iconPreview}>
              <Icon name={name} />
              <Icon name={name} size="lg" />
            </span>
            <b>{name}</b>
            <small>
              {iconUses[name]} · {iconSources[name]}
            </small>
          </div>
        ))}
      </div>
    </Page>
  ),
};
