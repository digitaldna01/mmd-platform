// 화면에 날짜, 시각, 숫자, 빈 값을 쓰는 함수입니다. 규칙: docs/design-guide.md '표기와 문구'
// 화면에서 날짜와 숫자를 직접 문자열로 만들지 않고 이 함수만 씁니다.

/** 값이 없을 때(null, undefined, 빈 문자열) 쓰는 표시. 안내 글자색으로 보입니다 */
export const EMPTY = "–";

type Maybe<T> = T | null | undefined;
type DateInput = Maybe<Date | string>;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const pad = (n: number) => String(n).padStart(2, "0");

/** 시각은 브라우저의 시간대로 보입니다. 시간대 규칙은 회사에서 확인한 뒤 정합니다(디자인 가이드 '날짜와 시각'). */
function toDate(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isEmpty(value: unknown): value is null | undefined | "" {
  return value === null || value === undefined || value === "";
}

function datePart(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 2026-11-20 */
export function formatDate(value: DateInput): string {
  if (isEmpty(value)) return EMPTY;
  if (typeof value === "string" && DATE_ONLY.test(value)) return value;
  const date = toDate(value);
  return date ? datePart(date) : String(value);
}

/** 2026-11-20 09:12 (24시간제) */
export function formatDateTime(value: DateInput): string {
  if (isEmpty(value)) return EMPTY;
  const date = toDate(value);
  return date ? `${datePart(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}` : String(value);
}

/** 2026-11-20 09:12:05. 변경 이력, 메시지 이력, 로그처럼 1분 안의 순서가 중요한 곳에만 씁니다 */
export function formatDateTimeSeconds(value: DateInput): string {
  if (isEmpty(value)) return EMPTY;
  const date = toDate(value);
  return date
    ? `${datePart(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    : String(value);
}

/** 2026-11-01 ~ 2026-11-20. 앞뒤 모두 전체 날짜로 씁니다 */
export function formatDateRange(from: DateInput, to: DateInput): string {
  if (isEmpty(from) && isEmpty(to)) return EMPTY;
  return `${formatDate(from)} ~ ${formatDate(to)}`;
}

const numberFormats = new Map<number, Intl.NumberFormat>();

function numberFormat(fractionDigits: number): Intl.NumberFormat {
  let format = numberFormats.get(fractionDigits);
  if (!format) {
    format = new Intl.NumberFormat("ko-KR", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    numberFormats.set(fractionDigits, format);
  }
  return format;
}

/**
 * 수량과 값: 1,280 · 1,280.0 · -12.5. 소수 자릿수는 항목 정의를 따르고 끝의 0을 지우지 않습니다.
 * 코드, 번호, 연도에는 쓰지 않습니다(쉼표가 붙으면 안 됩니다).
 */
export function formatNumber(value: Maybe<number>, fractionDigits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return EMPTY;
  return numberFormat(fractionDigits).format(value);
}

/** 백분율 값(96.4)을 96.40%처럼 씁니다. 비율(0.964)이 아니라 백분율 값을 받습니다 */
export function formatPercent(value: Maybe<number>, fractionDigits = 0): string {
  const text = formatNumber(value, fractionDigits);
  return text === EMPTY ? EMPTY : `${text}%`;
}

/** 글자 값. 비어 있으면 EMPTY */
export function formatText(value: Maybe<string>): string {
  return isEmpty(value) ? EMPTY : value;
}
