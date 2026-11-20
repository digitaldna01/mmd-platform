import type { FormEvent, ReactNode } from "react";
import styles from "./DetailForm.module.css";
import { cx } from "./FieldParts";

export interface DetailFormProps {
  /** 머리 제목: 'Route 상세' */
  title: string;
  /** 대상 ID: 'RT-0102'. 제목 뒤에 가운데점으로 붙습니다 */
  targetId?: string;
  /** 저장. 저장 버튼(type="submit")을 누르거나 칸에서 Enter를 누르면 불립니다 */
  onSubmit: () => void;
  /** 아래 오른쪽 버튼: 취소(보조), 저장(주요, type="submit") 순서 */
  actions: ReactNode;
  /** 상세 폼만 있는 화면: 폼 폭을 --form-max-width(960px)까지로 둡니다 */
  standalone?: boolean;
  /** 칸: TextInput, Select, YesNoField. 긴 칸은 FormWide로 감쌉니다 */
  children: ReactNode;
}

/**
 * 상세 폼: 칸을 180px 이상의 열로 채우고, 라벨은 칸 위에 둡니다.
 * 규칙: docs/design-guide.md '상세 폼'
 *
 * @example
 * <DetailForm title="Route 상세" targetId="RT-0102" onSubmit={save}
 *   actions={<><Button onClick={cancel}>취소</Button><Button variant="primary" type="submit">저장</Button></>}>
 *   <TextInput label="Route 이름" required value={name} onChange={setName} error={nameError} />
 *   <YesNoField label="사용여부" required value={useYn} onChange={setUseYn} />
 *   <FormWide><TextInput label="설명" value={memo} onChange={setMemo} /></FormWide>
 * </DetailForm>
 */
export function DetailForm({ title, targetId, onSubmit, actions, standalone = false, children }: DetailFormProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };
  return (
    <form className={cx(styles.form, standalone && styles.standalone)} onSubmit={submit} noValidate aria-label={title}>
      <h2 className={styles.head}>
        {title}
        {/* 띄어쓰기를 span 밖에 두어야 보조 기술이 '제목 · ID'로 읽습니다 */}
        {targetId && " "}
        {targetId && <span className={styles.target}>· {targetId}</span>}
      </h2>
      <div className={styles.fields}>{children}</div>
      <div className={styles.actions}>{actions}</div>
    </form>
  );
}

/** 긴 칸(설명, 비고): 상세 폼에서 두 열을 차지합니다 */
export function FormWide({ children }: { children: ReactNode }) {
  return <div className={styles.wide}>{children}</div>;
}
