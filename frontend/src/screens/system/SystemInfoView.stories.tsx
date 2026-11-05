import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApiRequestError } from "../../api/client";
import { SystemInfoView } from "./SystemInfoView";

const meta = {
  component: SystemInfoView,
  args: {
    isLoading: false,
    error: null,
    onRetry: () => {},
  },
} satisfies Meta<typeof SystemInfoView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    version: "0.1.0",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Empty: Story = {};

export const Failed: Story = {
  args: {
    error: new ApiRequestError({
      status: 500,
      code: "COMMON-500",
      message: "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      traceId: "0123456789abcdef0123456789abcdef",
    }),
  },
};
