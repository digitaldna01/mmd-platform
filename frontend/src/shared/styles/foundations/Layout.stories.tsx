import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "../../icons/Icon";
import base from "./foundations.module.css";
import styles from "./layout.module.css";
import { cx, Page, Section } from "./parts";

type Preset = "fhd" | "qhd" | "gram" | "zoom";
type Pattern = "list" | "detail" | "dual";

const PRESETS: Record<Preset, { width: number; height: number; label: string }> = {
  fhd: { width: 1920, height: 950, label: '24" FHD, 배율 100%: 창 1920 × 950' },
  qhd: {
    width: 2560,
    height: 1290,
    label: '27" QHD, 배율 100%: 창 2560 × 1290 (글자 +1px은 도구 막대의 "넓은 모니터")',
  },
  gram: { width: 1280, height: 720, label: 'gram 14", 배율 150%: 창 1280 × 720' },
  zoom: { width: 960, height: 475, label: '24" FHD에서 브라우저 200% 확대: 창 960 × 475' },
};

interface LayoutArgs {
  preset: Preset;
  pattern: Pattern;
  agentOpen: boolean;
  menuCollapsed: boolean;
}

const meta: Meta<LayoutArgs> = {
  title: "기초/화면 골격",
  parameters: { layout: "fullscreen" },
  args: { preset: "fhd", pattern: "list", agentOpen: false, menuCollapsed: false },
  argTypes: {
    preset: {
      name: "창 크기",
      control: "inline-radio",
      options: ["fhd", "qhd", "gram", "zoom"],
      labels: { fhd: '24" FHD 100%', qhd: '27" QHD 100%', gram: 'gram 14" 150%', zoom: "FHD 200% 확대" },
    },
    pattern: {
      name: "화면 종류",
      control: "inline-radio",
      options: ["list", "detail", "dual"],
      labels: { list: "목록", detail: "목록 + 상세", dual: "이중 목록" },
    },
    agentOpen: { name: "에이전트 패널 열기", control: "boolean" },
    menuCollapsed: { name: "사용자가 메뉴를 접음", control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<LayoutArgs>;

/** 실제 창 크기의 틀을 그리고, 보이는 폭에 맞춰 줄입니다 */
function Stage({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div ref={ref} className={styles.stageWrap}>
      <div className={styles.stage} style={{ width: width * scale, height: height * scale }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
    </div>
  );
}

function Nav({ onCollapse }: { onCollapse: () => void }) {
  return (
    <nav className={styles.nav} aria-label="메뉴">
      <div className={styles.logo}>
        MMD
        <span className={styles.grow} />
        <button
          type="button"
          className={cx(styles.btn, styles.ghost, styles.square, styles.small)}
          onClick={onCollapse}
        >
          <Icon name="chevron-left" label="메뉴 접기" />
        </button>
      </div>
      <div className={styles.navGroup}>
        <div className={styles.navLabel}>공정 기준정보</div>
        <span className={cx(styles.navItem, styles.navItemOn)}>
          공정 정책 관리<span className={styles.legacyId}>SIC01061</span>
        </span>
        <span className={styles.navItem}>
          Route 관리<span className={styles.legacyId}>SIC01020</span>
        </span>
        <span className={styles.navItem}>
          Route 공정<span className={styles.legacyId}>SIC01030</span>
        </span>
      </div>
      <div className={styles.navGroup}>
        <div className={styles.navLabel}>시스템</div>
        <span className={styles.navItem}>시스템 정보</span>
      </div>
      <span className={styles.grow} />
      <div className={styles.settings}>
        테마, 글자 크기 설정
        <div className={styles.user}>
          <Icon name="user" />
          <span className={styles.grow}>김민수</span>
          <Icon name="logout" label="로그아웃" />
        </div>
      </div>
    </nav>
  );
}

const processNames = [
  "자재 투입",
  "절단",
  "프레스 성형",
  "사출",
  "조립 1차",
  "조립 2차",
  "용접",
  "도장",
  "세정",
  "건조",
];

function Grid({ rows, title, count }: { rows: number; title: string; count: string }) {
  return (
    <div className={styles.gridBox}>
      <div className={styles.toolbar}>
        <span>
          <b>{title}</b>
          <span className={styles.count}>{count}</span>
        </span>
        <span className={styles.buttons}>
          <button type="button" className={cx(styles.btn, styles.ghost)}>
            <Icon name="add" />행 추가
          </button>
          <button type="button" className={cx(styles.btn, styles.ghost)}>
            <Icon name="download" />
            엑셀
          </button>
        </span>
      </div>
      <div className={styles.gridScroll}>
        <table className={styles.grid}>
          <thead>
            <tr>
              <th className={styles.num}>No</th>
              <th>공정 코드</th>
              <th>공정명</th>
              <th className={styles.num}>기준값</th>
              <th>수정자</th>
              <th>수정일시</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, i) => (
              <tr key={i}>
                <td className={styles.num}>{i + 1}</td>
                <td>{1010 + i * 10}</td>
                <td>{processNames[i % processNames.length]}</td>
                <td className={styles.num}>
                  {(1280 - i * 37.5).toLocaleString("ko-KR", { minimumFractionDigits: 1 })}
                </td>
                <td>{["김민수", "이서연", "박지훈"][i % 3]}</td>
                <td>2026-11-{String(20 - (i % 19)).padStart(2, "0")} 09:12</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Query() {
  return (
    <div className={styles.query}>
      <label className={styles.field}>
        <span>공장 *</span>
        <span className={styles.input}>
          P9
          <Icon name="chevron-down" />
        </span>
      </label>
      <label className={styles.field}>
        <span>Shop</span>
        <span className={styles.input}>
          P9T
          <Icon name="chevron-down" />
        </span>
      </label>
      <label className={styles.field}>
        <span>수정일</span>
        <span className={styles.input}>
          2026-11-01 ~ 2026-11-20
          <Icon name="calendar" />
        </span>
      </label>
      <span className={styles.buttons}>
        <button type="button" className={cx(styles.btn, styles.primary)}>
          <Icon name="search" />
          조회
        </button>
        <button type="button" className={cx(styles.btn, styles.secondary)}>
          <Icon name="reset" />
          초기화
        </button>
      </span>
    </div>
  );
}

function Work({ pattern }: { pattern: Pattern }) {
  if (pattern === "detail") {
    return (
      <div className={styles.work}>
        <Grid rows={12} title="Route" count="총 12건" />
        <div className={styles.splitter} title="끌어서 높이 조절">
          <i />
        </div>
        <Grid rows={9} title="Route 공정 · RT0A10" count="총 9건" />
      </div>
    );
  }
  if (pattern === "dual") {
    return (
      <div className={styles.dual}>
        <div className={cx(styles.gridBox, styles.dualSource)}>
          <div className={styles.toolbar}>
            <span>
              <b>공정</b>
              <span className={styles.count}>9건 · 3건 고름</span>
            </span>
          </div>
        </div>
        <div className={styles.dualMiddle}>
          <button type="button" className={cx(styles.btn, styles.secondary)}>
            추가 3<Icon name="arrow-right" />
          </button>
          <button type="button" className={cx(styles.btn, styles.secondary)}>
            <Icon name="arrow-left" />
            빼기
          </button>
        </div>
        <div className={styles.dualTarget}>
          <Grid rows={6} title="Route 공정" count="총 6건" />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.work}>
      <Grid rows={32} title="공정 정책" count="총 32건" />
    </div>
  );
}

function AppFrame({ preset, pattern, agentOpen, menuCollapsed }: LayoutArgs) {
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(menuCollapsed);
  const [agent, setAgent] = useState(agentOpen);
  const { width, height } = PRESETS[preset];
  return (
    <Stage width={width} height={height}>
      <div
        className={styles.frame}
        style={{ width, height }}
        data-agent={agent ? "open" : "closed"}
        data-menu={collapsed ? "closed" : "open"}
        data-drawer={drawer ? "open" : "closed"}
        onKeyDown={(e) => e.key === "Escape" && setDrawer(false)}
      >
        <div className={styles.shell}>
          <Nav onCollapse={() => setCollapsed(true)} />
          <main className={styles.main}>
            <div className={styles.scroller}>
              <header className={styles.head}>
                <button
                  type="button"
                  className={cx(styles.btn, styles.ghost, styles.square, styles.menuButton)}
                  onClick={() => setDrawer(true)}
                >
                  <Icon name="menu" label="메뉴 열기" />
                </button>
                <div className={styles.titles}>
                  <h1 className={styles.title}>공정 정책 관리</h1>
                  <div className={styles.ids}>PANEL_TPFOPOLICY · 레거시 SIC01061 · 화면 ID process.panelTpfopolicy</div>
                </div>
                <span className={styles.grow} />
                <button type="button" className={cx(styles.btn, styles.ghost)} onClick={() => setAgent(!agent)}>
                  <span className={styles.ring} />
                  에이전트
                </button>
              </header>
              <Query />
              <Work pattern={pattern} />
            </div>
          </main>
          <aside className={styles.dock} aria-label="에이전트">
            <div className={styles.dockHead}>
              <span className={styles.ring} />
              <b className={styles.grow}>에이전트</b>
              <button
                type="button"
                className={cx(styles.btn, styles.ghost, styles.square, styles.small)}
                onClick={() => setAgent(false)}
              >
                <Icon name="close" label="닫기" />
              </button>
            </div>
            <div className={styles.dockBody}>
              내용은 에이전트 단계에서 정합니다. 여기서는 자리와 폭(360px)만 봅니다.
            </div>
          </aside>
          <div className={styles.scrim} onClick={() => setDrawer(false)} />
          <div className={styles.drawer}>
            <Nav onCollapse={() => setDrawer(false)} />
          </div>
        </div>
      </div>
    </Stage>
  );
}

export const Skeleton: Story = {
  name: "앱 틀",
  render: (args) => (
    <Page
      title="화면 골격"
      lead="아래 틀은 실제 창 크기로 그리고 화면 폭에 맞춰 줄였습니다. 아래 Controls에서 창 크기, 화면 종류, 에이전트 패널, 메뉴를 바꿔 보세요. 메뉴가 접히면 제목 왼쪽의 메뉴 버튼으로 서랍을 엽니다."
    >
      <p className={base.note}>{PRESETS[args.preset].label}</p>
      <AppFrame key={`${args.preset}-${args.agentOpen}-${args.menuCollapsed}`} {...args} />
      <Section title="규칙">
        <ul className={base.rules}>
          <li>앱 위쪽 막대를 두지 않습니다. 로고, 메뉴, 화면 설정, 사용자는 사이드 메뉴에 있습니다.</li>
          <li>
            화면 머리, 조회 조건, 그리드 툴바와 머리글은 그대로 두고 그리드 안만 스크롤합니다. 창 높이가 560 미만이면
            화면 전체를 스크롤합니다.
          </li>
          <li>
            메뉴가 접히면 서랍으로 엽니다(막이 깔리고, 고르거나 바깥을 누르거나 Esc로 닫힘). 아이콘 막대로 접지
            않습니다.
          </li>
          <li>상세는 목록 아래에 두고 손잡이로 높이를 나눕니다.</li>
          <li>에이전트 패널은 오른쪽에 붙고 그리드를 덮지 않습니다. 자리가 모자라면 메뉴가 먼저 서랍으로 접힙니다.</li>
        </ul>
      </Section>
      <Section title="구간">
        <div className={base.box}>
          <table className={base.table}>
            <thead>
              <tr>
                <th>창 폭</th>
                <th>사이드 메뉴</th>
                <th>에이전트 패널을 열면</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1440 이상</td>
                <td>펼침</td>
                <td className={base.muted}>오른쪽에 붙고 메뉴도 그대로</td>
              </tr>
              <tr>
                <td>1024 ~ 1439</td>
                <td>펼침</td>
                <td className={base.muted}>메뉴가 서랍으로 접힘</td>
              </tr>
              <tr>
                <td>1024 미만</td>
                <td>서랍</td>
                <td className={base.muted}>오른쪽에 붙고 본문이 좁아짐</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={base.note}>
          본문 폭 900 미만이면 이중 목록을 위아래로, 640 미만이면 조회 조건 칸을 한 줄에 하나씩 둡니다.
        </p>
      </Section>
    </Page>
  ),
};
