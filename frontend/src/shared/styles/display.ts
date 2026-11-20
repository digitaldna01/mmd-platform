/**
 * 모니터 보정. 모니터 폭(CSS px)이 이 값 이상이면 넓은 모니터로 보고 글자와 행 높이를 키웁니다.
 * 규칙: docs/design-guide.md '크기 조정'
 */
export const WIDE_SCREEN_MIN_WIDTH = 2200;

/**
 * `<html>`에 `data-screen="wide"`를 붙이거나 뗍니다.
 * 창 폭이 아니라 모니터 폭을 봅니다. 창을 다른 모니터로 옮기면 다시 계산합니다.
 * 반환한 함수를 부르면 감시를 멈춥니다.
 */
export function watchScreenSize(root: HTMLElement = document.documentElement): () => void {
  const update = () => {
    if (window.screen.width >= WIDE_SCREEN_MIN_WIDTH) {
      root.dataset.screen = "wide";
    } else {
      delete root.dataset.screen;
    }
  };
  update();
  // 창을 옮기면 resize가 일어납니다. 창 크기만 바뀌면 모니터 폭이 같아 결과도 같습니다.
  // Chrome은 모니터 정보가 바뀔 때 screen에도 change를 보냅니다(TypeScript 타입에는 아직 없음).
  const screenEvents = window.screen as Screen & Partial<EventTarget>;
  window.addEventListener("resize", update);
  screenEvents.addEventListener?.("change", update);
  return () => {
    window.removeEventListener("resize", update);
    screenEvents.removeEventListener?.("change", update);
  };
}

/** 테마: 시스템은 OS 설정을 따릅니다 */
export type ThemePreference = "system" | "light" | "dark";
/** 글자 크기 설정 */
export type TextSize = "normal" | "large";

export interface DisplaySettings {
  theme: ThemePreference;
  textSize: TextSize;
}

/**
 * 브라우저에 기억하는 열쇠. 로그인이 생기면 사용자 설정(BE)으로 옮깁니다.
 * 같은 PC를 여러 사람이 쓰면 마지막 사람의 설정이 남습니다.
 */
const STORAGE_KEY = "mmd.display";
const DEFAULTS: DisplaySettings = { theme: "system", textSize: "normal" };

/** 기억한 화면 설정. 없거나 읽을 수 없으면 기본값(시스템, 보통) */
export function readDisplaySettings(): DisplaySettings {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<DisplaySettings>;
    return {
      theme: saved.theme === "light" || saved.theme === "dark" ? saved.theme : "system",
      textSize: saved.textSize === "large" ? "large" : "normal",
    };
  } catch {
    return DEFAULTS;
  }
}

/** `<html>`의 data-theme, data-text-size를 바꾸고 기억합니다. 규칙: docs/design-guide.md '토큰 파일과 Storybook' */
export function applyDisplaySettings(settings: DisplaySettings, root: HTMLElement = document.documentElement): void {
  if (settings.theme === "system") delete root.dataset.theme;
  else root.dataset.theme = settings.theme;
  if (settings.textSize === "large") root.dataset.textSize = "large";
  else delete root.dataset.textSize;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 저장소를 쓸 수 없으면(개인 정보 보호 모드 등) 이번 창에서만 적용합니다
  }
}
