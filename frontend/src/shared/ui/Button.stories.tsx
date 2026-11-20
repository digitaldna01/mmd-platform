import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { type IconName, iconNames } from "../icons/icons.generated";
import base from "../styles/foundations/foundations.module.css";
import { Page, Section } from "../styles/foundations/parts";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import styles from "./Button.stories.module.css";

interface PlaygroundArgs {
  variant: ButtonVariant;
  size: ButtonSize;
  text: string;
  icon: IconName | "없음";
  iconOnly: boolean;
  busy: boolean;
  disabledReason: string;
  count: number | undefined;
  countUnit: string;
}

const meta: Meta<PlaygroundArgs> = {
  title: "컴포넌트/버튼",
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<PlaygroundArgs>;

const variants: Array<[ButtonVariant, string]> = [
  ["primary", "주요"],
  ["secondary", "보조"],
  ["ghost", "고스트"],
];

/** 처리 중 예시: 누르면 took ms 뒤에 끝나는 가짜 요청 */
function BusyDemo() {
  const [pending, setPending] = useState<number | null>(null);
  const [log, setLog] = useState("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const run = (took: number) => {
    setPending(took);
    setLog("");
    timer.current = window.setTimeout(() => {
      setPending(null);
      setLog(`${took}ms 걸림`);
    }, took);
  };
  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Button variant="primary" count={4} countUnit="건" busy={pending === 2000} onClick={() => run(2000)}>
          저장
        </Button>
        <Button variant="secondary" icon="copy" busy={pending === 200} onClick={() => run(200)}>
          복사 (0.2초 걸림)
        </Button>
      </div>
      <span className={styles.log} role="status">
        {log}
      </span>
    </div>
  );
}

