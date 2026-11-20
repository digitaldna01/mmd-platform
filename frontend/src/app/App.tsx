import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ScreenId } from "../screens/registry";
import { AppShell } from "../shared/ui/AppShell";
import { UiProvider } from "../shared/ui/UiProvider";
import { HOME_SCREEN, MENU_SEARCH, menu } from "./menu";
import { ScreenHost } from "./ScreenHost";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  // 화면은 URL이 아니라 화면 ID로 띄웁니다(ADR-0003). 여러 화면 동시 열기는 회사에서 정한 뒤 바꿉니다
  const [screenId, setScreenId] = useState<ScreenId>(HOME_SCREEN);
  return (
    <QueryClientProvider client={queryClient}>
      <UiProvider>
        <AppShell
          menu={menu}
          current={screenId}
          onNavigate={(next) => setScreenId(next as ScreenId)}
          menuSearch={MENU_SEARCH}
        >
          <ScreenHost screenId={screenId} />
        </AppShell>
      </UiProvider>
    </QueryClientProvider>
  );
}
