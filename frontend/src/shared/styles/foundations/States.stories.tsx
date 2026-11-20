import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import base from "./foundations.module.css";
import { cx, Icon, Page, Section } from "./parts";
import styles from "./states.module.css";

const meta = {
  title: "기초/상호작용 상태",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type IconName = Parameters<typeof Icon>[0]["name"];

function Ic({ name }: { name: IconName }) {
  return <Icon name={name} className={styles.icon} />;
}

function Spinner() {
  return (
    <svg className={styles.spin} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}

const columns = ["기본", "마우스 올림", "누름", "키보드 포커스", "비활성", "처리 중"] as const;
const stateClass = [undefined, styles.isHover, styles.isPress, styles.isFocus, undefined, undefined];

function ButtonRow({
  kind,
  variant,
  label,
  icon,
  disabledLabel,
  disabledIcon,
  busyLabel,
  square,
}: {
  kind: string;
  variant: string | undefined;
  label: string;
  icon?: IconName;
  disabledLabel?: string;
  disabledIcon?: IconName;
  busyLabel?: string;
  square?: boolean;
}) {
  return (
    <tr>
      <td className={styles.kind}>{kind}</td>
      {columns.map((column, i) => {
        const disabled = column === "비활성";
        const busy = column === "처리 중";
        if (busy && square) {
          return (
            <td key={column}>
              <span className={styles.none}>없음</span>
            </td>
          );
        }
        const iconName = disabled ? (disabledIcon ?? icon) : icon;
        return (
          <td key={column}>
            <button
              type="button"
              className={cx(styles.btn, variant, square && styles.square, stateClass[i])}
              aria-disabled={disabled || undefined}
              aria-busy={busy || undefined}
              aria-label={square ? label : undefined}
            >
              {busy ? <Spinner /> : iconName && <Ic name={iconName} />}
              {!square && (disabled ? (disabledLabel ?? label) : busy ? (busyLabel ?? label) : label)}
            </button>
          </td>
        );
      })}
    </tr>
  );
}

export const Press: Story = {
  name: "누르는 것",
  render: () => (
    <Page
      title="누르는 것"
      lead="마우스 올림은 면이 한 단계, 누름은 두 단계 진해집니다. 상태가 바뀌어도 크기, 모서리, 테두리 굵기, 글자 굵기는 그대로입니다. 표의 버튼에 실제로 마우스를 올리고 눌러 볼 수도 있습니다."
    >
      <div className={cx(base.box)}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th />
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ButtonRow kind="주요" variant={styles.primary} label="저장 4건" disabledLabel="저장 0건" />
            <ButtonRow kind="보조" variant={styles.secondary} label="초기화" icon="reset" busyLabel="복사" />
            <ButtonRow
              kind="고스트"
              variant={styles.ghost}
              label="행 추가"
              icon="add"
              disabledLabel="행 삭제"
              disabledIcon="remove"
              busyLabel="엑셀"
            />
            <ButtonRow kind="아이콘만" variant={styles.ghost} label="더 보기" icon="more" square />
          </tbody>
        </table>
      </div>
      <Section title="규칙">
        <ul className={base.rules}>
          <li>
            면 위에 투명도 면을 얹습니다: 마우스 올림 --bg-hover, 누름 --bg-press. 주요 버튼은 --primary-hover,
            --primary-press(한 단계씩 밝은 회색, 다크는 어두운 회색)입니다.
          </li>
          <li>고스트는 글자도 보조 글자에서 본문색으로 진해집니다.</li>
          <li>
            비활성: 비활성 글자, 주요 버튼은 비활성 면, 보조 버튼은 강한 테두리. 투명도로 흐리게 하지 않습니다. disabled
            대신 aria-disabled="true"로 두어 포커스와 이유를 알려 주는 툴팁을 남깁니다.
          </li>
          <li>
            처리 중: 면은 그대로, 아이콘 자리에(없으면 글자 앞에) 스피너. 글자는 바꾸지 않고, 다시 눌러도 요청을 보내지
            않습니다(aria-busy="true").
          </li>
          <li>커서는 기본 화살표입니다. 링크만 손가락입니다.</li>
        </ul>
      </Section>
    </Page>
  ),
};

function Cells({ children }: { children: ReactNode[] }) {
  return (
    <>
      {children.map((child, i) => (
        <td key={i}>{child}</td>
      ))}
    </>
  );
}

export const Choose: Story = {
  name: "고르는 것",
  render: () => (
    <Page
      title="고르는 것"
      lead="마우스 올림과 누름은 버튼과 같은 투명도 면입니다. 선택은 이미 정한 표시(막대, 체크, 채운 면)를 쓰고, 선택된 것에 마우스를 올리면 그 위에 마우스 올림 면을 한 겹 더 얹습니다. 글자만 있는 탭은 글자색만 진해집니다."
    >
      <div className={base.box}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th />
              <th>기본</th>
              <th>마우스 올림</th>
              <th>누름</th>
              <th>선택</th>
              <th>선택 + 마우스 올림</th>
              <th>비활성</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.kind}>사이드 메뉴</td>
              <Cells>
                {[undefined, styles.isHover, styles.isPress, styles.on, cx(styles.on, styles.isHover), styles.dis].map(
                  (c, i) => (
                    <div key={i} className={styles.nav}>
                      <span className={cx(styles.navItem, c)}>{i >= 3 && i < 5 ? "Route 관리" : "Route 공정"}</span>
                    </div>
                  ),
                )}
              </Cells>
            </tr>
            <tr>
              <td className={styles.kind}>탭</td>
              <Cells>
                {[undefined, styles.isHover, styles.isHover, styles.on, styles.on, styles.dis].map((c, i) => (
                  <span key={i} className={styles.tabs}>
                    <span className={cx(styles.tab, c)}>{i >= 3 && i < 5 ? "공정 정책" : "변경 이력"}</span>
                  </span>
                ))}
              </Cells>
            </tr>
            <tr>
              <td className={styles.kind}>드롭다운 항목</td>
              <Cells>
                {[undefined, styles.isHover, styles.isPress, styles.on, cx(styles.on, styles.isHover), styles.dis].map(
                  (c, i) => (
                    <div key={i} className={styles.list}>
                      <span className={cx(styles.option, c)}>
                        <Ic name="check" />
                        {i >= 3 && i < 5 ? "1100" : "1010"}{" "}
                        <span className={styles.name}>· {i >= 3 && i < 5 ? "프레스 성형" : "자재 투입"}</span>
                      </span>
                    </div>
                  ),
                )}
              </Cells>
            </tr>
            <tr>
              <td className={styles.kind}>그리드 행</td>
              <Cells>
                {[undefined, styles.isHover, "press", styles.on, cx(styles.on, styles.isHover), "none"].map((c, i) =>
                  c === "press" || c === "none" ? (
                    <span key={i} className={styles.none}>
                      {c === "press" ? "없음 (행은 누름 표시 없음)" : "없음"}
                    </span>
                  ) : (
                    <table key={i} className={styles.row}>
                      <tbody>
                        <tr className={c}>
                          <td>{i >= 3 ? "1020" : "1010"}</td>
                          <td>{i >= 3 ? "절단" : "자재 투입"}</td>
                        </tr>
                      </tbody>
                    </table>
                  ),
                )}
              </Cells>
            </tr>
            <tr>
              <td className={styles.kind}>세그먼트</td>
              <Cells>
                {[
                  [styles.on, undefined],
                  [styles.on, styles.isHover],
                  [styles.on, cx(styles.isHover, styles.isPress)],
                  [styles.on, undefined],
                  [cx(styles.on, styles.isHover), undefined],
                  [cx(styles.on, styles.dis), styles.dis],
                ].map(([a, b], i) => (
                  <span key={i} className={styles.segmented}>
                    <span className={cx(styles.segment, a)}>아래</span>
                    <span className={cx(styles.segment, b)}>위</span>
                  </span>
                ))}
              </Cells>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={base.note}>
        그리드 행의 비활성은 없습니다. 편집할 수 없는 칸은 '그리드' 규칙(가라앉은 면 + 안내 글자)을 따릅니다.
      </p>
    </Page>
  ),
};

export const Check: Story = {
  name: "체크하는 것",
  render: () => (
    <Page
      title="체크박스와 라디오"
      lead="상자는 --check-size(16px, 글자 크기 '크게'는 18px)이고 테두리는 입력창 테두리입니다. 체크하면 세그먼트처럼 주요 버튼 면으로 채웁니다(채운 면 = 고른 것). 켬·끔도 체크박스로 하고 스위치는 쓰지 않습니다."
    >
      <div className={base.box}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th />
              <th>해제</th>
              <th>마우스 올림</th>
              <th>체크</th>
              <th>체크 + 마우스 올림</th>
              <th>일부 체크</th>
              <th>키보드 포커스</th>
              <th>비활성</th>
              <th>비활성 체크</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.kind}>체크박스</td>
              <CheckCells type="checkbox" label="사용" />
            </tr>
            <tr>
              <td className={styles.kind}>라디오</td>
              <CheckCells type="radio" label="아래" />
            </tr>
          </tbody>
        </table>
      </div>
      <p className={base.note}>누를 수 있는 영역은 라벨까지, 그리드에서는 칸 전체라 24px을 넘깁니다.</p>
    </Page>
  ),
};

