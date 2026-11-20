import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UiProvider } from "../shared/ui/UiProvider";
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
  return (
    <QueryClientProvider client={queryClient}>
      <UiProvider>
        <ScreenHost screenId="system.info" />
      </UiProvider>
    </QueryClientProvider>
  );
}
