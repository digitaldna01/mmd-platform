import { describe, expect, it } from "vitest";

// 화면 코드가 공통 컴포넌트를 거치는지 검사합니다. 규칙: frontend/README.md '규칙', docs/adr/0007-headless-ui-library.md
const sources = import.meta.glob<string>(["/src/**/*.{ts,tsx}", "!/src/api/generated/**"], {
  query: "?raw",
  import: "default",
  eager: true,
});

const files = Object.entries(sources).map(([path, text]) => ({ path: path.replace(/^\/src\//, ""), text }));

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
});
