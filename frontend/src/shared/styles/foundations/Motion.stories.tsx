import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../icons/Icon";
import base from "./foundations.module.css";
import styles from "./motion.module.css";
import { cx, Page, Section, Token } from "./parts";

const meta = {
  title: "기초/모션",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** 툴팁: 마우스를 올리고 0.5초 뒤, 키보드 포커스는 바로. 떠날 때 0.1초 기다림 */
function TooltipButton({ label, icon }: { label: string; icon: "refresh" | "download" | "copy" | "more" }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 100);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <span className={styles.anchor}>
      <button
        type="button"
        className={cx(styles.btn, styles.ghost, styles.square)}
        aria-label={label}
        onMouseEnter={() => show(500)}
        onMouseLeave={hide}
        onFocus={() => show(0)}
        onBlur={hide}
      >
        <Icon name={icon} />
      </button>
      <span className={cx(styles.pop, styles.tooltip, open && styles.open)} role="tooltip">
        {label}
      </span>
    </span>
  );
}

function Floating() {
  const [dropdown, setDropdown] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!toast || paused) return;
    const t = window.setTimeout(() => setToast(false), 5000);
    return () => window.clearTimeout(t);
  }, [toast, paused]);
  const closeAll = () => {
    setDialog(false);
    setDrawer(false);
  };
  return (
    <div className={styles.stage}>
      <div className={styles.toolbar}>
        <span className={styles.anchor}>
          <button type="button" className={cx(styles.btn, styles.secondary)} onClick={() => setDropdown(!dropdown)}>
            공정
            <Icon name="chevron-down" />
          </button>
          <div className={cx(styles.pop, styles.dropdown, dropdown && styles.open)}>
            {["1010 · 자재 투입", "1100 · 프레스 성형", "1200 · 조립 1차"].map((o) => (
              <span key={o} className={styles.option} onClick={() => setDropdown(false)}>
                {o}
              </span>
            ))}
          </div>
        </span>
        <TooltipButton label="새로 고침" icon="refresh" />
        <button type="button" className={cx(styles.btn, styles.secondary)} onClick={() => setDialog(true)}>
          확인 창
        </button>
        <button type="button" className={cx(styles.btn, styles.secondary)} onClick={() => setToast(true)}>
          토스트
        </button>
        <button type="button" className={cx(styles.btn, styles.secondary)} onClick={() => setDrawer(true)}>
          서랍
        </button>
      </div>
      <div className={cx(styles.pop, styles.scrim, (dialog || drawer) && styles.open)} onClick={closeAll} />
      <div className={cx(styles.pop, styles.dialog, dialog && styles.open)} role="dialog" aria-label="삭제 확인">
        <b>공정 정책 2건을 삭제할까요?</b>
        <p>저장하면 되돌릴 수 없습니다.</p>
        <div className={styles.foot}>
          <button type="button" className={cx(styles.btn, styles.secondary)} onClick={closeAll}>
            취소
          </button>
          <button type="button" className={cx(styles.btn, styles.primary)} onClick={closeAll}>
            삭제
          </button>
        </div>
      </div>
      <div
        className={cx(styles.pop, styles.toast, toast && styles.open)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Icon name="success" className={styles.positive} />
        <b>저장했습니다</b>
        <button
          type="button"
          className={cx(styles.btn, styles.ghost, styles.square, styles.small)}
          onClick={() => setToast(false)}
        >
          <Icon name="close" label="닫기" />
        </button>
      </div>
      <nav className={cx(styles.drawer, drawer && styles.drawerOpen)} aria-label="메뉴">
        {["공정 정책 관리", "Route 관리", "Route 공정"].map((m) => (
          <span key={m} onClick={closeAll}>
            {m}
          </span>
        ))}
      </nav>
    </div>
  );
}

