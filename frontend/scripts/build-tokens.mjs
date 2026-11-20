// 디자인 토큰의 원본입니다. 다음 두 파일을 만듭니다. 두 파일은 손으로 고치지 않습니다.
//   src/shared/styles/tokens.css   라이트·다크 CSS 변수
//   tokens-report.md               글자와 바탕의 대비 검사 결과
// 실행: npm run tokens  /  검사만: npm run tokens:check (tokens.css가 이 파일과 맞는지)
// 규칙: docs/design-guide.md. 값을 바꿀 때는 문서와 이 파일을 함께 고칩니다.
//
// axon(apps/web/scripts/build-tokens.mjs)에서 옮겼습니다. 색 계산은 같고, 값과 이름은 MMD 디자인 가이드를 따릅니다.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = {
  css: join(here, "../src/shared/styles/tokens.css"),
  report: join(here, "../tokens-report.md"),
};

// ---------- 색 계산 ----------
const clamp01 = (x) => Math.min(1, Math.max(0, x));
function oklchToLinear(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(clamp01);
}
const toSrgb = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const toLinear = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const to255 = (lin) => lin.map((x) => Math.round(toSrgb(x) * 255));
const hexOf = (lin) =>
  "#" +
  to255(lin)
    .map((x) => x.toString(16).padStart(2, "0").toUpperCase())
    .join("");

/** OKLCH로 정한 색 */
const oklch = (L, C, h) => {
  const lin = oklchToLinear(L, C, h);
  return { lin, hex: hexOf(lin), note: `oklch(${L} ${C} ${h})` };
};
/** LG 공식 값처럼 hex로 정해진 색 */
const fixed = (hex, note) => {
  const lin = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  return { lin, hex, note };
};
/** 투명도 색. 바탕 위에 얹은 결과로 대비를 잽니다 */
const alpha = (base, a) => ({ base, a, css: `rgb(${to255(base.lin).join(" ")} / ${a})` });
/** 브라우저처럼 sRGB 값에서 섞습니다 */
const over = (fg, a, bg) => fg.lin.map((c, i) => toLinear(toSrgb(c) * a + toSrgb(bg.lin[i]) * (1 - a)));
const lum = (lin) => 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
/** 선형 rgb의 OKLCH 명도 */
const oklchL = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// ---------- 색 정의 (design-guide.md '색') ----------
// 뉴트럴: 라이트와 다크 모두 쿨(250°). 채도는 라이트 0.003, 다크 0.008입니다.
// 라이트 패널과 다크 본문은 채도를 반으로 줄여 거의 무채색으로 둡니다(axon과 같음).
// 라이트를 웜(85°)에서 바꾼 이유는 design-guide.md '뉴트럴'에 있습니다.
const N = { light: { h: 250, C: 0.003 }, dark: { h: 250, C: 0.008 } };
// 라이트의 선, 마우스 올림, 선택, 그림자의 기준색. 면과 같은 색상·채도 규칙으로 계산합니다
const lightTint = oklch(0.183, N.light.C, N.light.h);

