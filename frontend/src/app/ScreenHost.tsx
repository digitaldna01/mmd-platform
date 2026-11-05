import { Suspense } from "react";
import { screens, type ScreenId } from "../screens/registry";
import { LoadingNotice } from "../shared/feedback/LoadingNotice";
import { ScreenErrorBoundary } from "../shared/feedback/ScreenErrorBoundary";

interface ScreenHostProps {
  screenId: ScreenId;
}

export function ScreenHost({ screenId }: ScreenHostProps) {
  const Screen = screens[screenId];

  return (
    <ScreenErrorBoundary>
      <Suspense fallback={<LoadingNotice />}>
        <Screen />
      </Suspense>
    </ScreenErrorBoundary>
  );
}