export const Overview: Story = {
  name: "버튼",
  render: () => (
    <Page
      title="버튼"
      lead={
        <>
          화면은 <code>&lt;button&gt;</code>을 직접 쓰지 않고 <code>shared/ui/Button</code>을 씁니다. 마우스 올림과
          누름은 직접 해 보세요. 상태를 고정한 그림은 '기초/상호작용 상태'에 있습니다.
        </>
      }
    >
      <Section
        title="종류와 상태"
        note="주요는 영역마다 하나(조회, 저장, 다이얼로그 확인), 보조는 초기화·취소·복사, 고스트는 그리드 툴바의 도구와 토스트 동작입니다. 주요·보조 글자 버튼은 최소 폭이 컨트롤 높이의 2배(64px)입니다."
      >
        <div className={base.box}>
          <table className={base.table}>
            <thead>
              <tr>
                <th>종류</th>
                <th>기본</th>
                <th>비활성 (포커스를 주면 이유가 보임)</th>
                <th>처리 중</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(([variant, name]) => (
                <tr key={variant}>
                  <td className={styles.kind}>{name}</td>
                  <td>
                    <div className={styles.row}>
                      <Button variant={variant}>저장</Button>
                      <Button variant={variant} icon="add">
                        행 추가
                      </Button>
                    </div>
                  </td>
                  <td>
                    <Button variant={variant} disabledReason="저장할 변경이 없습니다">
                      저장
                    </Button>
                  </td>
                  <td>
                    <Button variant={variant} icon="add" busy>
                      행 추가
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className={styles.kind}>아이콘 뒤</td>
                <td>
                  <Button icon="arrow-right" iconPosition="end" count={3}>
                    추가
                  </Button>
                </td>
                <td>
                  <Button icon="arrow-right" iconPosition="end" count={0} disabledReason="추가할 항목을 고르세요">
                    추가
                  </Button>
                </td>
                <td>
                  <Button icon="arrow-right" iconPosition="end" count={3} busy>
                    추가
                  </Button>
                </td>
              </tr>
              <tr>
                <td className={styles.kind}>작게</td>
                <td>
                  <div className={styles.row}>
                    <Button variant="ghost" size="sm">
                      실행 취소
                    </Button>
                    <Button variant="secondary" size="sm">
                      다시 보내기
                    </Button>
                  </div>
                </td>
                <td>
                  <Button variant="secondary" size="sm" disabledReason="보낼 메시지가 없습니다">
                    다시 보내기
                  </Button>
                </td>
                <td>
                  <Button variant="secondary" size="sm" busy>
                    다시 보내기
                  </Button>
                </td>
              </tr>
              <tr>
                <td className={styles.kind}>아이콘만</td>
                <td>
                  <div className={styles.row}>
                    <Button variant="ghost" icon="refresh" label="새로 고침" />
                    <Button variant="ghost" icon="more" label="더 보기" />
                    <Button variant="ghost" size="sm" icon="close" label="닫기" />
                  </div>
                </td>
                <td>
                  <Button
                    variant="ghost"
                    icon="refresh"
                    label="새로 고침"
                    disabledReason="조회한 뒤에 새로 고칠 수 있습니다"
                  />
                </td>
                <td>
                  <Button variant="ghost" icon="refresh" label="새로 고침" busy />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="처리 중"
        note="누른 순간부터 다시 누를 수 없고, 0.3초가 넘으면 아이콘 자리(아이콘이 없으면 글자 앞)에 스피너가 돕니다. 한번 보이면 0.5초는 둡니다. 두 버튼을 눌러 비교해 보세요."
      >
        <BusyDemo />
      </Section>

      <Section
        title="놓는 자리"
        note="아이콘은 화면에 늘 놓여 있어 눈으로 찾는 버튼(조회 조건, 그리드 툴바)에만 붙입니다. 저장·확인·취소처럼 마무리하는 버튼은 글자만 쓰고, 보조 → 주요 순서로 놓아 주요 버튼이 오른쪽 끝에 오게 합니다."
      >
        <div className={styles.contexts}>
          <span className={styles.label}>조회 조건</span>
          <div className={styles.query}>
            <span className={styles.field}>
              공장 *<span className={styles.input}>P9</span>
            </span>
            <span className={styles.field}>
              Shop
              <span className={styles.input}>P9T</span>
            </span>
            <div className={styles.row}>
              <Button variant="primary" icon="search">
                조회
              </Button>
              <Button variant="secondary" icon="reset">
                초기화
              </Button>
            </div>
          </div>

          <span className={styles.label}>그리드 툴바</span>
          <div className={styles.gridBox}>
            <div className={styles.toolbar}>
              <span>
                <span className={styles.title}>공정 정책</span>
                <span className={styles.count}>총 32건</span>
              </span>
              <div className={styles.tools}>
                <Button variant="ghost" icon="add">
                  행 추가
                </Button>
                <Button variant="ghost" icon="remove" disabledReason="삭제할 행을 고르세요">
                  행 삭제
                </Button>
                <Button variant="ghost" icon="download">
                  엑셀
                </Button>
                <span className={styles.divider} />
                <Button variant="primary" count={4} countUnit="건">
                  저장
                </Button>
              </div>
            </div>
          </div>

          <span className={styles.label}>확인 창, 상세 폼 아래</span>
          <div className={styles.dialog}>
            <b>공정 정책 2건을 삭제할까요?</b>
            <p>저장하면 되돌릴 수 없습니다.</p>
            <div className={styles.foot}>
              <Button>취소</Button>
              <Button variant="primary">삭제</Button>
            </div>
          </div>
        </div>
      </Section>
    </Page>
  ),
};

export const Playground: Story = {
  name: "직접 바꿔 보기",
  parameters: { layout: "padded" },
  args: {
    variant: "primary",
    size: "md",
    text: "저장",
    icon: "없음",
    iconOnly: false,
    busy: false,
    disabledReason: "",
    count: undefined,
    countUnit: "건",
  },
  argTypes: {
    variant: { name: "종류", control: "inline-radio", options: ["primary", "secondary", "ghost"] },
    size: { name: "크기", control: "inline-radio", options: ["md", "sm"] },
    text: { name: "글자 (아이콘만일 때는 label)" },
    icon: { name: "아이콘", control: "select", options: ["없음", ...iconNames] },
    iconOnly: { name: "아이콘만" },
    busy: { name: "처리 중" },
    disabledReason: { name: "비활성 이유 (비우면 활성)" },
    count: { name: "개수", control: "number" },
    countUnit: { name: "개수 단위" },
  },
  render: ({ variant, size, text, icon, iconOnly, busy, disabledReason, count, countUnit }) => {
    const reason = disabledReason || undefined;
    if (iconOnly) {
      return (
        <Button
          variant={variant}
          size={size}
          icon={icon === "없음" ? "more" : icon}
          label={text}
          busy={busy}
          disabledReason={reason}
        />
      );
    }
    return (
      <Button
        variant={variant}
        size={size}
        icon={icon === "없음" ? undefined : icon}
        busy={busy}
        disabledReason={reason}
        count={count}
        countUnit={countUnit}
      >
        {text}
      </Button>
    );
  },
};