const themes = {
  light: {
    color: {
      // 면 나눔: 메뉴 0.95 < 본문 바탕 0.975 < 패널 0.994. 그리드 머리글 등은 본문 바탕보다 어두운 0.955
      "bg-app": oklch(0.975, N.light.C, N.light.h),
      "bg-surface": oklch(0.994, 0.0015, N.light.h),
      "bg-sunken": oklch(0.955, N.light.C, N.light.h),
      "bg-nav": oklch(0.95, N.light.C, N.light.h),
      // 비활성 글자: 안내 글자보다 한 단계 흐리게(약 3:1). WCAG는 비활성 요소를 대비 기준에서 뺍니다
      "text-disabled": oklch(0.64, N.light.C, N.light.h),
      "text-subtle": oklch(0.52, N.light.C, N.light.h),
      "text-muted": oklch(0.42, N.light.C, N.light.h),
      text: oklch(0.25, N.light.C, N.light.h),
      // 주요 버튼(면 = 본문색)의 마우스 올림·누름: 한 단계씩 밝은 회색
      "primary-hover": oklch(0.33, N.light.C, N.light.h),
      "primary-press": oklch(0.4, N.light.C, N.light.h),
      positive: oklch(0.5, 0.13, 150),
      negative: oklch(0.52, 0.17, 25),
      warning: oklch(0.52, 0.11, 75),
      agent: oklch(0.5, 0.16, 295),
      "brand-heritage": fixed("#A50034", "LG Heritage Red"),
      "brand-active": fixed("#FD312E", "LG Active Red"),
    },
    // 떠 있는 면: 라이트는 패널 면 + 그림자
    raised: "bg-surface",
    // 활성 메뉴 표시선과 로고 띠
    brandBar: "brand-heritage",
    tintBase: lightTint,
    // 마우스 올림 → 누름 → 선택이 한 단계씩 진해집니다. 비활성 면은 누름과 같은 투명도입니다
    tint: {
      border: 0.13,
      "border-strong": 0.26,
      "border-input": 0.5,
      "bg-hover": 0.05,
      "bg-press": 0.09,
      "bg-selected": 0.13,
      "bg-disabled": 0.09,
    },
    softAlpha: 0.12,
    shadow: {
      "shadow-float": `0 4px 16px ${alpha(lightTint, 0.1).css}`,
      "shadow-dialog": `0 12px 32px ${alpha(lightTint, 0.16).css}`,
      scrim: alpha(lightTint, 0.32).css,
    },
  },
  dark: {
    color: {
      // 면 나눔: 메뉴 0.14 < 본문 바탕 0.165 < 패널 0.205. 메뉴만 라이트처럼 한 단계(ΔL 0.025) 어둡게 두고,
      // 본문 바탕과 패널은 ΔL 0.04를 지킵니다. 다크의 bg-sunken은 패널보다 밝은 단계입니다
      "bg-app": oklch(0.165, N.dark.C, N.dark.h),
      "bg-surface": oklch(0.205, N.dark.C, N.dark.h),
      "bg-sunken": oklch(0.245, N.dark.C, N.dark.h),
      "bg-nav": oklch(0.14, N.dark.C, N.dark.h),
      "bg-raised": oklch(0.29, N.dark.C, N.dark.h),
      // 0.615에서 올렸습니다. 0.615는 떠 있는 면 위에서 3.8:1, bg-sunken 위에서 4.4:1로 WCAG 4.5:1에 못 미쳤습니다
      "text-subtle": oklch(0.66, N.dark.C, N.dark.h),
      "text-disabled": oklch(0.52, N.dark.C, N.dark.h),
      "text-muted": oklch(0.75, N.dark.C, N.dark.h),
      text: oklch(0.915, 0.004, N.dark.h),
      // 다크의 주요 버튼은 밝은 면이라 한 단계씩 어두워집니다
      "primary-hover": oklch(0.85, 0.004, N.dark.h),
      "primary-press": oklch(0.79, 0.004, N.dark.h),
      positive: oklch(0.76, 0.13, 150),
      negative: oklch(0.75, 0.15, 25),
      warning: oklch(0.79, 0.12, 80),
      agent: oklch(0.76, 0.12, 295),
      "brand-heritage": fixed("#A50034", "LG Heritage Red"),
      "brand-active": fixed("#FD312E", "LG Active Red"),
    },
    // 떠 있는 면: 다크는 그림자가 보이지 않아 한 단계 밝은 면. 가장 밝은 바탕인 bg-sunken(L 0.245)보다 밝아야
    // 그리드 머리글이나 읽기 전용 칸 위에서 열린 드롭다운이 묻히지 않습니다
    raised: "bg-raised",
    // Heritage Red는 다크 패널 위에서 2.3:1이라 Active Red를 씁니다
    brandBar: "brand-active",
    tintBase: fixed("#FFFFFF", "rgb(255 255 255)"),
    tint: {
      border: 0.08,
      "border-strong": 0.16,
      "border-input": 0.36,
      "bg-hover": 0.04,
      "bg-press": 0.07,
      "bg-selected": 0.1,
      "bg-disabled": 0.07,
    },
    softAlpha: 0.14,
    shadow: {
      "shadow-float": "none",
      "shadow-dialog": "none",
      scrim: "rgb(0 0 0 / 0.5)",
    },
  },
};
const semantic = ["positive", "negative", "warning", "agent"];

