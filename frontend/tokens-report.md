# 디자인 토큰 대비 검사

`scripts/build-tokens.mjs`(`npm run tokens`)가 만듭니다. 손으로 고치지 않습니다. 규칙은 `docs/design-guide.md`에 있습니다.
값은 WCAG 대비 비율입니다. 투명도 색은 그 바탕 위에 얹은 결과로 잽니다.

## 라이트

### 색 값

| 토큰 | hex | 정한 값 |
| --- | --- | --- |
| `bg-app` | `#EFEEEC` | oklch(0.95 0.003 85) |
| `bg-surface` | `#FAFAF9` | oklch(0.985 0.0015 85) |
| `bg-sunken` | `#F1F0EE` | oklch(0.955 0.003 85) |
| `text-disabled` | `#8D8C8A` | oklch(0.64 0.003 85) |
| `text-subtle` | `#6A6967` | oklch(0.52 0.003 85) |
| `text-muted` | `#4E4D4B` | oklch(0.42 0.003 85) |
| `text` | `#222120` | oklch(0.25 0.003 85) |
| `primary-hover` | `#363534` | oklch(0.33 0.003 85) |
| `primary-press` | `#484746` | oklch(0.4 0.003 85) |
| `positive` | `#137738` | oklch(0.5 0.13 150) |
| `negative` | `#B63132` | oklch(0.52 0.17 25) |
| `warning` | `#8D5E00` | oklch(0.52 0.11 75) |
| `agent` | `#6C4AB3` | oklch(0.5 0.16 295) |
| `brand-heritage` | `#A50034` | LG Heritage Red |
| `brand-active` | `#FD312E` | LG Active Red |

### 글자

모든 글자는 네 바탕 위에서 4.5 이상입니다(WCAG 1.4.3). 본문과 보조 글자는 오래 읽는 창 바탕과 패널 위에서 더 높게 둡니다(본문 ≥ 12, 보조 ≥ 7).

| 글자 \ 바탕 | bg-app | bg-surface | bg-sunken | bg-raised |
| --- | --- | --- | --- | --- |
| `text` | 13.8 ✓ | 15.3 ✓ | 14.0 ✓ | 15.3 ✓ |
| `text-muted` | 7.3 ✓ | 8.1 ✓ | 7.4 ✓ | 8.1 ✓ |
| `text-subtle` | 4.8 ✓ | 5.3 ✓ | 4.8 ✓ | 5.3 ✓ |

비활성 글자는 안내 글자보다 흐리고, 창 바탕·패널·조회 조건 위에서 2.5 이상입니다(WCAG 예외, 무엇인지는 읽혀야 합니다).

| 글자 \ 바탕 | bg-app | bg-surface | bg-sunken |
| --- | --- | --- | --- |
| `text-disabled` | 2.9 ✓ | 3.2 ✓ | 3.0 ✓ |

### 의미색 글자 (패널, 조회 조건, 자기 옅은 면 위 ≥ 4.5)

| 의미색 | bg-surface | bg-sunken | -soft (패널 위) |
| --- | --- | --- | --- |
| `positive` | 5.4 ✓ | 5.0 ✓ | 4.6 ✓ |
| `negative` | 5.8 ✓ | 5.3 ✓ | 4.8 ✓ |
| `warning` | 5.4 ✓ | 4.9 ✓ | 4.6 ✓ |
| `agent` | 6.2 ✓ | 5.6 ✓ | 5.2 ✓ |

### 주요 버튼 글자 (기본, 마우스 올림, 누름 모두 ≥ 4.5)

| 면 | on-primary |
| --- | --- |
| `primary` | 15.3 ✓ |
| `primary-hover` | 11.7 ✓ |
| `primary-press` | 8.8 ✓ |

### 상태 단계 (바탕 위에 얹은 결과의 OKLCH 명도 차이 ΔL)

마우스 올림 < 누름 < 선택이고, 이웃 단계와 0.015 이상 차이 납니다.

| 바탕 | bg-hover | bg-press | bg-selected |
| --- | --- | --- | --- |
| `bg-app` | 0.033 | 0.060 | 0.087 ✓ |
| `bg-surface` | 0.035 | 0.063 | 0.091 ✓ |
| `bg-sunken` | 0.034 | 0.061 | 0.088 ✓ |

### 글자가 아닌 표시 (≥ 3, WCAG 1.4.11)

| 표시 | bg-app | bg-surface | bg-sunken |
| --- | --- | --- | --- |
| border-input (입력 칸 테두리) | 3.4 ✓ | 3.5 ✓ | 3.4 ✓ |
| brand-bar (활성 메뉴 표시선) | 6.8 ✓ | 7.6 ✓ | 7.0 ✓ |

### 참고: 구분선과 면 (기준 없음)

| 표시 | bg-app | bg-surface | bg-sunken |
| --- | --- | --- | --- |
| `border` (α 0.13) | 1.3 | 1.3 | 1.3 |
| `border-strong` (α 0.26) | 1.8 | 1.8 | 1.8 |
| `bg-hover` (α 0.05) | 1.1 | 1.1 | 1.1 |
| `bg-selected` (α 0.13) | 1.3 | 1.3 | 1.3 |

