import type { ReactNode } from "react";
import { Icon } from "../icons/Icon";
import styles from "./Banner.module.css";
import { cx } from "./FieldParts";

export interface BannerProps {
  /** warning: 주의할 상태(데모 데이터). info: 화면에 대한 안내(조회만 할 수 있음) */
  tone?: "info" | "warning";
  children: ReactNode;
}

/**
 * 안내 배너: 화면 머리나 조회 조건 아래에 늘 보이는 한 줄 안내. 닫지 않습니다.
 * 일이 끝난 결과는 배너가 아니라 토스트(useToast)로, 오류는 일이 일어난 자리에 보입니다.
 * 규칙: docs/design-guide.md '안내 배너'
 *
 * @example
 * <Banner tone="warning">데모 데이터입니다. 저장해도 실제 MMD에는 반영되지 않습니다.</Banner>
 */
export function Banner({ tone = "info", children }: BannerProps) {
  return (
    <div className={cx(styles.banner, styles[tone])}>
      <Icon name={tone} className={styles.icon} />
      <p className={styles.text}>{children}</p>
    </div>
  );
}