function themeLines(t) {
  const lines = [];
  for (const [k, c] of Object.entries(t.color)) lines.push(`--${k}: ${c.hex}; /* ${c.note} */`);
  if (t.raised !== "bg-raised") lines.push(`--bg-raised: var(--${t.raised});`);
  lines.push(
    "--primary: var(--text); /* 주요 버튼 면 */",
    "--on-primary: var(--bg-surface); /* 주요 버튼 글자 */",
    `--brand-bar: var(--${t.brandBar}); /* 로고 띠, 활성 메뉴 표시선 */`,
  );
  for (const [k, a] of Object.entries(t.tint)) lines.push(`--${k}: ${alpha(t.tintBase, a).css};`);
  for (const k of semantic) lines.push(`--${k}-soft: ${alpha(t.color[k], t.softAlpha).css};`);
  lines.push("--bg-warning: var(--warning-soft); /* 서버 목업 이름 */");
  for (const [k, v] of Object.entries(t.shadow)) lines.push(`--${k}: ${v};`);
  return lines;
}

// ---------- 색이 아닌 값 (두 테마 공통) ----------
const scales = `
  /* 글꼴 (design-guide.md '서체') */
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --font-mono: D2Coding, Consolas, "Malgun Gothic", monospace;
  --font-brand: "LG EI Text", "Pretendard Variable", Pretendard, "Malgun Gothic", sans-serif;
  /* 영문과 숫자가 섞인 코드 칸에만: 빗금 0. 숫자 칸은 font-variant-numeric: tabular-nums만 */
  --code-features: "zero" 1;

  --weight-regular: 400; --weight-medium: 500; --weight-semibold: 600; --weight-bold: 700;
  --leading-xs: 1.4; --leading-sm: 1.5; --leading-md: 1.6; --leading-lg: 1.4; --leading-xl: 1.3; --leading-2xl: 1.3;

  /* 크기 조정 단계: 모니터 보정 +1, 글자 크기 '크게' +2, 둘 다 +3 */
  --size-step: 0;

  /* 간격: 기본 단계 (4px 단위). 화면과 컴포넌트는 아래 쓰임 토큰을 씁니다 */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --gap-inline: var(--space-1);   /* 아이콘과 글자 */
  --gap-label: var(--space-1);    /* 라벨과 입력창 */
  --pad-input-x: var(--space-2);  /* 입력창 안 좌우 */
  --pad-cell-x: var(--space-2);   /* 그리드 셀 안 좌우 */
  --pad-button-x: var(--space-3); /* 버튼 안 좌우 */
  --pad-button-x-sm: var(--space-2); /* 작은 버튼 안 좌우 */
  --gap-buttons: var(--space-2);  /* 같은 묶음의 버튼 사이 */
  --gap-field-x: var(--space-3);  /* 조회 조건과 폼의 칸 사이 (가로) */
  --gap-field-y: var(--space-2);  /* 조회 조건과 폼의 칸 사이 (세로) */
  --pad-panel: var(--space-3);    /* 작업 패널 안: 조회 조건, 툴바, 상세 폼 */
  --pad-float: var(--space-4);    /* 떠 있는 상자 안: 다이얼로그, 토스트 */
  --gap-panel: var(--space-3);    /* 패널 사이 */
  --page-gutter: var(--space-4);  /* 화면 가장자리 */
  --pad-empty: var(--space-6);    /* 빈 상태 안 */

  /* 모서리: 배지·체크박스 3, 한 줄짜리 컨트롤과 막대 4, 여러 요소를 담는 상자 6. 알약형 없음 */
  --radius-sm: 3px; --radius-md: 4px; --radius-lg: 6px;

  /* 테두리 굵기: 구조 1px, 상태(포커스, 열린 칸, 현재 위치 막대) 2px */
  --border-width: 1px; --border-width-state: 2px;
  /* 포커스: 버튼·탭·링크는 바깥 2px, 그리드 셀과 입력 칸은 안쪽. 색은 본문색. box-shadow를 쓰지 않습니다 */
  --focus-width: 2px; --focus-offset: 2px; --focus-offset-inset: -1px;

  /* 아이콘: 그림이 그려진 크기(12, 16, 24)에 맞춥니다. 글자 크기 '크게'에서만 한 단계 큰 그림(16, 20, 28)으로 건너뜁니다 */
  --icon-size-sm: 12px; --icon-size-md: 16px; --icon-size-lg: 24px;

  /* 화면 골격: 사이드 메뉴, 에이전트 도킹 패널, 상세 폼의 최대 폭. 구간(1440, 1024, 900, 640, 높이 560)은 컨테이너 쿼리에 숫자로 씁니다 */
  --nav-width: 232px; --dock-width: 360px; --form-max-width: 960px;

  /* 컴포넌트 치수: 컴포넌트 CSS에 px를 쓰지 않도록 여기에 둡니다 */
  --tooltip-max-width: 320px; --list-max-width: 360px;
  --query-field-min-width: 150px; --query-field-max-width: 220px; /* 조회 조건 칸 폭: 내용에 맞춰 이 사이 */
  --form-column-min-width: 180px; /* 상세 폼의 열 */
  --toast-width: 360px; --dialog-max-width: 560px;

  /* 모션: 화면이 바뀐 것을 알릴 때만. 상태 색 80ms, 떠 있는 것의 페이드 150ms, 서랍과 들어오는 패널 200ms */
  --duration-fast: 80ms; --duration-normal: 150ms; --duration-slow: 200ms;
  --duration-spin: 800ms; /* 스피너 한 바퀴 */
  --ease-out: cubic-bezier(0.2, 0, 0, 1); /* 나타날 때, 상태 색 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);  /* 사라질 때 */

  /* 층 순서 */
  /* 드롭다운은 다이얼로그 안에서도 열리므로 다이얼로그 위, 툴팁은 토스트 안의 버튼에도 뜨므로 맨 위입니다 */
  --z-sticky: 10; --z-dock: 20; --z-dialog: 30; --z-popover: 40; --z-toast: 50; --z-tooltip: 60;
`;
// 크기 조정에 따라 바뀌는 값: [토큰, 기준 px, 단계마다 더하는 px]
const sized = [
  ["text-xs", 12, 1],
  ["text-sm", 13, 1],
  ["text-md", 14, 1],
  ["text-lg", 16, 1],
  ["text-xl", 20, 1],
  ["text-2xl", 24, 1],
  ["row-height", 28, 2],
  ["control-height", 32, 2],
  ["badge-height", 20, 2],
  ["check-size", 16, 1],
];
const sizedLines = [
  ...sized.map(([k, base, per]) => `--${k}: calc(${base}px + var(--size-step) * ${per}px);`),
  "--control-height-sm: var(--row-height); /* 작은 컨트롤: 행 높이 상자 안에서만 */",
  "--button-min-width: calc(var(--control-height) * 2); /* 주요·보조 글자 버튼의 최소 폭 */",
];

