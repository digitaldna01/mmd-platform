import type { FormEvent, ReactNode } from "react";
import { Button } from "./Button";
import styles from "./QueryBar.module.css";

export interface QueryBarProps {
  /** 조회. 칸에서 Enter를 눌러도 불립니다 */
  onSearch: () => void;
  /** 초기화. 주면 '초기화' 버튼이 생깁니다 */
  onReset?: () => void;
  /** 조회 중. 조회 버튼이 처리 중이 됩니다 */
  busy?: boolean;
  /** 조회 조건 칸: TextInput, Select, YesNoField. 꼭 필요한 조건만 두고, 덜 쓰는 조건은 그리드의 열 필터로 옮깁니다 */
  children: ReactNode;
}

/**
 * 조회 조건: 화면 머리 아래에 늘 펼쳐 둡니다(접지 않음). 무엇으로 조회한 결과인지 늘 보이게 하기 위해서입니다.
 * 칸은 150~220px, 조회(주요)와 초기화(보조)는 마지막 칸 바로 뒤에 놓입니다. 본문이 640px 미만이면 칸이 한 줄에 하나씩 놓입니다.
 * 규칙: docs/design-guide.md '조회 조건'
 *
 * @example
 * <QueryBar onSearch={search} onReset={reset} busy={query.isFetching}>
 *   <Select label="공장" required items={plants} value={plant} onChange={setPlant} error={plantError} />
 *   <Select label="공정" emptyLabel="전체" items={processes} value={process} onChange={setProcess} />
 *   <TextInput label="LOT 번호" code value={lot} onChange={setLot} />
 * </QueryBar>
 */
export function QueryBar({ onSearch, onReset, busy = false, children }: QueryBarProps) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!busy) onSearch();
  };
  return (
    <form className={styles.query} onSubmit={submit} aria-label="조회 조건" noValidate>
      {children}
      <div className={styles.buttons}>
        <Button variant="primary" icon="search" type="submit" busy={busy}>
          조회
        </Button>
        {onReset && (
          <Button icon="reset" onClick={onReset}>
            초기화
          </Button>
        )}
      </div>
    </form>
  );
}
