// 기초 스토리(색, 글꼴, 간격 등)에서 함께 쓰는 조각입니다.
// 이 폴더의 그림은 디자인 규칙을 보여 주기 위한 것입니다. 화면에서 가져다 쓰지 않고, 컴포넌트는 따로 만듭니다.
import type { ReactNode } from "react";
import { type IconName, type IconSize, Icon as SharedIcon } from "../../icons/Icon";
import styles from "./foundations.module.css";

export function cx(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}

export function Page({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </header>
      {children}
    </div>
  );
}

export function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {note && <p className={styles.note}>{note}</p>}
      {children}
    </section>
  );
}

export function Token({ name }: { name: string }) {
  return <code className={styles.token}>--{name}</code>;
}

export function Value({ children }: { children: ReactNode }) {
  return <code className={styles.value}>{children}</code>;
}

/** 지금 테마와 크기 설정에서 토큰에 들어 있는 값 */
export function tokenValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

// ---------- 계산된 색과 길이 ----------
type Rgba = [number, number, number, number];
let probe: HTMLSpanElement | null = null;

function getProbe(): HTMLSpanElement {
  if (!probe || !probe.isConnected) {
    probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
  }
  return probe;
}

function resolveColor(css: string): Rgba {
  const el = getProbe();
  el.style.color = css;
  const parts =
    getComputedStyle(el)
      .color.match(/[\d.]+/g)
      ?.map(Number) ?? [];
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
}

/** CSS 길이(토큰 포함)를 px 숫자로 바꿉니다 */
export function measure(css: string): number {
  const el = getProbe();
  el.style.width = css;
  return parseFloat(getComputedStyle(el).width);
}

function over(top: Rgba, bottom: Rgba): Rgba {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
}

const channel = (c: number) => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgba) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/**
 * WCAG 대비 비율. layers는 아래에서 위 순서의 바탕입니다(첫 바탕은 불투명).
 * 투명도 색은 바로 아래 바탕 위에 얹은 결과로 잽니다.
 */
export function contrast(fg: string, ...layers: string[]): number {
  const bg = layers.map(resolveColor).reduce((acc, layer) => over(layer, acc));
  const text = over(resolveColor(fg), bg);
  const [hi, lo] = [luminance(text), luminance(bg)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** 대비 비율과 기준 통과 여부. min이 없으면 값만 보입니다 */
export function Ratio({ value, min }: { value: number; min?: number }) {
  const ok = min === undefined || value >= min;
  return (
    <span className={cx(styles.ratio, !ok && styles.ratioFail)} title={min === undefined ? undefined : `기준 ${min}:1`}>
      {value.toFixed(1)}:1{ok ? "" : " ×"}
    </span>
  );
}

// ---------- 아이콘 ----------
// 화면과 같은 Fluent 아이콘(shared/icons/Icon)을 씁니다. className으로 이 폴더의 위치·색 규칙만 더합니다.
export function Icon({ name, size, className }: { name: IconName; size?: IconSize; className?: string }) {
  return <SharedIcon name={name} size={size} className={cx(styles.icon, className)} />;
}
