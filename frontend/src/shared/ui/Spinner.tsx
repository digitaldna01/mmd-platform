import styles from "./Spinner.module.css";

/**
 * 기다림을 알리는 도는 고리입니다. 아이콘(md)과 같은 크기이고 글자색을 따릅니다.
 * 장식이라 보조 기술에서 숨깁니다. 처리 중임은 옆의 글자('조회 중')나 버튼의 aria-busy가 알립니다.
 * 바로 그리지 말고 useDelayedBusy로 0.3초 뒤에 그립니다.
 */
export function Spinner() {
  return (
    <svg className={styles.spinner} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}