// ---------- CSS ----------
const indent = (lines, pad) => lines.map((l) => pad + l).join("\n");
const css = `/* scripts/build-tokens.mjs가 만듭니다. 손으로 고치지 않습니다. 실행: npm run tokens */
/* 규칙: docs/design-guide.md. 대비 검사 결과: tokens-report.md */

:root {${scales}}

/* 모니터 보정은 앱이 data-screen을, 글자 크기 설정은 data-text-size를 <html>에 붙입니다 */
:root[data-screen="wide"] { --size-step: 1; }
:root[data-text-size="large"] { --size-step: 2; --icon-size-sm: 16px; --icon-size-md: 20px; --icon-size-lg: 28px; }
:root[data-screen="wide"][data-text-size="large"] { --size-step: 3; }

/* 글자, 행, 컨트롤, 배지 크기. 간격은 바뀌지 않습니다 */
:root {
${indent(sizedLines, "  ")}
}

/* 라이트: 기본이고, OS가 라이트일 때 */
:root,
:root[data-theme="light"] {
  color-scheme: light;
${indent(themeLines(themes.light), "  ")}
}

/* 다크: OS를 따르되 data-theme="light"면 라이트, data-theme="dark"면 항상 다크 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${indent(themeLines(themes.dark), "    ")}
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
${indent(themeLines(themes.dark), "  ")}
}
`;

