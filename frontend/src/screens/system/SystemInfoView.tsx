import { ErrorNotice } from "../../shared/feedback/ErrorNotice";
import { LoadingNotice } from "../../shared/feedback/LoadingNotice";
import styles from "./SystemInfoView.module.css";

interface SystemInfoViewProps {
  version?: string;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function SystemInfoView({ version, isLoading, error, onRetry }: SystemInfoViewProps) {
  if (isLoading) {
    return <LoadingNotice />;
  }
  if (error) {
    return <ErrorNotice error={error} onRetry={onRetry} />;
  }

  return (
    <section className={styles.panel}>
      <h1 className={styles.title}>시스템 정보</h1>
      <p>{version ? `BE 버전: ${version}` : "버전 정보가 없습니다."}</p>
    </section>
  );
}
