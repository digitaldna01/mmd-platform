import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./foundations.module.css";
import { cx, measure, Page, Section, Token, Value, Icon } from "./parts";

const meta = {
  title: "기초/글꼴과 크기",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const scale = [
  { size: "xs", weight: 500, use: "라벨, 배지, 캡션, 그리드 머리글 (배지와 그리드 머리글은 600)", sample: "공정 코드" },
  {
    size: "sm",
    weight: 400,
    use: "그리드 셀, 버튼, 입력창, 메뉴 (버튼 500)",
    sample: "1010 프레스 성형 1,280.0",
  },
  { size: "md", weight: 400, use: "읽는 글: 안내, 메시지, 에이전트 대화", sample: "저장하지 않은 변경이 있습니다." },
  { size: "lg", weight: 600, use: "영역 제목", sample: "Route 공정" },
  { size: "xl", weight: 700, use: "화면 제목", sample: "공정 정책 관리" },
  { size: "2xl", weight: 700, use: "로그인·빈 화면 제목", sample: "조회 결과가 없습니다" },
];

export const Scale: Story = {
  name: "크기 단계",
  render: () => (
    <Page
      title="크기 단계"
      lead="기준 크기는 보통 모니터, 글자 크기 '보통'일 때입니다. 한글은 12px 아래로 내리지 않습니다. 도구 막대에서 글자 크기와 모니터를 바꾸면 '지금 크기'가 바뀝니다."
    >
      <Section title="글자 크기">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>토큰</th>
                <th className={styles.num}>지금 크기</th>
                <th className={styles.num}>굵기</th>
                <th className={styles.num}>줄 높이</th>
                <th>견본</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {scale.map((s) => (
                <tr key={s.size}>
                  <td>
                    <Token name={`text-${s.size}`} />
                  </td>
                  <td className={styles.num}>{measure(`var(--text-${s.size})`)}px</td>
                  <td className={styles.num}>{s.weight}</td>
                  <td className={styles.num}>
                    <Value>--leading-{s.size}</Value>
                  </td>
                  <td
                    className={styles.typeSample}
                    style={{
                      fontSize: `var(--text-${s.size})`,
                      fontWeight: s.weight,
                      lineHeight: `var(--leading-${s.size})`,
                    }}
                  >
                    {s.sample}
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
          <li>굵기는 400, 500, 600, 700만 씁니다(--weight-regular, -medium, -semibold, -bold).</li>
          <li>한국어 문단은 단어 단위로 줄을 바꿉니다(word-break: keep-all).</li>
        </ul>
      </Section>
    </Page>
  ),
};

const message = `FIELD    VALUE
PROC_ID  1010
PROC_NM  프레스 성형
ROUTE    RT0A10
QTY      1280`;

export const Faces: Story = {
  name: "서체",
  render: () => (
    <Page
      title="서체"
      lead="본문과 그리드는 Pretendard 하나로 씁니다. 고정폭 글꼴은 글자 칸이 세로로 맞아야 하는 곳에만 씁니다."
    >
      <Section title="기본: Pretendard Variable">
        <p className={styles.note}>본문, UI, 그리드. 숫자 전용 글꼴은 두지 않습니다.</p>
        <p style={{ margin: 0, fontSize: "var(--text-md)" }}>
          공정 정책 관리 · Route 관리 · 0123456789 · ABCDEFGHIJKLMNOPQRSTUVWXYZ
        </p>
        <Value>--font-sans</Value>
      </Section>
      <Section title="고정폭: D2Coding">
        <p className={styles.note}>
          메시지 미리 보기, 로그, 화면 ID 줄. 한글이 정확히 2칸이라 한글 값이 섞여도 열이 맞습니다.
        </p>
        <pre className={styles.mono}>{message}</pre>
        <Value>--font-mono</Value>
      </Section>
      <Section title="브랜드: LG EI Text">
        <p className={styles.note}>
          로그인 화면 제목과 MMD 글자 로고에만 씁니다. 글꼴 파일은 LG 자산이라 공개 저장소에 없습니다. 이 PC에서는
          Pretendard로 대신 보입니다.
        </p>
        <span className={styles.brand}>MMD</span>
        <Value>--font-brand</Value>
      </Section>
    </Page>
  ),
};

const codes = [
  { name: "공정 코드", format: "숫자만", value: "1010", zero: false },
  { name: "Route", format: "영문 대문자 + 숫자", value: "RT0A10", zero: true },
  { name: "P/N", format: "영문 + 숫자", value: "PN-2001", zero: true },
  { name: "공장", format: "P9, P8", value: "P9", zero: true },
  { name: "Shop", format: "P9T, P9C", value: "P9T", zero: true },
];

export const Numbers: Story = {
  name: "숫자와 코드",
  render: () => (
    <Page
      title="숫자와 코드"
      lead="모든 셀은 고정폭 숫자(tabular-nums)로 자릿수를 세로로 맞춥니다. 빗금 0은 영문과 숫자가 섞인 코드 칸에만 켭니다."
    >
      <Section title="코드" note="LOT 형식은 확인한 뒤 같은 기준으로 정합니다.">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>코드</th>
                <th>형식</th>
                <th>빗금 0</th>
                <th>견본</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td className={styles.muted}>{c.format}</td>
                  <td className={styles.muted}>{c.zero ? "켬" : "끔"}</td>
                  <td className={cx(c.zero && styles.code)}>{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="숫자 열" note="수량과 기준값은 오른쪽 정렬, 코드는 식별자라 왼쪽 정렬입니다.">
        <div className={styles.box}>
          <table className={styles.grid}>
            <thead>
              <tr>
                <th>공정 코드</th>
                <th>Route</th>
                <th className={styles.num}>기준값</th>
                <th className={styles.num}>수량</th>
                <th>수정일시</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1010", "RT0A10", "1,280.0", "40", "2026-11-18 09:12"],
                ["1200", "RT0B21", "96.40", "1,200", "2026-11-19 16:40"],
                ["6000", "RT1O08", "102.00", "7", "2026-11-20 08:05"],
              ].map(([code, route, value, qty, at]) => (
                <tr key={code}>
                  <td>{code}</td>
                  <td className={styles.code}>{route}</td>
                  <td className={styles.num}>{value}</td>
                  <td className={styles.num}>{qty}</td>
                  <td>{at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  ),
};

const adjusted = [
  { name: "그리드 글자 (text-sm)", token: "text-sm", values: [13, 14, 15, 16] },
  { name: "그리드 행 높이", token: "row-height", values: [28, 30, 32, 34] },
  { name: "컨트롤 높이 (버튼, 입력창)", token: "control-height", values: [32, 34, 36, 38] },
  { name: "배지 높이", token: "badge-height", values: [20, 22, 24, 26] },
];

export const Adjustment: Story = {
  name: "크기 조정",
  render: () => (
    <Page
      title="크기 조정"
      lead="넓은 모니터(모니터 폭 2,200px 이상)는 자동으로 +1px, 사용자가 '글자 크기: 크게'를 고르면 +2px입니다. 둘 다면 +3px입니다. 간격은 바뀌지 않습니다. 도구 막대에서 바꿔 보세요."
    >
      <Section title="값">
        <div className={styles.box}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>항목</th>
                <th>토큰</th>
                <th className={styles.num}>기준</th>
                <th className={styles.num}>넓은 모니터</th>
                <th className={styles.num}>크게</th>
                <th className={styles.num}>넓은 모니터 + 크게</th>
                <th className={styles.num}>지금</th>
              </tr>
            </thead>
            <tbody>
              {adjusted.map((a) => (
                <tr key={a.token}>
                  <td>{a.name}</td>
                  <td>
                    <Token name={a.token} />
                  </td>
                  {a.values.map((px) => (
                    <td key={px} className={styles.num}>
                      {px}px
                    </td>
                  ))}
                  <td className={styles.num}>
                    <b>{measure(`var(--${a.token})`)}px</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="지금 크기로 그린 견본">
        <div className={styles.sizeDemo}>
          <div className={styles.sizeItem}>
            그리드 행<span className={styles.rowSample}>1010 프레스 성형</span>
          </div>
          <div className={styles.sizeItem}>
            입력창
            <span className={styles.controlSample}>공정 정책 관리</span>
          </div>
          <div className={styles.sizeItem}>
            배지
            <span className={cx(styles.badge, styles.pending)}>
              <Icon name="clock" size="sm" />
              승인 대기
            </span>
          </div>
        </div>
      </Section>
    </Page>
  ),
};
