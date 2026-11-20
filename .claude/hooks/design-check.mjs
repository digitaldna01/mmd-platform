// 디자인 시스템 자동 검사입니다. Claude Code 훅(.claude/settings.json)과 커밋 전 검사(.githooks/pre-commit)가 부릅니다.
// 규칙: docs/design-guide.md, 쓰는 법: docs/design-system-apply.md '자동 검사'
//
//   고치기 전 (PreToolUse)   생성 파일(tokens.css, tokens-report.md, icons.generated.ts)을 직접 고치지 못하게 막습니다.
//   고친 뒤   (PostToolUse)  고친 파일 하나를 검사합니다.
//                            CSS → stylelint, scripts/build-tokens.mjs → 토큰을 다시 만들며 대비·면 순서 검사,
//                            scripts/build-icons.mjs → 아이콘을 다시 만듦, 화면 코드 → 색 값·직접 쓴 컨트롤·React Aria import
//   끝내기 전 (Stop)         FE 파일이 바뀌었으면 전체 검사(tokens:check, icons:check, lint:css, 경계 테스트)
//   커밋 전   (--pre-commit) 올린(staged) FE 파일이 있으면 전체 검사
//
// 걸리면 이유를 stderr로 내고 종료 코드 2로 끝납니다. Claude Code는 이 이유를 Claude에게 돌려줘 고치게 합니다.
// 커밋 전 검사는 종료 코드 1로 커밋을 멈춥니다. Node 기본 모듈만 씁니다.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.env.CLAUDE_PROJECT_DIR ?? join(here, "../.."));
// FE 폴더: scripts/build-tokens.mjs가 있는 곳. 이 레포는 frontend/, 옮겨 간 레포는 루트일 수도 있습니다
const feDir = ["frontend", "."].map((d) => resolve(root, d)).find((d) => existsSync(join(d, "scripts/build-tokens.mjs")));
const isWindows = process.platform === "win32";

// 스크립트가 만드는 파일. FE 폴더 기준 경로
const GENERATED = {
  "src/shared/styles/tokens.css": "docs/design-guide.md와 scripts/build-tokens.mjs를 고친 뒤 npm run tokens",
  "tokens-report.md": "docs/design-guide.md와 scripts/build-tokens.mjs를 고친 뒤 npm run tokens",
  "src/shared/icons/icons.generated.ts": "scripts/build-icons.mjs의 목록과 디자인 가이드 '아이콘' 표를 고친 뒤 npm run icons",
};

