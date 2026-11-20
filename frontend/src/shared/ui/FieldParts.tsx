import { FieldError, Label, Text } from "react-aria-components";
import styles from "./field.module.css";

/** 칸 위 라벨. 필수면 뒤에 보조 글자색 '*'를 붙입니다(필수임은 칸의 aria-required가 알립니다) */
export function FieldLabel({ label, required }: { label: string; required: boolean }) {
  return (
    <Label className={styles.label}>
      {label}
      {required && (
        <span className={styles.required} aria-hidden="true">
          {" *"}
        </span>
      )}
    </Label>
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

export function cx(...names: Array<string | false | undefined>): string {
  return names.filter(Boolean).join(" ");
}
