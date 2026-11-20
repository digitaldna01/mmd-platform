import { describe, expect, it } from "vitest";

// 화면 코드가 공통 컴포넌트를 거치는지 검사합니다. 규칙: frontend/README.md '규칙', docs/adr/0007-headless-ui-library.md
const sources = import.meta.glob<string>(["/src/**/*.{ts,tsx}", "!/src/api/generated/**"], {
  query: "?raw",
  import: "default",
  eager: true,
});

const files = Object.entries(sources).map(([path, text]) => ({ path: path.replace(/^\/src\//, ""), text }));

// 색 값: #fff, #A50034, rgb(), hsl(), oklch(), color-mix() 등. .claude/hooks/design-check.mjs와 같은 규칙입니다
const COLOR_LITERAL =
  /(["'`(\s:])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/i;

const inSharedUi = (path: string) => path.startsWith("shared/ui/");
const inFoundations = (path: string) => path.startsWith("shared/styles/foundations/");
const isTest = (path: string) => /\.test\.tsx?$/.test(path);

describe("공통 컴포넌트 경계", () => {
  it("소스 파일을 읽는다", () => {
    expect(files.some((f) => f.path === "shared/ui/Button.tsx")).toBe(true);
  });

  it("React Aria는 shared/ui 안에서만 가져온다", () => {
    const offenders = files
      .filter((f) => !inSharedUi(f.path))
      .filter((f) => /from\s+["']react-aria(-components)?["']/.test(f.text))
      .map((f) => f.path);
    expect(offenders, "shared/ui의 컴포넌트(TextInput, Select 등)를 쓰세요").toEqual([]);
  });

  it("화면은 <button>, <input>, <select>, <textarea>를 직접 쓰지 않는다", () => {
    const offenders = files
      .filter((f) => f.path.endsWith(".tsx") && !inSharedUi(f.path) && !inFoundations(f.path) && !isTest(f.path))
      .filter((f) => /<(button|input|select|textarea)[\s>]/.test(f.text))
      .map((f) => f.path);
    expect(offenders, "shared/ui의 Button, TextInput, Select를 쓰세요").toEqual([]);
  });

  it("코드에 색 값을 직접 쓰지 않는다", () => {
    // CSS의 색 값은 stylelint가 막습니다. 이 검사는 TS 코드(인라인 style, 상수)에 쓴 색 값을 막습니다
    const offenders = files
      .filter((f) => !inFoundations(f.path) && !isTest(f.path))
      .filter((f) => COLOR_LITERAL.test(f.text))
      .map((f) => f.path);
    expect(offenders, "색은 CSS 변수(var(--text) 등)로 씁니다. 디자인 가이드 '토큰 파일과 Storybook'").toEqual([]);
  });
});
