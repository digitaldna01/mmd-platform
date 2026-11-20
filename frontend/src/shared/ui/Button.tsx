import { type ComponentPropsWithRef, type MouseEvent, type ReactNode, useEffect, useId } from "react";
import { formatNumber } from "../format/format";
import { Icon, type IconName } from "../icons/Icon";
import styles from "./Button.module.css";
import { Spinner } from "./Spinner";
import { useTooltip, withTooltipTrigger } from "./Tooltip";
import { useDelayedBusy } from "./useDelayedBusy";

/** 주요: 영역마다 하나(조회, 저장, 다이얼로그 확인). 보조: 초기화, 취소, 복사. 고스트: 그리드 툴바 도구, 토스트 동작 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
/** md: 화면에 놓이는 모든 버튼. sm: 행 높이 상자 안(그리드 셀, 토스트·배너 안 동작)에만 */
export type ButtonSize = "md" | "sm";

/** 모양과 상태는 이 컴포넌트가 정하므로 className, style, disabled는 받지 않습니다 */
type NativeProps = Omit<
  ComponentPropsWithRef<"button">,
  "children" | "className" | "style" | "disabled" | "aria-disabled" | "aria-busy" | "aria-label"
>;

interface CommonProps extends NativeProps {
  /** 기본값 secondary */
  variant?: ButtonVariant;
  /** 기본값 md */
  size?: ButtonSize;
  /** 처리 중. 누른 순간부터 다시 누를 수 없고, 0.3초가 넘으면 아이콘 자리에 스피너가 돕니다 */
  busy?: boolean;
  /** 비활성 이유. 값이 있으면 비활성이 되고, 툴팁과 보조 기술로 이유를 알립니다 (예: '저장할 변경이 없습니다') */
  disabledReason?: string;
}

interface TextButtonProps extends CommonProps {
  /** 버튼 글자. 동사로 씁니다 (조회, 저장, 행 추가) */
  children: ReactNode;
  /** 글자 앞 아이콘. 조회 조건, 툴바, 그리드 툴바의 동작에만 붙이고 저장·확인·취소에는 붙이지 않습니다 */
  icon?: IconName;
  /** 아이콘 자리. end는 방향을 뜻할 때만 씁니다 (이중 목록의 '추가 3 →'). 기본값 start */
  iconPosition?: "start" | "end";
  /** 대상 개수. 글자 뒤에 붙습니다 (저장 4건). 0이면 disabledReason을 함께 줍니다 */
  count?: number;
  /** 개수 뒤 단위 (건) */
  countUnit?: string;
  label?: never;
}

interface IconOnlyButtonProps extends CommonProps {
  /** 뜻이 분명한 아이콘만 씁니다 (더 보기, 닫기, 새로 고침) */
  icon: IconName;
  /** 버튼 이름. 툴팁과 보조 기술에 쓰입니다 */
  label: string;
  children?: never;
  iconPosition?: never;
  count?: never;
  countUnit?: never;
}

export type ButtonProps = TextButtonProps | IconOnlyButtonProps;

/**
 * 버튼. 화면은 <button>을 직접 쓰지 않고 이 컴포넌트를 씁니다.
 * 규칙: docs/design-guide.md '버튼', '상호작용 상태', '컨트롤 크기'
 *
 * @example
 * <Button variant="primary" icon="search" onClick={search}>조회</Button>
 * <Button variant="ghost" icon="refresh" label="새로 고침" onClick={refresh} />
 * <Button variant="primary" count={4} countUnit="건" busy={save.isPending} onClick={save}>저장</Button>
 * <Button variant="primary" count={0} countUnit="건" disabledReason="저장할 변경이 없습니다">저장</Button>
 * <Button icon="arrow-right" iconPosition="end" count={3}>추가</Button>
 */
export function Button(props: ButtonProps) {
  const {
    variant = "secondary",
    size = "md",
    icon,
    iconPosition = "start",
    label,
    busy = false,
    disabledReason,
    count,
    countUnit = "",
    children,
    type = "button",
    onClick,
    ...rest
  } = props;
  const reasonId = useId();
  const disabled = disabledReason !== undefined;
  const iconOnly = label !== undefined;
  const spinning = useDelayedBusy(busy && !disabled);
  const isBusy = !disabled && (busy || spinning);
  const { triggerProps, tooltip } = useTooltip(disabled ? disabledReason : label);

  useEffect(() => {
    if (import.meta.env.DEV && count === 0 && !disabled) {
      console.warn("[Button] 개수가 0이면 disabledReason을 주어 비활성으로 둡니다. docs/design-guide.md '버튼'");
    }
  }, [count, disabled]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // 비활성과 처리 중에는 누르지 않은 것으로 합니다. form 안의 submit 버튼도 보내지 않습니다
    if (disabled || isBusy) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const native = withTooltipTrigger(rest, triggerProps);
  const describedBy = [native["aria-describedby"], disabled ? reasonId : undefined].filter(Boolean).join(" ");
  const className = [
    styles.button,
    styles[variant],
    size === "sm" && styles.sm,
    iconOnly && styles.iconOnly,
    !disabled && !isBusy && styles.interactive,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        {...native}
        type={type}
        className={className}
        aria-label={label}
        aria-disabled={disabled || undefined}
        aria-busy={isBusy || undefined}
        aria-describedby={describedBy || undefined}
        onClick={handleClick}
      >
        {spinning ? <Spinner /> : icon && iconPosition === "start" && <Icon name={icon} />}
        {children}
        {count !== undefined && ` ${formatNumber(count)}${countUnit}`}
        {!spinning && icon && iconPosition === "end" && <Icon name={icon} />}
      </button>
      {disabled && (
        <span id={reasonId} hidden>
          {disabledReason}
        </span>
      )}
      {tooltip}
    </>
  );
}
