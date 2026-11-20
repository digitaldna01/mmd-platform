import type { ReactNode } from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import styles from "./choice.module.css";
import { cx, useDisabledReason } from "./FieldParts";

interface CommonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 일부만 고름. 그리드·목록 머리글의 '전체 고르기'에만 씁니다 */
  indeterminate?: boolean;
  /** 비활성 이유. 값이 있으면 비활성이 되고, 마우스를 올리면 툴팁으로 이유를 보입니다 */
  disabledReason?: string;
  /** sm: 행 높이 상자 안(그리드, 목록) */
  size?: "md" | "sm";
}

interface WithTextProps extends CommonProps {
  /** 옆에 보이는 글자. 무엇을 켜는지 씁니다 ('숨긴 열도 내려받기') */
  children: ReactNode;
  label?: never;
}

interface BoxOnlyProps extends CommonProps {
  /** 글자 없이 상자만 둘 때의 이름(그리드의 행 고르기). 보조 기술에 쓰입니다 */
  label: string;
  children?: never;
}

export type CheckboxProps = WithTextProps | BoxOnlyProps;

/**
 * 체크박스. 저장하지 않는 옵션(내려받기 옵션, 화면 설정, 다시 묻지 않기)과 여러 개 고르기에만 씁니다.
 * DB에 저장하는 Y/N 값에는 쓰지 않고 YesNoField를 씁니다(고르지 않음과 N을 구분할 수 없어서).
 * 규칙: docs/design-guide.md 'Y/N 값', '체크박스와 라디오'
 *
 * @example
 * <Checkbox checked={includeHidden} onChange={setIncludeHidden}>숨긴 열도 내려받기</Checkbox>
 * <Checkbox size="sm" label="1010 고르기" checked={picked} onChange={setPicked} />
 */
export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabledReason,
  size = "md",
  label,
  children,
}: CheckboxProps) {
  const reason = useDisabledReason(disabledReason);
  return (
    <>
      <AriaCheckbox
        className={cx(styles.choice, size === "sm" && styles.sm)}
        isSelected={checked}
        onChange={onChange}
        isIndeterminate={indeterminate}
        isDisabled={disabledReason !== undefined}
        aria-label={label}
        aria-describedby={reason.describedBy}
        {...reason.pointerProps}
      >
        {({ isSelected, isIndeterminate }) => (
          <>
            <span className={styles.box}>
              {isIndeterminate ? (
                <svg className={styles.mark} viewBox="0 0 16 16" aria-hidden="true">
                  <line x1="4.5" y1="8" x2="11.5" y2="8" />
                </svg>
              ) : (
                isSelected && (
                  <svg className={styles.mark} viewBox="0 0 16 16" aria-hidden="true">
                    <polyline points="4 8.5 7 11.5 12.5 5" />
                  </svg>
                )
              )}
            </span>
            {children}
          </>
        )}
      </AriaCheckbox>
      {reason.hiddenText}
      {reason.tooltip}
    </>
  );
}
