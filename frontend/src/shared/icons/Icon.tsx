import { type IconArt, type IconArtSize, iconArt, type IconName } from "./icons.generated";
import styles from "./Icon.module.css";

export type { IconName } from "./icons.generated";

export type IconSize = "sm" | "md" | "lg";

/**
 * 크기마다 [글자 크기 보통, 크게]에서 쓰는 그림. 아이콘은 그려진 크기에서 픽셀에 맞으므로
 * 1px씩 키우지 않고 한 단계 큰 그림으로 건너뜁니다. 규칙: docs/design-guide.md '아이콘'
 */
const ART_SIZES: Record<IconSize, readonly [IconArtSize, IconArtSize]> = {
  sm: [12, 16],
  md: [16, 20],
  lg: [24, 28],
};

interface IconProps {
  name: IconName;
  /** sm: 배지·그리드 머리글, md: 기본, lg: 빈 상태·확인 창 */
  size?: IconSize;
  /** 아이콘만으로 뜻을 전할 때의 이름. 글자 옆에 붙는 아이콘은 비워 둡니다 */
  label?: string;
  className?: string;
}

/** 색은 글자색(currentColor)을 따릅니다. */
export function Icon({ name, size = "md", label, className }: IconProps) {
  const [normal, large] = ART_SIZES[size];
  const classes = [styles.icon, styles[size], className].filter(Boolean).join(" ");
  return (
    <span
      className={classes}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Art art={iconArt[name][normal]} className={styles.normal} />
      <Art art={iconArt[name][large]} className={styles.large} />
    </span>
  );
}

function Art({ art, className }: { art: IconArt; className: string | undefined }) {
  const [box, ...paths] = art;
  return (
    <svg className={className} viewBox={`0 0 ${box} ${box}`} focusable="false">
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
