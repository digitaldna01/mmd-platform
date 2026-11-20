import type { ReactElement } from "react";
import {
  Autocomplete,
  Button,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SearchField,
  SelectValue,
  Separator,
  useFilter,
} from "react-aria-components";
import { Icon } from "../icons/Icon";
import field from "./field.module.css";
import { cx, FieldLabel, FieldMessages, ReadOnlyField } from "./FieldParts";
import styles from "./Select.module.css";

/** 항목이 이보다 많으면 목록 위에 검색 칸을 둡니다 */
export const SELECT_SEARCH_THRESHOLD = 15;
/** 목록과 칸 사이 (--space-1) */
const POPOVER_OFFSET_PX = 4;
/** '전체'·'없음' 항목의 키. 바깥으로는 null로 넘깁니다 */
const EMPTY_KEY = "__mmd-select-empty__";

export interface SelectItem {
  /** 고르면 onChange로 넘어가는 값 */
  value: string;
  /** 이름 */
  name: string;
  /** 코드. 있으면 '코드 · 이름'으로 보이고, 코드에는 빗금 0을 켭니다 */
  code?: string;
  /** 항목 오른쪽 끝의 보조 정보 ('사용 안 함') */
  meta?: string;
}

export interface SelectProps {
  /** 칸 위 라벨 */
  label: string;
  items: readonly SelectItem[];
  /** 고른 값. 고르지 않았으면 null */
  value: string | null;
  onChange: (value: string | null) => void;
  /**
   * 비워도 되는 칸에서 '조건 없음'을 뜻하는 맨 위 항목. 조회 조건은 '전체', 상세 폼은 '없음'.
   * 고르면 onChange(null)이 불립니다. 필수 칸에는 주지 않습니다
   */
  emptyLabel?: string;
  /** 필수 칸. 라벨 뒤에 '*'가 붙습니다 */
  required?: boolean;
  /** 오류 문구 ('공장을 선택하세요.') */
  error?: string;
  /** 읽기 전용(앞 탭에서 넘어온 맥락 값) */
  readOnly?: boolean;
  /** 비활성 이유. 값이 있으면 비활성이 되고 칸에 이유를 보입니다 ('Shop을 먼저 선택') */
  disabledReason?: string;
  /** 고르지 않았을 때 흐리게 보이는 글자. 기본값 '선택' */
  placeholder?: string;
  name?: string;
}

/**
 * 선택 상자. 화면은 <select>를 직접 쓰지 않고 이 컴포넌트를 씁니다.
 * 항목이 15개를 넘으면 목록 위에 검색 칸이 생깁니다. 키보드: ↓·Enter·Space로 열기, ↑↓ 이동,
 * Home·End, Enter 고르기, Esc 닫기, 글자를 치면 그 글자로 시작하는 항목으로 갑니다.
 * 규칙: docs/design-guide.md '입력창과 선택 상자'
 *
 * @example
 * <Select label="공장" required items={plants} value={plant} onChange={setPlant} />
 * <Select label="공정" emptyLabel="전체" items={processes} value={process} onChange={setProcess} />
 * <Select label="Shop" items={shops} value={shop} onChange={setShop} disabledReason={plant ? undefined : "공장을 먼저 선택"} />
 */
