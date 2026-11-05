import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
      <ScreenHost screenId="system.info" />
    </QueryClientProvider>
  );
}
