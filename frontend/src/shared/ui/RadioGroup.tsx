import { Radio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import styles from "./choice.module.css";
import field from "./field.module.css";
import { cx, FieldLabel, FieldMessages, useDisabledReason } from "./FieldParts";

export interface RadioOption {
  value: string;
  label: string;
  /** 선택지 아래 설명. 라디오를 쓰는 이유이므로 되도록 씁니다 */
  description?: string;
}

export interface RadioGroupProps {
  /** 묶음 위 라벨 */
  label: string;
  options: readonly RadioOption[];
  /** 고른 값. 고르지 않았으면 null */
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  /** 비활성 이유. 값이 있으면 비활성이 되고, 마우스를 올리면 툴팁으로 이유를 보입니다 */
  disabledReason?: string;
}

/**
 * 라디오 묶음. 선택지마다 설명이 필요할 때만 씁니다(주로 확인 창과 설정 화면). 세로로 쌓습니다.
 * 짧은 2~4개는 SegmentedControl, 5개 이상은 Select를 씁니다. 조회 조건과 그리드에는 쓰지 않습니다.
 * 규칙: docs/design-guide.md '체크박스와 라디오'
 *
 * @example
 * <RadioGroup label="내려받을 열" value={columns} onChange={setColumns} options={[
 *   { value: "visible", label: "보이는 열", description: "화면에서 숨긴 열은 빼고, 지금 순서대로 내려받습니다." },
 *   { value: "all", label: "모든 열", description: "숨긴 열과 코드 열까지 모두 내려받습니다." },
 * ]} />
 */
export function RadioGroup({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
  disabledReason,
}: RadioGroupProps) {
  const reason = useDisabledReason(disabledReason);
  return (
    <>
      <AriaRadioGroup
        className={field.field}
        orientation="vertical"
        value={value}
        onChange={onChange}
        isRequired={required}
        isInvalid={error !== undefined}
        isDisabled={disabledReason !== undefined}
        validationBehavior="aria"
        {...reason.pointerProps}
      >
        <FieldLabel label={label} required={required} />
        <div className={styles.group}>
          {options.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              className={cx(styles.choice, styles.radio, option.description !== undefined && styles.withDescription)}
            >
              {({ isSelected }) => (
                <>
                  <span className={styles.box}>
                    {isSelected && (
                      <svg className={styles.mark} viewBox="0 0 16 16" aria-hidden="true">
                        <circle cx="8" cy="8" r="3" />
                      </svg>
                    )}
                  </span>
                  <span>
                    {option.label}
                    {option.description && <span className={styles.description}>{option.description}</span>}
                  </span>
                </>
              )}
            </Radio>
          ))}
        </div>
        <FieldMessages error={error} disabledReason={disabledReason} />
      </AriaRadioGroup>
      {reason.tooltip}
    </>
  );
}
