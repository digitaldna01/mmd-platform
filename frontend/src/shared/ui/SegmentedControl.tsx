import { Radio, RadioGroup } from "react-aria-components";
import field from "./field.module.css";
import { cx, FieldLabel, FieldMessages, useDisabledReason } from "./FieldParts";
import styles from "./SegmentedControl.module.css";

export interface SegmentOption {
  value: string;
  /** 칸 글자. 짧게 씁니다(아래, 위, 필수공정) */
  label: string;
}

export interface SegmentedControlProps {
  /** 라벨. 칸 위에 보입니다 */
  label: string;
  /** 툴바처럼 라벨 자리가 없는 곳에서 라벨을 화면에서 숨깁니다(보조 기술에는 알림) */
  hideLabel?: boolean;
  /** 2~4개. 그보다 많으면 Select를 씁니다 */
  options: readonly SegmentOption[];
  /** 고른 값. 고르지 않았으면 null(새로 만드는 값에 기본값이 없을 때) */
  value: string | null;
  onChange: (value: string) => void;
  /** sm: 사이드 메뉴의 화면 설정처럼 좁은 곳 */
  size?: "md" | "sm";
  required?: boolean;
  error?: string;
  /** 비활성 이유. 값이 있으면 비활성이 되고, 마우스를 올리면 툴팁으로 이유를 보입니다 */
  disabledReason?: string;
}

/**
 * 세그먼트: 짧은 선택지 2~4개 중 하나를 고릅니다. 고른 칸은 주요 버튼 면이고, 모든 칸의 폭이 같습니다.
 * ←→로 옮겨 고릅니다. 저장하는 Y/N 값에는 이것을 감싼 YesNoField를 씁니다.
 * 규칙: docs/design-guide.md '세그먼트 버튼'
 *
 * @example
 * <SegmentedControl label="기준 행" hideLabel value={anchor} onChange={setAnchor}
 *   options={[{ value: "below", label: "아래" }, { value: "above", label: "위" }]} />
 */
export function SegmentedControl({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  size = "md",
  required = false,
  error,
  disabledReason,
}: SegmentedControlProps) {
  const reason = useDisabledReason(disabledReason);
  return (
    <>
      <RadioGroup
        className={cx(field.field, styles.root)}
        orientation="horizontal"
        value={value}
        onChange={onChange}
        isRequired={required}
        isInvalid={error !== undefined}
        isDisabled={disabledReason !== undefined}
        validationBehavior="aria"
        {...reason.pointerProps}
      >
        <FieldLabel label={label} required={required} hidden={hideLabel} />
        <div className={cx(styles.segment, size === "sm" && styles.sm)}>
          {options.map((option) => (
            <Radio key={option.value} value={option.value} className={styles.item}>
              {option.label}
            </Radio>
          ))}
        </div>
        <FieldMessages error={error} disabledReason={disabledReason} />
      </RadioGroup>
      {reason.tooltip}
    </>
  );
}
