import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { VisuallyHidden } from "react-aria-components";
import { Icon } from "../icons/Icon";
import { Button } from "./Button";
import { cx } from "./FieldParts";
import styles from "./Toast.module.css";

/** 성공과 안내는 이만큼 뒤에 사라집니다. 마우스를 올리거나 포커스가 있는 동안에는 멈춥니다 */
export const TOAST_DURATION_MS = 5000;
/** 한 번에 보이는 토스트 수. 넘으면 오래된 것부터 뺍니다 */
export const TOAST_MAX_VISIBLE = 3;
/** 사라지는 페이드 시간. tokens.css의 --duration-normal과 같습니다 */
const FADE_OUT_MS = 150;

export interface ToastInput {
  /** 끝난 일. 마침표 없이 씁니다: '저장했습니다', '저장하지 못했습니다' */
  title: string;
  /** 대상과 개수, 실패 이유: '공정 정책 6건 (신규 2, 수정 3, 삭제 1)' */
  description?: ReactNode;
  /** 오류의 추적 ID. 보이고, '추적 ID 복사' 버튼이 붙습니다 */
  traceId?: string;
  /** 토스트 안의 동작 하나(열기, 실행 취소) */
  action?: { label: string; onAction: () => void };
}

type ToastTone = "success" | "info" | "error";

interface ToastItem extends ToastInput {
  id: number;
  tone: ToastTone;
  closing: boolean;
}

export interface ToastApi {
  /** 성공: 5초 뒤 사라집니다 */
  success: (toast: ToastInput) => void;
  /** 결과 안내(파일을 만들었음 등): 5초 뒤 사라집니다 */
  info: (toast: ToastInput) => void;
  /** 오류: 사용자가 닫을 때까지 남습니다. 행과 상관있는 오류는 그 칸도 오류 셀로 표시합니다 */
  error: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * 토스트를 띄우는 함수를 돌려줍니다. UiProvider 안에서 씁니다.
 * 규칙: docs/design-guide.md '토스트', '오류를 보이는 자리'
 *
 * @example
 * const toast = useToast();
 * toast.success({ title: "저장했습니다", description: "공정 정책 6건 (신규 2, 수정 3, 삭제 1)" });
 * toast.error({ title: "저장하지 못했습니다", description: error.message, traceId: error.traceId });
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast는 UiProvider 안에서 씁니다.");
  return api;
}

/** 토스트 자리. UiProvider가 앱과 Storybook의 맨 바깥에 한 번 둡니다 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // 스크린 리더 알림: 늘 있는 숨은 알림 자리에 글을 바꿔 넣어야 확실히 읽힙니다. 오류는 바로(assertive), 나머지는 차례로(polite)
  const [announced, setAnnounced] = useState({ polite: "", assertive: "" });
  const nextId = useRef(1);

  const remove = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const close = useCallback(
    (id: number) => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, closing: true } : t)));
      window.setTimeout(() => remove(id), FADE_OUT_MS);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(() => {
    const push = (tone: ToastTone) => (input: ToastInput) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { ...input, id, tone, closing: false }].slice(-TOAST_MAX_VISIBLE));
      const text = [input.title, typeof input.description === "string" ? input.description : ""]
        .filter(Boolean)
        .join(". ");
      const key = tone === "error" ? "assertive" : "polite";
      // 같은 글이 이어져도 다시 읽히도록 비웠다가 넣습니다
      setAnnounced((prev) => ({ ...prev, [key]: "" }));
      window.setTimeout(() => setAnnounced((prev) => ({ ...prev, [key]: text })), 50);
    };
    return { success: push("success"), info: push("info"), error: push("error") };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section aria-label="알림">
        <ol className={styles.region}>
          {toasts.map((toast) => (
            <ToastView key={toast.id} toast={toast} onClose={() => close(toast.id)} />
          ))}
        </ol>
        <VisuallyHidden>
          <div role="status">{announced.polite}</div>
          <div role="alert">{announced.assertive}</div>
        </VisuallyHidden>
      </section>
    </ToastContext.Provider>
  );
}

const ICONS = { success: "success", info: "info", error: "error" } as const;

/** 토스트에는 추적 ID를 줄여 보입니다(0f3a9c2e…7b41). 복사 버튼은 전체를 복사합니다 */
function shortTraceId(traceId: string): string {
  return traceId.length > 16 ? `${traceId.slice(0, 8)}…${traceId.slice(-4)}` : traceId;
}

function ToastView({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const autoClose = toast.tone !== "error";
  const remaining = useRef(TOAST_DURATION_MS);
  const startedAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const resume = useCallback(() => {
    if (!autoClose) return;
    window.clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = window.setTimeout(onClose, remaining.current);
  }, [autoClose, onClose]);

  const pause = () => {
    if (!autoClose) return;
    window.clearTimeout(timer.current);
    remaining.current -= Date.now() - startedAt.current;
  };

  useEffect(() => {
    resume();
    return () => window.clearTimeout(timer.current);
    // 처음 한 번만 시작합니다. 이후에는 마우스와 포커스가 멈추고 다시 시작합니다
  }, []);

  const copyTraceId = () => {
    if (toast.traceId) void navigator.clipboard?.writeText(toast.traceId);
  };

  return (
    <li
      className={cx(styles.toast, styles[toast.tone], toast.closing && styles.closing)}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resume();
      }}
    >
      <Icon name={ICONS[toast.tone]} className={styles.icon} />
      <div>
        <p className={styles.title}>{toast.title}</p>
        {toast.description && <p className={styles.description}>{toast.description}</p>}
        {toast.traceId && <span className={styles.detail}>추적 ID {shortTraceId(toast.traceId)}</span>}
      </div>
      <div className={styles.actions}>
        {toast.action && (
          <Button variant="ghost" size="sm" onClick={toast.action.onAction}>
            {toast.action.label}
          </Button>
        )}
        {toast.traceId && (
          <Button variant="ghost" size="sm" onClick={copyTraceId}>
            추적 ID 복사
          </Button>
        )}
        <Button variant="ghost" size="sm" icon="close" label="닫기" onClick={onClose} />
      </div>
    </li>
  );
}
