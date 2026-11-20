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
