import type { Preview } from "@storybook/react-vite";
import { createElement, Fragment } from "react";
import "../src/shared/styles/global.css";
import { UiProvider } from "../src/shared/ui/UiProvider";

/**
 * 도구 막대에서 테마, 글자 크기, 모니터를 바꿔 모든 스토리를 확인합니다.
 * 앱과 같은 방식으로 <html>의 data-theme, data-text-size, data-screen을 바꿉니다.
 */
const preview: Preview = {
  globalTypes: {
    theme: {
      description: "테마",
      toolbar: {
        title: "테마",
        items: [
          { value: "light", title: "라이트" },
          { value: "dark", title: "다크" },
        ],
        dynamicTitle: true,
      },
    },
    textSize: {
      description: "글자 크기 설정",
      toolbar: {
        title: "글자 크기",
        items: [
          { value: "normal", title: "글자 보통" },
          { value: "large", title: "글자 크게" },
        ],
        dynamicTitle: true,
      },
    },
    screen: {
      description: "모니터 보정",
      toolbar: {
        title: "모니터",
        items: [
          { value: "normal", title: "보통 모니터" },
          { value: "wide", title: "넓은 모니터" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    textSize: "normal",
    screen: "normal",
  },
  decorators: [
    (Story, { globals }) => {
      const root = document.documentElement;
      root.dataset.theme = globals.theme;
      setFlag(root, "textSize", globals.textSize === "large" ? "large" : undefined);
      setFlag(root, "screen", globals.screen === "wide" ? "wide" : undefined);
      // 설정을 바꾸면 스토리를 새로 그려 계산된 값을 다시 읽게 합니다
      const key = `${globals.theme}-${globals.textSize}-${globals.screen}`;
      return createElement(Fragment, { key }, createElement(UiProvider, null, Story()));
    },
  ],
};

function setFlag(root: HTMLElement, name: "textSize" | "screen", value: string | undefined) {
  if (value) {
    root.dataset[name] = value;
  } else {
    delete root.dataset[name];
  }
}

export default preview;
