import { useGetVersion } from "../../api/generated/backend";
import { SystemInfoView } from "./SystemInfoView";

export default function SystemInfoScreen() {
  const { data, error, isFetching, refetch } = useGetVersion();

  return (
    <SystemInfoView
      version={data?.data?.version}
      isLoading={isFetching}
      error={error}
      onRetry={() => void refetch()}
    />
  );
}
