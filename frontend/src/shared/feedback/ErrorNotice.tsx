import { ApiRequestError } from "../../api/client";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

const UNEXPECTED_MESSAGE = "화면을 표시하는 중 오류가 발생했습니다.";

interface ErrorNoticeProps {
  error: Error;
  /** 있으면 '다시 조회' 버튼을 둡니다 */
  onRetry?: () => void;
  /** 무엇이 안 됐는지. 기본값은 API 오류면 '조회하지 못했습니다.', 그 밖은 '화면을 표시하지 못했습니다.' */
  title?: string;
  /** 그리드 상자 안에 둘 때 테두리와 면을 뺍니다 */
  bare?: boolean;
}

/**
 * 조회나 화면 표시가 실패했을 때 그 자리(그리드, 화면 본문)에 보이는 오류 상태.
 * 결과 없음과 헷갈리지 않게 오류 아이콘, 서버가 준 사용자 메시지, 추적 ID를 보입니다. 서버의 기술 메시지는 보이지 않습니다.
 * 규칙: docs/design-guide.md '오류를 보이는 자리'
 */
export function ErrorNotice({ error, onRetry, title, bare = false }: ErrorNoticeProps) {
  const isApiError = error instanceof ApiRequestError;
  return (
    <EmptyState
      bare={bare}
      tone="error"
      title={title ?? (isApiError ? "조회하지 못했습니다." : "화면을 표시하지 못했습니다.")}
      description={isApiError ? error.message : UNEXPECTED_MESSAGE}
      detail={isApiError ? `추적 ID ${error.traceId}` : undefined}
      actions={
        onRetry && (
          <Button icon="refresh" onClick={onRetry}>
            다시 조회
          </Button>
        )
      }
    />
  );
}