function CheckCells({ type, label }: { type: "checkbox" | "radio"; label: string }) {
  const cls = type === "checkbox" ? styles.box : styles.radio;
  const cases: Array<{ checked?: boolean; mixed?: boolean; state?: string; disabled?: boolean }> = [
    {},
    { state: styles.isHover },
    { checked: true },
    { checked: true, state: styles.isHover },
    { mixed: true },
    { checked: true, state: styles.isFocus },
    { disabled: true },
    { disabled: true, checked: true },
  ];
  return (
    <>
      {cases.map((c, i) => (
        <td key={i}>
          {type === "radio" && c.mixed ? (
            <span className={styles.none}>없음</span>
          ) : (
            <label className={cx(styles.check, c.disabled && styles.dis)}>
              <input
                type={type}
                className={cx(cls, c.state)}
                defaultChecked={c.checked}
                disabled={c.disabled}
                name={`${type}-${i}`}
                ref={(el) => {
                  if (el && c.mixed) el.indeterminate = true;
                }}
              />
              {c.mixed ? "전체" : label}
            </label>
          )}
        </td>
      ))}
    </>
  );
}

export const Sizes: Story = {
  name: "컨트롤 크기",
  render: () => (
    <Page
      title="컨트롤 크기"
      lead="두 단계만 둡니다. 큰 버튼은 두지 않습니다. 두 단계 모두 글자 크기 설정과 모니터 보정을 따라 커지고, 글자는 같은 text-sm입니다."
    >
      <div className={styles.sizes}>
        <div className={styles.sizeCard}>
          <h3>기본 · --control-height (32px)</h3>
          <p>화면에 놓이는 모든 컨트롤: 조회 조건, 툴바, 폼, 다이얼로그 버튼, 사이드 메뉴 항목.</p>
          <div className={styles.line}>
            <span className={styles.input}>
              1100
              <Ic name="chevron-down" />
            </span>
            <button type="button" className={cx(styles.btn, styles.primary)}>
              <Ic name="search" />
              조회
            </button>
            <button type="button" className={cx(styles.btn, styles.secondary)}>
              <Ic name="reset" />
              초기화
            </button>
            <button type="button" className={cx(styles.btn, styles.ghost)}>
              <Ic name="add" />행 추가
            </button>
            <button type="button" className={cx(styles.btn, styles.ghost, styles.square)} aria-label="더 보기">
              <Ic name="more" />
            </button>
          </div>
          <p>같은 줄에 놓인 컨트롤은 높이를 섞지 않습니다. 아이콘만 있는 버튼은 정사각형입니다.</p>
        </div>
        <div className={styles.sizeCard}>
          <h3>작게 · --control-height-sm (28px, 행 높이)</h3>
          <p>
            행 높이 상자 안에 들어가는 컨트롤만: 그리드 셀 편집, 토스트·배너 안 동작, 드롭다운 안 검색 칸, 사이드 메뉴의
            화면 설정.
          </p>
          <div className={styles.toast}>
            <Ic name="success" />
            <span className={styles.toastText}>
              <b>저장했습니다</b>
              <small>공정 정책 4건</small>
            </span>
            <button type="button" className={cx(styles.btn, styles.ghost, styles.sm)}>
              되돌리기
            </button>
            <button type="button" className={cx(styles.btn, styles.ghost, styles.sm, styles.square)} aria-label="닫기">
              <Ic name="close" />
            </button>
          </div>
          <div className={styles.banner}>
            <Ic name="warning" />
            <span>저장하지 않은 변경 2건이 있습니다.</span>
            <button type="button" className={cx(styles.btn, styles.ghost, styles.sm)}>
              변경 보기
            </button>
          </div>
          <table className={styles.row}>
            <tbody>
              <tr>
                <td>1100</td>
                <td className={styles.cellEdit} style={{ width: 150 }}>
                  <span className={cx(styles.input, styles.sm)}>96.0</span>
                </td>
                <td>초</td>
              </tr>
            </tbody>
          </table>
          <p>안쪽 좌우 여백은 --pad-button-x-sm(8px)입니다. 28px도 WCAG 최소 대상 크기 24px을 넘습니다.</p>
        </div>
      </div>
    </Page>
  ),
};