## 다크

### 색 값

| 토큰 | hex | 정한 값 |
| --- | --- | --- |
| `bg-app` | `#0C0F12` | oklch(0.165 0.008 250) |
| `bg-surface` | `#14171B` | oklch(0.205 0.008 250) |
| `bg-sunken` | `#1E2124` | oklch(0.245 0.008 250) |
| `bg-raised` | `#282C2F` | oklch(0.29 0.008 250) |
| `text-subtle` | `#8F9397` | oklch(0.66 0.008 250) |
| `text-disabled` | `#66696D` | oklch(0.52 0.008 250) |
| `text-muted` | `#AAAEB3` | oklch(0.75 0.008 250) |
| `text` | `#E1E3E5` | oklch(0.915 0.004 250) |
| `primary-hover` | `#CCCED0` | oklch(0.85 0.004 250) |
| `primary-press` | `#B9BBBD` | oklch(0.79 0.004 250) |
| `positive` | `#6FC884` | oklch(0.76 0.13 150) |
| `negative` | `#FF847D` | oklch(0.75 0.15 25) |
| `warning` | `#E3B25A` | oklch(0.79 0.12 80) |
| `agent` | `#B7A1F5` | oklch(0.76 0.12 295) |
| `brand-heritage` | `#A50034` | LG Heritage Red |
| `brand-active` | `#FD312E` | LG Active Red |

### 글자

모든 글자는 네 바탕 위에서 4.5 이상입니다(WCAG 1.4.3). 본문과 보조 글자는 오래 읽는 창 바탕과 패널 위에서 더 높게 둡니다(본문 ≥ 12, 보조 ≥ 7).

| 글자 \ 바탕 | bg-app | bg-surface | bg-sunken | bg-raised |
| --- | --- | --- | --- | --- |
| `text` | 15.0 ✓ | 13.9 ✓ | 12.6 ✓ | 11.0 ✓ |
| `text-muted` | 8.7 ✓ | 8.1 ✓ | 7.3 ✓ | 6.3 ✓ |
| `text-subtle` | 6.2 ✓ | 5.8 ✓ | 5.2 ✓ | 4.5 ✓ |

비활성 글자는 안내 글자보다 흐리고, 창 바탕·패널·조회 조건 위에서 2.5 이상입니다(WCAG 예외, 무엇인지는 읽혀야 합니다).

| 글자 \ 바탕 | bg-app | bg-surface | bg-sunken |
| --- | --- | --- | --- |
| `text-disabled` | 3.5 ✓ | 3.3 ✓ | 2.9 ✓ |

### 의미색 글자 (패널, 조회 조건, 자기 옅은 면 위 ≥ 4.5)

| 의미색 | bg-surface | bg-sunken | -soft (패널 위) |
| --- | --- | --- | --- |
| `positive` | 8.8 ✓ | 7.9 ✓ | 6.7 ✓ |
| `negative` | 7.6 ✓ | 6.8 ✓ | 6.0 ✓ |
| `warning` | 9.2 ✓ | 8.3 ✓ | 7.0 ✓ |
| `agent` | 8.1 ✓ | 7.3 ✓ | 6.3 ✓ |

### 주요 버튼 글자 (기본, 마우스 올림, 누름 모두 ≥ 4.5)

| 면 | on-primary |
| --- | --- |
| `primary` | 13.9 ✓ |
| `primary-hover` | 11.3 ✓ |
| `primary-press` | 9.3 ✓ |

### 상태 단계 (바탕 위에 얹은 결과의 OKLCH 명도 차이 ΔL)

마우스 올림 < 누름 < 선택이고, 이웃 단계와 0.015 이상 차이 납니다.

| 바탕 | bg-hover | bg-press | bg-selected |
| --- | --- | --- | --- |
| `bg-app` | 0.043 | 0.075 | 0.105 ✓ |
| `bg-surface` | 0.040 | 0.069 | 0.097 ✓ |
| `bg-sunken` | 0.037 | 0.064 | 0.090 ✓ |

### 글자가 아닌 표시 (≥ 3, WCAG 1.4.11)

| 표시 | bg-app | bg-surface | bg-sunken |
| --- | --- | --- | --- |
| border-input (입력 칸 테두리) | 3.3 ✓ | 3.3 ✓ | 3.3 ✓ |
| brand-bar (활성 메뉴 표시선) | 5.2 ✓ | 4.8 ✓ | 4.4 ✓ |

### 참고: 구분선과 면 (기준 없음)

| 표시 | bg-app | bg-surface | bg-sunken |
| --- | --- | --- | --- |
| `border` (α 0.08) | 1.2 | 1.2 | 1.3 |
| `border-strong` (α 0.16) | 1.6 | 1.6 | 1.7 |
| `bg-hover` (α 0.04) | 1.1 | 1.1 | 1.1 |
| `bg-selected` (α 0.1) | 1.3 | 1.3 | 1.4 |

