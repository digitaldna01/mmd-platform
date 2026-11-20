import { EMPTY } from "../format/format";
import { ReadOnlyField } from "./FieldParts";
import { type SegmentOption, SegmentedControl } from "./SegmentedControl";

/** 저장하는 Y/N 값 */
export type YesNo = "Y" | "N";

const OPTIONS: readonly SegmentOption[] = [
  { value: "Y", label: "Y" },
  { value: "N", label: "N" },
];

export interface YesNoFieldProps {
  /** 칸 위 라벨 (사용여부, 필수공정여부) */
  label: string;
  /**
   * 고른 값. 새로 만들 때는 명세의 기본값이 있으면 그 값으로, 없으면 null로 시작합니다.
   * null이면 Y와 N 어느 쪽도 고르지 않은 상태입니다
   */
  value: YesNo | null;
  onChange: (value: YesNo) => void;
  /** 필수 칸. 비어 있으면 저장할 때 error로 '사용여부를 선택하세요.'를 줍니다 */
  required?: boolean;
  error?: string;
  /** 읽기 전용: Y, N 글자를 가라앉은 칸에 보입니다 */
  readOnly?: boolean;
  /** 비활성 이유. 값이 있으면 비활성이 되고, 마우스를 올리면 툴팁으로 이유를 보입니다 */
  disabledReason?: string;
}

/**
 * DB에 저장하는 Y/N 값(사용여부, 필수공정여부 등). 세그먼트 'Y | N'으로 고릅니다.
 * 체크박스를 쓰지 않는 이유: 고르지 않음과 N을 구분할 수 없어, 빠뜨린 값이 N으로 저장되고 필수 검사를 할 수 없습니다.
 * 규칙: docs/design-guide.md 'Y/N 값'
 *
 * @example
 * <YesNoField label="사용여부" required value={useYn} onChange={setUseYn} />
 * <YesNoField label="필수공정여부" required value={requiredYn} onChange={setRequiredYn}
 *   error={tried && requiredYn === null ? "필수공정여부를 선택하세요." : undefined} />
 */
export function YesNoField({
  label,
  value,
  onChange,
  required = false,
  error,
  readOnly = false,
  disabledReason,
}: YesNoFieldProps) {
  if (readOnly) {
    return (
      <ReadOnlyField label={label} required={required} narrow>
        {value ?? EMPTY}
      </ReadOnlyField>
    );
  }
  return (
    <SegmentedControl
      label={label}
      options={OPTIONS}
      value={value}
      onChange={(next) => onChange(next === "Y" ? "Y" : "N")}
      required={required}
      error={error}
      disabledReason={disabledReason}
    />
  );
}
