import type { ReactNode } from "react";
import { I18nProvider } from "react-aria-components";

/**
 * 화면 언어. React Aria의 안내 문구(스크린 리더용)가 이 언어를 따릅니다.
 * 브라우저 언어와 상관없이 같게 하려고 고정합니다. 다른 언어 문구는 빌드에서 뺍니다(vite.config.ts).
 */
export const APP_LOCALE = "ko-KR";

/** 앱과 Storybook의 맨 바깥에 한 번 둡니다 */
export function UiProvider({ children }: { children: ReactNode }) {
  return <I18nProvider locale={APP_LOCALE}>{children}</I18nProvider>;
}
