import { type ReactNode, useId } from "react";
import { FieldError, Label, Text, VisuallyHidden } from "react-aria-components";
import styles from "./field.module.css";
import { useTooltip } from "./Tooltip";

interface FieldLabelProps {
  label: string;
  required: boolean;
  /** 툴바처럼 라벨 자리가 없는 곳: 화면에는 숨기고 보조 기술에만 알립니다 */
  hidden?: boolean;
}

/** 칸 위 라벨. 필수면 뒤에 보조 글자색 '*'를 붙입니다(필수임은 칸의 aria-required가 알립니다) */
export function FieldLabel({ label, required, hidden = false }: FieldLabelProps) {
  const node = (
    <Label className={styles.label}>
      {label}
      {required && <RequiredMark />}
    </Label>
  );
  return hidden ? <VisuallyHidden>{node}</VisuallyHidden> : node;
}

function RequiredMark() {
  return (
    <span className={styles.required} aria-hidden="true">
      {" *"}
    </span>
  );
}

/**
 * 칸 아래 문구. 오류는 negative 글자로 보이고, 비활성 이유는 보이지 않게 두고 보조 기술에만 알립니다.
 * React Aria가 칸의 aria-describedby로 잇습니다.
 */
export function FieldMessages({ error, disabledReason }: { error?: string; disabledReason?: string }) {
  return (
    <>
      <FieldError className={styles.error}>{error}</FieldError>
      {disabledReason !== undefined && (
        <Text slot="description" hidden>
          {disabledReason}
        </Text>
      )}
    </>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  required?: boolean;
  /** 칸 폭을 내용에 맞춥니다(Y/N 값처럼 짧은 값) */
  narrow?: boolean;
  children: ReactNode;
}

/** 읽기 전용 칸: 고칠 수 없는 값을 가라앉은 칸에 보입니다. 포커스와 복사는 됩니다 */
export function ReadOnlyField({ label, required = false, narrow = false, children }: ReadOnlyFieldProps) {
  const labelId = useId();
  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
        {required && <RequiredMark />}
      </span>
      <div
        className={cx(styles.control, styles.readOnly, narrow && styles.narrow)}
        role="textbox"
        aria-readonly="true"
        aria-labelledby={labelId}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 비활성 이유를 알리는 부품: 마우스를 올리면 툴팁으로, 보조 기술에는 설명(aria-describedby)으로.
 * 비활성 컨트롤은 포커스를 받지 않으므로 툴팁은 마우스로만 뜹니다.
 */
export function useDisabledReason(reason: string | undefined) {
  const id = useId();
  const { triggerProps, tooltip } = useTooltip(reason);
  if (reason === undefined) return { describedBy: undefined, pointerProps: {}, hiddenText: null, tooltip: null };
  return {
    /** 컨트롤의 aria-describedby에 줍니다(React Aria가 설명을 잇지 않는 컨트롤만) */
    describedBy: id,
    /** 컨트롤의 바깥 요소에 줍니다 */
    pointerProps: {
      onPointerEnter: triggerProps.onPointerEnter,
      onPointerLeave: triggerProps.onPointerLeave,
      onPointerDown: triggerProps.onPointerDown,
    },
    /** describedBy가 가리키는 숨은 글자 */
    hiddenText: (
      <span id={id} hidden>
        {reason}
      </span>
    ),
    tooltip,
  };
}

export function cx(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}
