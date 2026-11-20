import { type ReactNode, useCallback, useRef, useState } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { Button } from "./Button";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmOptions {
  /** 대상과 개수를 넣은 물음: '삭제 2건을 포함해 6건을 저장할까요?' */
  title: string;
  /** 결과. 되돌릴 수 있는지 씁니다: '삭제한 공정 정책은 되돌릴 수 없습니다.' */
  description?: string;
  /** 하는 일. '확인', '예' 대신 동사로 씁니다: '저장', '버리고 조회' */
  confirmLabel: string;
}

interface Request extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * 되돌릴 수 없는 일을 하기 전에 묻는 확인 창. 띄우는 때는 두 가지뿐입니다.
 * 삭제가 든 저장, 저장하지 않은 변경을 버릴 때(다시 조회, 탭 바꿈, 화면 닫기). 평소 저장에는 띄우지 않습니다.
 * 처음 포커스는 '취소'에 있어 Enter를 무심코 눌러도 진행되지 않습니다. Esc는 취소입니다.
 * 규칙: docs/design-guide.md '확인 창을 띄우는 때', '다이얼로그'
 *
 * @example
 * const { confirm, dialog } = useConfirm();
 * const save = async () => {
 *   if (deleted > 0 && !(await confirm({
 *     title: `삭제 ${deleted}건을 포함해 ${total}건을 저장할까요?`,
 *     description: "삭제한 공정 정책은 되돌릴 수 없습니다.",
 *     confirmLabel: "저장",
 *   }))) return;
 *   mutation.mutate(changes);
 * };
 * return <>{dialog}...</>;
 */
export function useConfirm(): { confirm: (options: ConfirmOptions) => Promise<boolean>; dialog: ReactNode } {
  const [request, setRequest] = useState<Request | null>(null);
  // 닫히는 페이드 동안에도 글이 남아 있도록 마지막 물음을 기억합니다
  const shown = useRef<ConfirmOptions | null>(null);
  if (request) shown.current = request;

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setRequest({ ...options, resolve });
      }),
    [],
  );

  const finish = (confirmed: boolean) => {
    request?.resolve(confirmed);
    setRequest(null);
  };

  const options = shown.current;
  const dialog = (
    <ModalOverlay
      className={styles.overlay}
      isOpen={request !== null}
      onOpenChange={(open) => {
        if (!open) finish(false);
      }}
      isDismissable={false}
    >
      <Modal className={styles.modal}>
        <Dialog role="alertdialog" className={styles.dialog}>
          <Heading slot="title" className={styles.title}>
            {options?.title}
          </Heading>
          {options?.description && <p className={styles.description}>{options.description}</p>}
          <div className={styles.foot}>
            <Button autoFocus onClick={() => finish(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={() => finish(true)}>
              {options?.confirmLabel}
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );

  return { confirm, dialog };
}
