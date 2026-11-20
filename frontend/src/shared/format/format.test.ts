import { describe, expect, it } from "vitest";
import {
  EMPTY,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatDateTimeSeconds,
  formatNumber,
  formatPercent,
  formatText,
} from "./format";

const at = new Date(2026, 10, 5, 9, 2, 7);

describe("날짜와 시각", () => {
  it("하이픈과 두 자리 월·일로 쓴다", () => {
    expect(formatDate(at)).toBe("2026-11-05");
    expect(formatDateTime(at)).toBe("2026-11-05 09:02");
    expect(formatDateTimeSeconds(at)).toBe("2026-11-05 09:02:07");
  });

  it("오후도 24시간제로 쓴다", () => {
    expect(formatDateTime(new Date(2026, 10, 20, 16, 40))).toBe("2026-11-20 16:40");
  });

  it("날짜만 있는 문자열은 시간대 때문에 날짜가 바뀌지 않게 그대로 쓴다", () => {
    expect(formatDate("2026-11-20")).toBe("2026-11-20");
  });

  it("기간은 물결표 앞뒤에 한 칸을 둔다", () => {
    expect(formatDateRange("2026-11-01", "2026-11-20")).toBe("2026-11-01 ~ 2026-11-20");
    expect(formatDateRange(null, undefined)).toBe(EMPTY);
  });

  it("값이 없으면 빈 값 표시를 쓴다", () => {
    expect(formatDate(null)).toBe(EMPTY);
    expect(formatDateTime("")).toBe(EMPTY);
  });
});

describe("숫자", () => {
  it("천 단위 쉼표를 넣고 소수 자릿수를 지킨다", () => {
    expect(formatNumber(1280)).toBe("1,280");
    expect(formatNumber(1280, 1)).toBe("1,280.0");
    expect(formatNumber(96.4, 2)).toBe("96.40");
    expect(formatNumber(12345678)).toBe("12,345,678");
  });

  it("음수는 앞에 빼기 표시를 붙인다", () => {
    expect(formatNumber(-12.5, 1)).toBe("-12.5");
  });

  it("0은 0이고, 값이 없을 때만 빈 값 표시를 쓴다", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(null)).toBe(EMPTY);
    expect(formatNumber(Number.NaN)).toBe(EMPTY);
  });

  it("백분율은 숫자에 붙여 쓴다", () => {
    expect(formatPercent(96.4, 2)).toBe("96.40%");
    expect(formatPercent(undefined)).toBe(EMPTY);
  });
});

describe("글자", () => {
  it("비어 있으면 빈 값 표시를 쓴다", () => {
    expect(formatText("")).toBe(EMPTY);
    expect(formatText("설비 교체 후 재설정")).toBe("설비 교체 후 재설정");
  });
});
