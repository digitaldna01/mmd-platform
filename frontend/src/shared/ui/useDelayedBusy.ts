import { useEffect, useRef, useState } from "react";

/** 이보다 빨리 끝나면 기다림 표시를 하지 않습니다 */
export const BUSY_SHOW_DELAY_MS = 300;
/** 기다림 표시가 한번 보이면 이만큼은 둡니다 */
export const BUSY_MIN_VISIBLE_MS = 500;

/**
 * 기다림 표시(스피너, '조회 중')를 보일지 정합니다. 0.3초가 넘을 때만 보이고, 한번 보이면 0.5초는 둡니다.
 * 빨리 끝나는 요청에서 표시가 깜빡이지 않게 하기 위해서입니다. 규칙: docs/design-guide.md '모션'의 기다림
 *
 * @param busy 실제로 처리 중인지 (예: mutation.isPending)
 * @returns 기다림 표시를 그릴지
 */
export function useDelayedBusy(busy: boolean): boolean {
  const [shown, setShown] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (busy && !shown) {
      const timer = window.setTimeout(() => {
        shownAt.current = Date.now();
        setShown(true);
      }, BUSY_SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
    if (!busy && shown) {
      const left = Math.max(0, BUSY_MIN_VISIBLE_MS - (Date.now() - shownAt.current));
      const timer = window.setTimeout(() => setShown(false), left);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [busy, shown]);

  return shown;
}
