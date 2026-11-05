import { ApiRequestError } from "../../api/client";
import styles from "./ErrorNotice.module.css";

const UNEXPECTED_MESSAGE = "화면을 표시하는 중 오류가 발생했습니다.";

interface ErrorNoticeProps {
  error: Error;
  onRetry?: () => void;
}

export function ErrorNotice({ error, onRetry }: ErrorNoticeProps) {
  const isApiError = error instanceof ApiRequestError;

  return (
    <div role="alert" className={styles.notice}>
      <p className={styles.message}>{isApiError ? error.message : UNEXPECTED_MESSAGE}</p>
      {isApiError && <p className={styles.traceId}>추적 ID: {error.traceId}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}