export function Select(props: SelectProps) {
  if (props.readOnly) return <ReadOnlySelect {...props} />;

  const {
    label,
    items,
    value,
    onChange,
    emptyLabel,
    required = false,
    error,
    disabledReason,
    placeholder = "선택",
    name,
  } = props;
  const disabled = disabledReason !== undefined;
  const selected = items.find((item) => item.value === value);
  // 연쇄 선택처럼 비활성이고 값이 없으면 '전체' 대신 비활성 이유를 보입니다
  const selectedKey = selected ? selected.value : emptyLabel !== undefined && !disabled ? EMPTY_KEY : null;

  return (
    <AriaSelect
      className={cx(field.field, styles.select)}
      value={selectedKey}
      onChange={(key) => onChange(key === null || key === EMPTY_KEY ? null : String(key))}
      isRequired={required}
      isInvalid={error !== undefined}
      isDisabled={disabled}
      validationBehavior="aria"
      placeholder={disabledReason ?? placeholder}
      name={name}
    >
      <FieldLabel label={label} required={required} />
      <Button className={field.control}>
        <SelectValue className={styles.value}>
          {({ isPlaceholder }) =>
            isPlaceholder ? (
              <span className={styles.placeholder}>{disabledReason ?? placeholder}</span>
            ) : selected ? (
              <ItemText item={selected} />
            ) : (
              emptyLabel
            )
          }
        </SelectValue>
        <Icon name="chevron-down" className={styles.chevron} />
      </Button>
      <FieldMessages error={error} disabledReason={disabledReason} />
      <Popover
        className={styles.popover}
        placement="bottom start"
        offset={POPOVER_OFFSET_PX}
        // 층 순서는 토큰(--z-popover)을 따르도록 React Aria의 기본 z-index를 뺍니다
        style={({ defaultStyle }) => ({ ...defaultStyle, zIndex: undefined })}
      >
        {items.length > SELECT_SEARCH_THRESHOLD ? (
          <SearchableList items={items} emptyLabel={emptyLabel} />
        ) : (
          <OptionList items={items} emptyLabel={emptyLabel} />
        )}
      </Popover>
    </AriaSelect>
  );
}

function SearchableList({ items, emptyLabel }: { items: readonly SelectItem[]; emptyLabel: string | undefined }) {
  const { contains } = useFilter({ sensitivity: "base" });
  const hasCode = items.some((item) => item.code !== undefined);
  return (
    <Autocomplete filter={contains}>
      <SearchField className={styles.search} aria-label="검색" autoFocus>
        <Icon name="search" className={styles.searchIcon} />
        <Input
          className={cx(field.control, styles.searchInput)}
          placeholder={hasCode ? "코드나 이름으로 검색" : "검색"}
        />
      </SearchField>
      <OptionList items={items} emptyLabel={emptyLabel} />
    </Autocomplete>
  );
}

function OptionList({ items, emptyLabel }: { items: readonly SelectItem[]; emptyLabel: string | undefined }) {
  const options: ReactElement[] = [];
  if (emptyLabel !== undefined) {
    options.push(
      <ListBoxItem key={EMPTY_KEY} id={EMPTY_KEY} textValue={emptyLabel} className={cx(styles.item, styles.emptyItem)}>
        <Icon name="check" className={styles.check} />
        {emptyLabel}
      </ListBoxItem>,
      <Separator key="separator" className={styles.separator} />,
    );
  }
  for (const item of items) {
    options.push(
      <ListBoxItem
        key={item.value}
        id={item.value}
        textValue={item.code ? `${item.code} ${item.name}` : item.name}
        className={styles.item}
      >
        <Icon name="check" className={styles.check} />
        <ItemText item={item} />
        {item.meta && <span className={styles.meta}>{item.meta}</span>}
      </ListBoxItem>,
    );
  }
  return (
    <ListBox className={styles.list} renderEmptyState={() => <div className={styles.empty}>검색 결과가 없습니다.</div>}>
      {options}
    </ListBox>
  );
}

/** '코드 · 이름'. 이름은 보조 글자색입니다 */
function ItemText({ item }: { item: SelectItem }) {
  if (!item.code) return <span className={styles.text}>{item.name}</span>;
  return (
    <span className={styles.text}>
      <span className={field.code}>{item.code}</span> <span className={styles.name}>· {item.name}</span>
    </span>
  );
}

/** 읽기 전용: 고를 수 없으므로 목록 없이 값만 가라앉은 칸에 보입니다 */
function ReadOnlySelect({ label, items, value, emptyLabel, required = false, placeholder = "선택" }: SelectProps) {
  const selected = items.find((item) => item.value === value);
  return (
    <ReadOnlyField label={label} required={required}>
      <span className={styles.value}>
        {selected ? (
          <ItemText item={selected} />
        ) : (
          (emptyLabel ?? <span className={styles.placeholder}>{placeholder}</span>)
        )}
      </span>
    </ReadOnlyField>
  );
}
