import {
  cloneElement,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

/** 마우스를 올리고 이만큼 뒤에 나타납니다. 지나가기만 하는 마우스에는 뜨지 않습니다 */
export const TOOLTIP_SHOW_DELAY_MS = 500;
/** 마우스가 떠나면 이만큼 기다립니다. 툴팁 위로 마우스를 옮길 수 있게 하기 위해서입니다 */
export const TOOLTIP_HIDE_DELAY_MS = 100;
/** 사라지는 페이드 시간. tokens.css의 --duration-normal과 같습니다 */
const FADE_OUT_MS = 150;
/** 대상과 툴팁 사이 (--space-1) */
const GAP_PX = 4;
/** 창 가장자리와 툴팁 사이 */
const EDGE_PX = 4;

interface TooltipHandle {
  /** immediate: 페이드 없이 바로 뺍니다(옆 대상의 툴팁으로 바뀔 때) */
  close: (immediate?: boolean) => void;
}

/** 툴팁은 한 번에 하나만 뜹니다. 떠 있는 동안 옆 대상으로 옮기면 기다리지 않고 바로 바뀝니다 */
let current: TooltipHandle | null = null;

export interface TooltipTriggerProps {
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  onPointerDown: () => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  "aria-describedby"?: string;
}

const TRIGGER_HANDLERS = [
  "onPointerEnter",
  "onPointerLeave",
  "onPointerDown",
  "onFocus",
  "onBlur",
  "onKeyDown",
] as const;

type Phase = "closed" | "open" | "closing";

/**
 * 대상에 붙일 이벤트와 툴팁 요소를 돌려줍니다. 컴포넌트를 만들 때 씁니다.
 * 화면에서는 Button의 label·disabledReason이나 Tooltip 컴포넌트를 씁니다.
 * 규칙: docs/design-guide.md '넘치는 글자와 툴팁', '모션'의 툴팁
 *
 * @param content 툴팁 내용. 비어 있으면 뜨지 않습니다
 * @param options.describe 뜬 동안 대상의 aria-describedby로 툴팁을 잇습니다. 대상의 이름과 같은 내용이면 끕니다
 */
export function useTooltip(content: ReactNode, options: { describe?: boolean } = {}) {
  const id = useId();
  const timer = useRef<number | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("closed");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [handle] = useState<TooltipHandle>(() => {
    const self: TooltipHandle = {
      close: (immediate = false) => {
        window.clearTimeout(timer.current);
        setPhase((p) => (immediate ? "closed" : p === "open" ? "closing" : p));
        if (current === self) current = null;
      },
    };
    return self;
  });
  const hasContent = content !== undefined && content !== null && content !== false && content !== "";

  const show = (target: HTMLElement) => {
    window.clearTimeout(timer.current);
    if (current && current !== handle) current.close(true);
    current = handle;
    setAnchor(target);
    setPhase("open");
  };

  const scheduleClose = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => handle.close(), TOOLTIP_HIDE_DELAY_MS);
  };

  // 사라지는 페이드가 끝나면 요소를 뺍니다
  useEffect(() => {
    if (phase !== "closing") return undefined;
    const t = window.setTimeout(() => setPhase((p) => (p === "closing" ? "closed" : p)), FADE_OUT_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // 뜬 동안: Esc로 닫고, 스크롤하거나 창 크기가 바뀌면 닫습니다(대상에서 떨어져 보이지 않게)
  useEffect(() => {
    if (phase !== "open") return undefined;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") handle.close();
    };
    document.addEventListener("keydown", onKey);
    const onMove = () => handle.close();
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [phase, handle]);

  useEffect(() => {
    if (!hasContent) handle.close();
  }, [hasContent, handle]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      if (current === handle) current = null;
    },
    [handle],
  );

  const triggerProps: TooltipTriggerProps = {
    onPointerEnter: (event) => {
      if (!hasContent || event.pointerType === "touch") return;
      const target = event.currentTarget;
      window.clearTimeout(timer.current);
      if (current) show(target);
      else timer.current = window.setTimeout(() => show(target), TOOLTIP_SHOW_DELAY_MS);
    },
    onPointerLeave: scheduleClose,
    onPointerDown: () => handle.close(),
    onFocus: (event) => {
      // 키보드 포커스에만 바로 띄웁니다. 마우스로 누른 포커스에는 띄우지 않습니다
      if (hasContent && isFocusVisible(event.currentTarget)) show(event.currentTarget);
    },
    onBlur: () => handle.close(),
    onKeyDown: (event) => {
      if (event.key === "Escape" && phase === "open") {
        // 툴팁만 닫고, 다이얼로그 같은 바깥 요소는 닫지 않습니다
        event.stopPropagation();
        handle.close();
      }
    },
    "aria-describedby": options.describe && phase === "open" ? id : undefined,
  };

  const tooltip =
    phase !== "closed" && anchor && hasContent
      ? createPortal(
          <Bubble
            id={id}
            anchor={anchor}
            closing={phase === "closing"}
            onPointerEnter={() => window.clearTimeout(timer.current)}
            onPointerLeave={scheduleClose}
          >
            {content}
          </Bubble>,
          document.body,
        )
      : null;

  return { triggerProps, tooltip };
}

/**
 * 대상의 이벤트 처리기와 툴팁 이벤트를 함께 부르도록 합칩니다.
 */
export function withTooltipTrigger<P extends HTMLAttributes<HTMLElement>>(own: P, trigger: TooltipTriggerProps): P {
  const merged: Record<string, unknown> = { ...(own as object) };
  for (const key of TRIGGER_HANDLERS) {
    const ownHandler = own[key] as ((event: never) => void) | undefined;
    const triggerHandler = trigger[key] as (event: never) => void;
    merged[key] = ownHandler
      ? (event: never) => {
          ownHandler(event);
          triggerHandler(event);
        }
      : triggerHandler;
  }
  merged["aria-describedby"] =
    [own["aria-describedby"], trigger["aria-describedby"]].filter(Boolean).join(" ") || undefined;
  return merged as P;
}

interface TooltipProps {
  /** 툴팁 내용. 누를 것을 넣지 않고, 툴팁에만 있는 정보를 두지 않습니다 */
  content: ReactNode;
  /** 대상 요소 하나. 키보드로도 띄울 수 있게 포커스를 받는 요소여야 합니다(버튼, 링크, tabIndex={0}) */
  children: ReactElement<HTMLAttributes<HTMLElement>>;
}

/**
 * 대상 하나에 툴팁을 답니다. 잘린 글자의 전체, 편집 상태 표시와 약어 머리글의 뜻에 씁니다.
 * 버튼에는 이 컴포넌트 대신 Button의 label(아이콘만 있는 버튼)과 disabledReason(비활성 이유)을 씁니다.
 */
export function Tooltip({ content, children }: TooltipProps) {
  const { triggerProps, tooltip } = useTooltip(content, { describe: true });
  return (
    <>
      {cloneElement(children, withTooltipTrigger(children.props, triggerProps))}
      {tooltip}
    </>
  );
}

interface BubbleProps {
  id: string;
  anchor: HTMLElement;
  closing: boolean;
  children: ReactNode;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

function Bubble({ id, anchor, closing, children, onPointerEnter, onPointerLeave }: BubbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) place(ref.current, anchor);
  }, [anchor, children]);
  return (
    <div
      ref={ref}
      id={id}
      role="tooltip"
      className={closing ? `${styles.tooltip} ${styles.closing}` : styles.tooltip}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  );
}

/** 대상 아래 4px, 왼쪽 끝을 맞춥니다. 아래에 자리가 없으면 위로, 창 밖으로 나가면 안으로 옮깁니다 */
function place(tip: HTMLElement, anchor: HTMLElement) {
  const target = anchor.getBoundingClientRect();
  const { width, height } = tip.getBoundingClientRect();
  const below = target.bottom + GAP_PX;
  const top = below + height <= window.innerHeight - EDGE_PX ? below : target.top - GAP_PX - height;
  const left = Math.min(target.left, window.innerWidth - EDGE_PX - width);
  tip.style.top = `${Math.max(EDGE_PX, top)}px`;
  tip.style.left = `${Math.max(EDGE_PX, left)}px`;
}

function isFocusVisible(element: HTMLElement): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    // :focus-visible을 모르는 환경에서는 포커스마다 띄웁니다
    return true;
  }
}
