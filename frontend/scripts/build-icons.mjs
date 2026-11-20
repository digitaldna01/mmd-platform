// 화면에서 쓰는 아이콘의 원본 목록입니다. Fluent UI System Icons(Regular)에서 아래 아이콘만 골라 다음 파일을 만듭니다.
//   src/shared/icons/icons.generated.ts   손으로 고치지 않습니다
// 실행: npm run icons  /  검사만: npm run icons:check
// 규칙: docs/design-guide.md '아이콘'. 아이콘을 더할 때는 아래 목록과 디자인 가이드의 표를 함께 고칩니다.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "../node_modules/@fluentui/svg-icons/icons");
const out = join(here, "../src/shared/icons/icons.generated.ts");

// [MMD 이름, Fluent 이름, 쓰는 곳]. 한 개념에 한 아이콘만 둡니다.
const ICONS = [
  ["search", "search", "조회, 검색 칸"],
  ["reset", "arrow_counterclockwise", "초기화"],
  ["refresh", "arrow_clockwise", "새로 고침"],
  ["add", "add", "행 추가, 신규"],
  ["remove", "subtract", "행 삭제"],
  ["delete", "delete", "삭제(저장 전 되돌릴 수 없는 것)"],
  ["download", "arrow_download", "엑셀 내려받기"],
  ["upload", "arrow_upload", "파일 올리기"],
  ["copy", "copy", "복사"],
  ["edit", "edit", "수정"],
  ["save", "save", "저장(아이콘만 쓸 때)"],
  ["close", "dismiss", "닫기, 반려 배지"],
  ["check", "checkmark", "고른 값, 사용 배지"],
  ["chevron-down", "chevron_down", "선택 상자, 펼치기"],
  ["chevron-up", "chevron_up", "접기"],
  ["chevron-left", "chevron_left", "이전 쪽"],
  ["chevron-right", "chevron_right", "다음 쪽, 하위 메뉴"],
  ["more", "more_horizontal", "더 보기"],
  ["filter", "filter", "그리드 머리글 필터"],
  ["sort", "arrow_sort", "정렬할 수 있는 머리글"],
  ["arrow-up", "arrow_up", "오름차순"],
  ["arrow-down", "arrow_down", "내림차순"],
  ["arrow-left", "arrow_left", "이중 목록에서 빼기"],
  ["arrow-right", "arrow_right", "이중 목록에 추가"],
  ["calendar", "calendar_ltr", "날짜 칸"],
  ["clock", "clock", "승인 대기 배지, 시각"],
  ["history", "history", "변경 이력"],
  ["lock", "lock_closed", "권한 없음, 잠긴 값"],
  ["view", "eye", "메시지 보기"],
  ["send", "send", "보내기"],
  ["info", "info", "안내"],
  ["warning", "warning", "주의"],
  ["error", "dismiss_circle", "오류"],
  ["success", "checkmark_circle", "성공"],
  ["help", "question_circle", "도움말"],
  ["settings", "settings", "화면 설정"],
  ["menu", "navigation", "사이드 메뉴 열고 닫기"],
  ["user", "person", "사용자"],
  ["logout", "arrow_exit", "로그아웃"],
  ["theme-light", "weather_sunny", "라이트 테마"],
  ["theme-dark", "weather_moon", "다크 테마"],
  ["open-new", "open", "새 창으로 열기"],
  ["factory", "building_factory", "공장"],
];

// 그림 크기. 크기별로 따로 그려져 있어 그 크기에서 픽셀에 맞습니다. 없으면 가까운 크기를 줄이거나 키웁니다.
const SIZES = [12, 16, 20, 24, 28];
const FALLBACK = { 12: [12, 16], 16: [16, 20], 20: [20, 16, 24], 24: [24, 20, 28], 28: [28, 24, 20] };

if (!existsSync(source)) {
  console.error("@fluentui/svg-icons가 없습니다. npm ci를 먼저 실행하세요.");
  process.exit(1);
}

const notes = [];
function art(fluent, size) {
  for (const z of FALLBACK[size]) {
    const file = join(source, `${fluent}_${z}_regular.svg`);
    if (!existsSync(file)) continue;
    const svg = readFileSync(file, "utf-8");
    const paths = [...svg.matchAll(/<path d="([^"]+)"\/>/g)].map((m) => m[1]);
    const rest = svg.replace(/<svg[^>]*>|<\/svg>|<path d="[^"]+"\/>/g, "").trim();
    if (!paths.length || rest) throw new Error(`${fluent}_${z}: path만 있는 SVG가 아닙니다`);
    if (z !== size) notes.push(`${fluent} ${size}px → ${z}px 그림을 씁니다`);
    return [z, ...paths];
  }
  throw new Error(`${fluent}: ${size}px 근처 그림이 없습니다`);
}

const names = ICONS.map(([name]) => name);
if (new Set(names).size !== names.length) throw new Error("MMD 이름이 겹칩니다");
if (new Set(ICONS.map(([, f]) => f)).size !== ICONS.length) throw new Error("한 Fluent 아이콘을 두 이름에 썼습니다");

const lines = ICONS.map(([name, fluent]) => {
  const sizes = SIZES.map((z) => `    ${z}: ${JSON.stringify(art(fluent, z))},`).join("\n");
  return `  ${JSON.stringify(name)}: {\n${sizes}\n  },`;
});
const version = JSON.parse(readFileSync(join(source, "../package.json"), "utf-8")).version;

const ts = `/* scripts/build-icons.mjs가 만듭니다. 손으로 고치지 않습니다. 실행: npm run icons */
/*! Fluent UI System Icons ${version} (Regular) | MIT License | Copyright (c) Microsoft Corporation */

export const iconNames = [
${names.map((n) => `  ${JSON.stringify(n)},`).join("\n")}
] as const;

export type IconName = (typeof iconNames)[number];

/** 그림이 그려진 크기 */
export type IconArtSize = ${SIZES.join(" | ")};

/** [그림 격자 크기, path d...] */
export type IconArt = readonly [number, ...string[]];

/** 아이콘마다 쓰는 곳 (Storybook과 문서용) */
export const iconUses: Record<IconName, string> = {
${ICONS.map(([n, , use]) => `  ${JSON.stringify(n)}: ${JSON.stringify(use)},`).join("\n")}
};

/** 아이콘마다 Fluent 이름 */
export const iconSources: Record<IconName, string> = {
${ICONS.map(([n, f]) => `  ${JSON.stringify(n)}: ${JSON.stringify(f)},`).join("\n")}
};

export const iconArt: Record<IconName, Record<IconArtSize, IconArt>> = {
${lines.join("\n")}
};
`;

if (process.argv.includes("--check")) {
  const current = existsSync(out) ? readFileSync(out, "utf-8") : "";
  if (current !== ts) {
    console.error("icons.generated.ts가 scripts/build-icons.mjs와 다릅니다. npm run icons를 실행하세요.");
    process.exitCode = 1;
  }
} else {
  writeFileSync(out, ts, "utf-8");
  console.log(`wrote ${out} (${names.length}개)`);
  for (const n of notes) console.log(`  ${n}`);
}