function LayoutChange() {
  const [agent, setAgent] = useState(false);
  const [changed, setChanged] = useState(false);
  return (
    <>
      <div className={styles.layout}>
        {!agent && (
          <div className={styles.layoutNav}>
            <div className={cx(changed && styles.slideLeft)}>
              공정 정책 관리
              <br />
              Route 관리
              <br />
              Route 공정
            </div>
          </div>
        )}
        <div className={styles.layoutMain}>
          <table className={base.grid}>
            <thead>
              <tr>
                <th>공정 코드</th>
                <th>공정명</th>
                <th>항목</th>
                <th className={base.num}>기준값</th>
                <th>수정일시</th>
              </tr>
            </thead>
            <tbody>
              {["자재 투입", "절단", "프레스 성형", "사출", "조립 1차"].map((n, i) => (
                <tr key={n}>
                  <td>{1010 + i * 10}</td>
                  <td>{n}</td>
                  <td>대기 시간</td>
                  <td className={base.num}>
                    {(1280 - i * 37.5).toLocaleString("ko-KR", { minimumFractionDigits: 1 })}
                  </td>
                  <td>2026-11-1{i} 09:12</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {agent && (
          <aside className={styles.layoutDock}>
            <div className={styles.slideRight}>
              <div className={styles.dockHead}>
                <span className={styles.ring} />
                에이전트
              </div>
            </div>
          </aside>
        )}
      </div>
      <div className={styles.row}>
        <button
          type="button"
          className={cx(styles.btn, styles.secondary)}
          onClick={() => {
            setChanged(true);
            setAgent(!agent);
          }}
        >
          에이전트 열고 닫기
        </button>
      </div>
    </>
  );
}

function Waiting() {
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [log, setLog] = useState("");
  const query = (took: number) => {
    if (active !== null) return; // 처리 중에는 다시 보내지 않습니다
    setActive(took);
    let shownAt = 0;
    const showTimer = window.setTimeout(() => {
      shownAt = Date.now();
      setShown(true);
    }, 300);
    window.setTimeout(() => {
      window.clearTimeout(showTimer);
      const wait = shownAt ? Math.max(0, 500 - (Date.now() - shownAt)) : 0;
      window.setTimeout(() => {
        setShown(false);
        setActive(null);
        setLog(`${took}ms 걸림 · ${shownAt ? `로딩 표시 ${Date.now() - shownAt}ms` : "로딩 표시 없음"}`);
      }, wait);
    }, took);
  };
  const spinner = (
    <svg className={styles.spin} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
  return (
    <>
      <div className={styles.row}>
        {[200, 2000].map((took) => (
          <button
            key={took}
            type="button"
            className={cx(styles.btn, styles.primary)}
            aria-busy={active === took || undefined}
            onClick={() => query(took)}
          >
            {shown && active === took ? spinner : <Icon name="search" />}
            조회 ({took / 1000}초 걸림)
          </button>
        ))}
      </div>
      <div className={cx(styles.gridBox, shown && styles.loading)}>
        <table className={base.grid}>
          <thead>
            <tr>
              <th>공정 코드</th>
              <th>공정명</th>
              <th className={base.num}>기준값</th>
              <th>수정일시</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1010</td>
              <td>자재 투입</td>
              <td className={base.num}>1</td>
              <td>2026-11-18 09:12</td>
            </tr>
            <tr>
              <td>1020</td>
              <td>절단</td>
              <td className={base.num}>1,280.0</td>
              <td>2026-11-19 16:40</td>
            </tr>
            <tr>
              <td>1100</td>
              <td>프레스 성형</td>
              <td className={base.num}>96.0</td>
              <td>2026-11-20 08:05</td>
            </tr>
          </tbody>
        </table>
        {shown && (
          <span className={styles.loadMark} role="status">
            {spinner}조회 중
          </span>
        )}
      </div>
      <div className={styles.log}>{log}</div>
    </>
  );
}

const tokens = [
  ["duration-fast", "80ms", "상태 색: 마우스 올림, 누름, 체크, 그리드 행"],
  ["duration-normal", "150ms", "떠 있는 것의 페이드: 드롭다운, 툴팁, 토스트, 확인 창, 막. 조회 중 행 흐림"],
  ["duration-slow", "200ms", "서랍, 들어오는 패널(에이전트 패널, 다시 펼친 메뉴)"],
  ["duration-spin", "800ms", "스피너 한 바퀴"],
  ["ease-out", "cubic-bezier(0.2, 0, 0, 1)", "나타날 때, 상태 색"],
  ["ease-in", "cubic-bezier(0.4, 0, 1, 1)", "사라질 때"],
];

export const Motion: Story = {
  name: "모션",
  render: () => (
    <Page
      title="모션"
      lead="움직임은 화면이 바뀐 것을 알려 줄 때만 씁니다. 사진으로는 판단할 수 없으니 직접 눌러 보세요. OS의 '동작 줄이기'를 켜면 밀려 나오는 움직임이 없어집니다."
    >
      <Section title="토큰">
        <div className={base.box}>
          <table className={base.table}>
            <thead>
              <tr>
                <th>토큰</th>
                <th>값</th>
                <th>쓰는 곳</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(([token, value, use]) => (
                <tr key={token}>
                  <td>
                    <Token name={token ?? ""} />
                  </td>
                  <td className={base.typeSample}>{value}</td>
                  <td className={base.muted}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section
        title="움직이는 것"
        note="상태 색은 80ms, 떠 있는 것은 150ms 페이드(자리를 옮기거나 커지지 않음), 서랍만 200ms 동안 왼쪽에서 밀려 나옵니다. 툴팁은 0.5초 뒤에 나타나고, 토스트는 마우스를 올리면 멈춥니다."
      >
        <Floating />
      </Section>
      <Section
        title="레이아웃이 바뀔 때"
        note="자리는 한 번에 바뀌고(그리드는 한 번만 다시 배치), 들어오는 패널의 내용만 200ms 동안 밀려 들어옵니다. 본문 폭을 움직이며 바꾸지 않습니다."
      >
        <LayoutChange />
      </Section>
      <Section
        title="기다림"
        note="0.3초가 넘을 때만 로딩 표시를 하고, 한번 보이면 0.5초는 둡니다. 기존 행은 흐리게 남깁니다. 처리 중인 버튼은 누른 순간부터 다시 누를 수 없습니다."
      >
        <Waiting />
      </Section>
    </Page>
  ),
};
