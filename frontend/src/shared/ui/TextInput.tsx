import { Input, TextField } from "react-aria-components";
import styles from "./field.module.css";
import { cx, FieldLabel, FieldMessages } from "./FieldParts";

export interface TextInputProps {
  /** 칸 위 라벨. 명사로 끝내고 콜론을 쓰지 않습니다 (공장, 수정일) */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** 칸이 비었을 때 흐리게 보이는 글자 */
  placeholder?: string;
  /** 필수 칸. 라벨 뒤에 '*'가 붙습니다 */
  required?: boolean;
  /** 오류 문구. 값이 있으면 오류 상태가 되고 칸 아래에 보입니다 ('Route 이름을 입력하세요.') */
  error?: string;
  /** 읽기 전용(앞 탭에서 넘어온 값, 자동으로 채운 값) */
  readOnly?: boolean;
  /** 비활성 이유. 값이 있으면 비활성이 되고, 칸이 비었으면 이유를 자리 표시 글자로 보입니다 */
  disabledReason?: string;
  /** 코드 칸 (LOT, P/N). 0과 O를 구분하는 빗금 0을 켭니다 */
  code?: boolean;
  maxLength?: number;
  name?: string;
}

/**
 * 한 줄 입력창. 화면은 <input>을 직접 쓰지 않고 이 컴포넌트를 씁니다.
 * 조회 조건 안에서 Enter를 누르면 감싼 <form>이 제출됩니다.
 * 규칙: docs/design-guide.md '입력 칸 상태', '입력창과 선택 상자'
 *
 * @example
 * <TextInput label="LOT 번호" code value={lot} onChange={setLot} />
 * <TextInput label="Route 이름" required value={name} onChange={setName} error={nameError} />
 */
export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
  disabledReason,
  code = false,
  maxLength,
  name,
}: TextInputProps) {
  const disabled = disabledReason !== undefined;
  return (
    <TextField
      className={styles.field}
      value={value}
      onChange={onChange}
      isRequired={required}
      isInvalid={error !== undefined}
      isReadOnly={readOnly}
      isDisabled={disabled}
      validationBehavior="aria"
      maxLength={maxLength}
      name={name}
    >
      <FieldLabel label={label} required={required} />
      <Input
        className={cx(styles.control, code && styles.code)}
        placeholder={disabled && value === "" ? disabledReason : placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      <FieldMessages error={error} disabledReason={disabledReason} />
    </TextField>
  );
}