// src/shared/ui/boundaries.test.ts와 같은 규칙입니다. 한쪽을 고치면 다른 쪽도 고칩니다
const COLOR_LITERAL =
  /(["'`(\s:])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/i;
const RAW_CONTROL = /<(button|input|select|textarea)[\s>]/;
const REACT_ARIA = /from\s+["']react-aria(-components)?["']/;

const MAX_LINES = 60;

function readInput() {
  try {
    const text = readFileSync(0, "utf-8");
    return text.trim() ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/** FE 폴더에서 명령을 실행합니다. npm, npx는 Windows에서 셸이 필요합니다 */
function run(command, args) {
  const env = { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" };
  const r = spawnSync(command, args, { cwd: feDir, encoding: "utf-8", shell: isWindows, env });
  // 터미널 색 코드를 지웁니다. Claude에게 돌려줄 글자만 남깁니다
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.replace(/\u001b\[[0-9;]*m/g, "").trim();
  return { ok: r.status === 0, out };
}

const tail = (text) => {
  const lines = text.split("\n");
  return lines.length > MAX_LINES ? ["…", ...lines.slice(-MAX_LINES)].join("\n") : text;
};

/** FE 폴더 기준 경로. FE 폴더 밖이면 null */
function feRelative(filePath, cwd) {
  if (!filePath) return null;
  const rel = relative(feDir, resolve(cwd ?? root, filePath)).split(sep).join("/");
  return rel.startsWith("..") ? null : rel;
}

function block(message) {
  process.stderr.write(`${message.trim()}\n`);
  process.exit(2);
}

// ---------- 고치기 전 ----------
function beforeEdit(rel) {
  const how = GENERATED[rel];
  if (how) block(`${rel}은(는) 스크립트가 만드는 파일이라 직접 고치지 않습니다. 값을 바꾸려면 ${how}를 실행합니다.`);
}

// ---------- 고친 뒤 ----------
function lineHits(text, pattern) {
  return text
    .split("\n")
    .map((line, i) => ({ line, no: i + 1 }))
    .filter(({ line }) => pattern.test(line))
    .map(({ line, no }) => `  ${no}: ${line.trim()}`);
}

function afterEdit(rel) {
  if (rel.startsWith("src/") && rel.endsWith(".css")) {
    const r = run("npx", ["--no-install", "stylelint", "--allow-empty-input", rel]);
    if (!r.ok)
      block(
        `CSS 검사에 걸렸습니다(${rel}). 색, 크기, 간격, 글꼴, 시간은 tokens.css의 변수만 씁니다. ` +
          `필요한 토큰이 없으면 검사를 끄지 말고 사용자에게 묻습니다(디자인 가이드 'CSS 검사').\n\n${tail(r.out)}`,
      );
    return;
  }

  if (rel === "scripts/build-tokens.mjs") {
    const r = run("node", ["scripts/build-tokens.mjs"]);
    if (!r.ok) {
      const report = join(feDir, "tokens-report.md");
      const misses = existsSync(report) ? readFileSync(report, "utf-8").split("\n").filter((l) => l.includes("✗")) : [];
      block(
        "토큰 검사에 걸렸습니다. 글자 대비(WCAG)나 면 순서(메뉴 < 본문 바탕 < 패널) 기준에 못 미치는 값이 있습니다. " +
          "기준을 낮추지 말고 값을 다시 정하거나 사용자에게 묻습니다. 자세한 표는 tokens-report.md에 있습니다.\n\n" +
          `${tail(r.out)}\n\n미달 항목:\n${misses.join("\n")}`,
      );
    }
    return;
  }

  if (rel === "scripts/build-icons.mjs") {
    const r = run("node", ["scripts/build-icons.mjs"]);
    if (!r.ok) block(`아이콘을 만들지 못했습니다.\n\n${tail(r.out)}`);
    return;
  }

  const isCode = /\.(ts|tsx)$/.test(rel) && rel.startsWith("src/");
  const skip =
    rel.startsWith("src/api/generated/") ||
    rel.startsWith("src/shared/styles/foundations/") ||
    /\.test\.tsx?$/.test(rel) ||
    rel in GENERATED;
  if (!isCode || skip) return;

  const file = join(feDir, rel);
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf-8");
  const inSharedUi = rel.startsWith("src/shared/ui/");
  const problems = [];

  const colors = lineHits(text, COLOR_LITERAL);
  if (colors.length)
    problems.push(`색 값을 직접 썼습니다. CSS 변수(var(--text), var(--bg-surface) 등)를 씁니다.\n${colors.join("\n")}`);
  if (rel.endsWith(".tsx") && !inSharedUi) {
    const controls = lineHits(text, RAW_CONTROL);
    if (controls.length)
      problems.push(
        `<button>, <input>, <select>, <textarea>를 직접 썼습니다. shared/ui의 Button, TextInput, Select 등을 씁니다.\n${controls.join("\n")}`,
      );
  }
  if (!inSharedUi) {
    const imports = lineHits(text, REACT_ARIA);
    if (imports.length)
      problems.push(
        `React Aria는 shared/ui 안에서만 가져옵니다. 필요한 컴포넌트가 없으면 shared/ui에 먼저 만듭니다.\n${imports.join("\n")}`,
      );
  }
  if (problems.length) block(`디자인 규칙에 걸렸습니다(${rel}). 규칙: frontend/README.md '규칙'\n\n${problems.join("\n\n")}`);
}

// ---------- 전체 검사 ----------
const FE_SOURCE = /\.(css|ts|tsx|mjs|json)$/;

function changedFeFiles(args) {
  const r = spawnSync("git", [...args, "--", relative(root, feDir) || "."], { cwd: root, encoding: "utf-8" });
  if (r.status !== 0) return [];
  return r.stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && FE_SOURCE.test(l));
}

function fullCheck() {
  const checks = [
    ["토큰 (대비·면 순서, tokens.css가 스크립트와 같은지)", "npm", ["run", "--silent", "tokens:check"]],
    ["아이콘 (icons.generated.ts가 스크립트와 같은지)", "npm", ["run", "--silent", "icons:check"]],
    ["CSS 검사", "npm", ["run", "--silent", "lint:css"]],
  ];
  if (existsSync(join(feDir, "src/shared/ui/boundaries.test.ts")))
    checks.push([
      "경계 테스트 (색 값, 직접 쓴 컨트롤, React Aria)",
      "npm",
      ["test", "--silent", "--", "src/shared/ui/boundaries.test.ts"],
    ]);
  const failed = [];
  for (const [label, command, args] of checks) {
    const r = run(command, args);
    if (!r.ok) failed.push(`■ ${label}\n${tail(r.out)}`);
  }
  return failed;
}

// ---------- 시작 ----------
if (!feDir) process.exit(0);

if (process.argv.includes("--pre-commit")) {
  if (changedFeFiles(["diff", "--cached", "--name-only"]).length === 0) process.exit(0);
  const failed = fullCheck();
  if (failed.length) {
    process.stderr.write(`커밋 전 디자인 검사에 걸렸습니다. 고친 뒤 다시 커밋합니다.\n\n${failed.join("\n\n")}\n`);
    process.exit(1);
  }
  process.exit(0);
}

const input = readInput();
const event = input.hook_event_name;

if (event === "PreToolUse" || event === "PostToolUse") {
  const rel = feRelative(input.tool_input?.file_path ?? input.tool_input?.notebook_path, input.cwd);
  if (!rel) process.exit(0);
  if (event === "PreToolUse") beforeEdit(rel);
  else afterEdit(rel);
  process.exit(0);
}

if (event === "Stop" || event === "SubagentStop") {
  if (changedFeFiles(["status", "--porcelain"]).length === 0) process.exit(0);
  const failed = fullCheck();
  if (failed.length === 0) process.exit(0);
  // 한 번 되돌려 보냈는데도 걸리면 더 막지 않고 사용자에게 알립니다(끝없이 반복하지 않게)
  if (input.stop_hook_active) {
    process.stdout.write(
      JSON.stringify({ systemMessage: `디자인 검사가 아직 실패합니다. 확인이 필요합니다.\n\n${failed.join("\n\n")}` }),
    );
    process.exit(0);
  }
  block(
    `끝내기 전 디자인 검사에 걸렸습니다. 아래를 고친 뒤 끝냅니다. 검사를 끄거나 기준을 낮추지 않습니다.\n\n${failed.join("\n\n")}`,
  );
}

process.exit(0);