// ---------- 대비 검사 ----------
// 기준: 글자 WCAG 1.4.3(4.5:1), 글자가 아닌 표시 1.4.11(3:1). 본문과 보조 글자는 더 높게 둡니다.
const f1 = (x) => x.toFixed(1);
let failures = 0;
const mark = (ok) => {
  if (!ok) failures++;
  return ok ? "✓" : "✗";
};
let md = `# 디자인 토큰 대비 검사

\`scripts/build-tokens.mjs\`(\`npm run tokens\`)가 만듭니다. 손으로 고치지 않습니다. 규칙은 \`docs/design-guide.md\`에 있습니다.
값은 WCAG 대비 비율입니다. 투명도 색은 그 바탕 위에 얹은 결과로 잽니다.

`;
for (const [name, t] of Object.entries(themes)) {
  const c = t.color;
  const raised = c[t.raised];
  const bgs = {
    "bg-nav": c["bg-nav"],
    "bg-app": c["bg-app"],
    "bg-surface": c["bg-surface"],
    "bg-sunken": c["bg-sunken"],
    "bg-raised": raised,
  };
  const lin = (k) => c[k].lin;
  md += `## ${name === "light" ? "라이트" : "다크"}\n\n`;

  md += "### 색 값\n\n| 토큰 | hex | 정한 값 |\n| --- | --- | --- |\n";
  for (const [k, v] of Object.entries(c)) md += `| \`${k}\` | \`${v.hex}\` | ${v.note} |\n`;

  md +=
    "\n### 글자\n\n모든 글자는 다섯 바탕 위에서 4.5 이상입니다(WCAG 1.4.3). 본문과 보조 글자는 오래 읽는 메뉴, 본문 바탕, 패널 위에서 더 높게 둡니다(본문 ≥ 12, 보조 ≥ 7).\n\n| 글자 \\ 바탕 | bg-nav | bg-app | bg-surface | bg-sunken | bg-raised |\n| --- | --- | --- | --- | --- | --- |\n";
  const readTargets = { text: 12, "text-muted": 7, "text-subtle": 4.5 };
  for (const [k, target] of Object.entries(readTargets)) {
    md += `| \`${k}\` |`;
    for (const [bgName, bg] of Object.entries(bgs)) {
      const r = contrast(lin(k), bg.lin);
      const t2 = ["bg-nav", "bg-app", "bg-surface"].includes(bgName) ? target : 4.5;
      md += ` ${f1(r)} ${mark(r >= t2)} |`;
    }
    md += "\n";
  }
  md +=
    "\n비활성 글자는 안내 글자보다 흐리고, 메뉴·본문 바탕·패널·bg-sunken 위에서 2.5 이상입니다(WCAG 예외, 무엇인지는 읽혀야 합니다).\n\n| 글자 \\ 바탕 | bg-nav | bg-app | bg-surface | bg-sunken |\n| --- | --- | --- | --- | --- |\n| `text-disabled` |";
  for (const bg of ["bg-nav", "bg-app", "bg-surface", "bg-sunken"]) {
    const r = contrast(lin("text-disabled"), lin(bg));
    const dimmer = r < contrast(lin("text-subtle"), lin(bg));
    md += ` ${f1(r)} ${mark(r >= 2.5 && dimmer)} |`;
  }
  md += "\n";

  md +=
    "\n### 의미색 글자 (패널, bg-sunken, 자기 옅은 면 위 ≥ 4.5)\n\n| 의미색 | bg-surface | bg-sunken | -soft (패널 위) |\n| --- | --- | --- | --- |\n";
  for (const k of semantic) {
    const onSurface = contrast(lin(k), lin("bg-surface"));
    const onSunken = contrast(lin(k), lin("bg-sunken"));
    const soft = over(c[k], t.softAlpha, c["bg-surface"]);
    const onSoft = contrast(lin(k), soft);
    md += `| \`${k}\` | ${f1(onSurface)} ${mark(onSurface >= 4.5)} | ${f1(onSunken)} ${mark(onSunken >= 4.5)} | ${f1(onSoft)} ${mark(onSoft >= 4.5)} |\n`;
  }

  md += "\n### 주요 버튼 글자 (기본, 마우스 올림, 누름 모두 ≥ 4.5)\n\n| 면 | on-primary |\n| --- | --- |\n";
  for (const face of ["text", "primary-hover", "primary-press"]) {
    const r = contrast(lin("bg-surface"), lin(face));
    md += `| \`${face === "text" ? "primary" : face}\` | ${f1(r)} ${mark(r >= 4.5)} |\n`;
  }

  md +=
    "\n### 상태 단계 (바탕 위에 얹은 결과의 OKLCH 명도 차이 ΔL)\n\n마우스 올림 < 누름 < 선택이고, 이웃 단계와 0.015 이상 차이 납니다.\n\n| 바탕 | bg-hover | bg-press | bg-selected |\n| --- | --- | --- | --- |\n";
  for (const bg of ["bg-nav", "bg-app", "bg-surface", "bg-sunken"]) {
    const base = oklchL(lin(bg));
    const d = ["bg-hover", "bg-press", "bg-selected"].map((k) =>
      Math.abs(oklchL(over(t.tintBase, t.tint[k], c[bg])) - base),
    );
    const ok = d[1] - d[0] >= 0.015 && d[2] - d[1] >= 0.015;
    md += `| \`${bg}\` | ${d[0].toFixed(3)} | ${d[1].toFixed(3)} | ${d[2].toFixed(3)} ${mark(ok)} |\n`;
  }

  md +=
    "\n### 글자가 아닌 표시 (≥ 3, WCAG 1.4.11)\n\n| 표시 | bg-nav | bg-app | bg-surface | bg-sunken |\n| --- | --- | --- | --- | --- |\n";
  const nonText = [
    ["border-input (입력 칸 테두리)", (bg) => over(t.tintBase, t.tint["border-input"], bg)],
    ["brand-bar (활성 메뉴 표시선)", () => lin(t.brandBar)],
  ];
  for (const [label, fg] of nonText) {
    md += `| ${label} |`;
    for (const bg of ["bg-nav", "bg-app", "bg-surface", "bg-sunken"]) {
      const r = contrast(fg(c[bg]), lin(bg));
      md += ` ${f1(r)} ${mark(r >= 3)} |`;
    }
    md += "\n";
  }

  md +=
    "\n### 참고: 구분선과 면 (기준 없음)\n\n| 표시 | bg-nav | bg-app | bg-surface | bg-sunken |\n| --- | --- | --- | --- | --- |\n";
  for (const k of ["border", "border-strong", "bg-hover", "bg-selected"]) {
    md += `| \`${k}\` (α ${t.tint[k]}) |`;
    for (const bg of ["bg-nav", "bg-app", "bg-surface", "bg-sunken"])
      md += ` ${f1(contrast(over(t.tintBase, t.tint[k], c[bg]), lin(bg)))} |`;
    md += "\n";
  }
  md += "\n";
}

// ---------- 쓰기 ----------
const check = process.argv.includes("--check");
if (check) {
  let current = "";
  try {
    current = readFileSync(out.css, "utf-8");
  } catch {
    // 파일이 없으면 다르다고 봅니다
  }
  if (current !== css) {
    console.error("tokens.css가 scripts/build-tokens.mjs와 다릅니다. npm run tokens를 실행하세요.");
    process.exitCode = 1;
  }
} else {
  writeFileSync(out.css, css, "utf-8");
  writeFileSync(out.report, md, "utf-8");
  console.log(`wrote ${out.css}\nwrote ${out.report}`);
}
if (failures) {
  console.error(`✗ 대비 기준 ${failures}곳 미달 (tokens-report.md)`);
  process.exitCode = 1;
} else if (!check) {
  console.log("대비 기준 모두 통과");
}
