import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: {
      target: "../contracts/openapi/backend.json",
    },
    output: {
      target: "src/api/generated/backend.ts",
      client: "react-query",
      mode: "single",
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: "src/api/client.ts",
          name: "apiRequest",
        },
      },
    },
  },
});
