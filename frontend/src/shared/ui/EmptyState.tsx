import type { ReactNode } from "react";
import { Icon, type IconName } from "../icons/Icon";
import styles from "./EmptyState.module.css";
import { cx } from "./FieldParts";

export interface EmptyStateProps {
  /** 조회 전 search, 결과 없음 filter, 권한 없음 lock. 오류는 tone="error"면 error로 정해집니다 */
  icon?: IconName;
  /** 다음에 할 일을 말합니다: '공장과 Shop을 선택하고 조회해 주세요.' */
  title: string;
  description?: ReactNode;
  /** 오류: 아이콘이 negative가 되고 보조 기술에 바로 알립니다(role=alert) */
  tone?: "default" | "error";
  /** 추적 ID처럼 옮겨 적을 값 */
  detail?: string;
  /** 다시 조회 같은 버튼 */
  actions?: ReactNode;
  /** 그리드 상자 안에 둘 때 테두리와 면을 뺍니다 */
  bare?: boolean;
}

/**
 * 빈 상태: 그리드나 목록 자리에 '조회 전', '결과 없음', '조회 실패', '권한 없음'을 보입니다.
 * 조회가 실패하면 결과 없음처럼 보이지 않도록 반드시 tone="error"로 그 자리에 보입니다.
 * 규칙: docs/design-guide.md '빈 상태', '오류를 보이는 자리'
 *
 * @example
 * <EmptyState icon="search" title="공장과 Shop을 선택하고 조회해 주세요." />
 * <EmptyState icon="filter" title="조건에 맞는 공정 정책이 없습니다." description="조건을 바꿔 다시 조회해 주세요." />
 */
export function EmptyState({
  icon,
  title,
  description,
  tone = "default",
  detail,
  actions,
  bare = false,
}: EmptyStateProps) {
  const error = tone === "error";
  return (
    <div className={cx(styles.empty, error && styles.error, bare && styles.bare)} role={error ? "alert" : undefined}>
      <Icon name={icon ?? (error ? "error" : "info")} size="lg" className={styles.icon} />
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {detail && <span className={styles.detail}>{detail}</span>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
