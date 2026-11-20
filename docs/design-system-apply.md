# 디자인 시스템 적용 안내

이 레포의 디자인 시스템(규칙, 토큰, 컴포넌트)을 다른 레포로 옮길 때 보는 문서입니다. 회사 서버의 MMD 화면 목업 레포에 적용하는 경우를 기준으로 씁니다.

이 문서는 순서대로 따라 하도록 썼습니다. 문서에 없는 값이나 모양을 새로 만들지 않습니다. 정해지지 않은 것을 만나면 멈추고 사용자에게 묻습니다.

## 1. 먼저 지킬 것

- 공개 저장소 `digitaldna01/mmd-platform`에 회사 코드, 회사 화면 사진, LG EI 글꼴 파일을 push하지 않습니다. 회사에서는 사내 Git으로 옮긴 이 레포만 씁니다.
- 원본은 이 레포(사내 Git의 mmd-platform)입니다. 옮겨 간 레포에서 토큰 값, 컴포넌트 모양, 규칙을 바꾸지 않습니다. 바꿔야 하면 이 레포의 `docs/design-guide.md`와 스크립트를 먼저 고치고 다시 옮깁니다.
- `modernizer/` 레포는 읽기 전용입니다.

## 2. 원본 위치

| 무엇 | 원본 | 설명 |
| --- | --- | --- |
| 결정과 규칙 | `docs/design-guide.md` | 색, 글꼴, 간격, 컴포넌트, 화면 골격. 모든 값의 이유가 있습니다 |
| 토큰 값 | `frontend/scripts/build-tokens.mjs` | `npm run tokens`가 `tokens.css`와 대비 검사 결과 `tokens-report.md`를 만듭니다 |
| 토큰 CSS | `frontend/src/shared/styles/tokens.css` | 만들어진 파일입니다. 손으로 고치지 않습니다 |
| 컴포넌트 | `frontend/src/shared/ui/` | 버튼, 입력창, 선택 상자, Y/N, 알림, 화면 틀 등. 테스트와 스토리가 옆에 있습니다 |
| 아이콘 | `frontend/scripts/build-icons.mjs`, `frontend/src/shared/icons/` | Fluent UI 아이콘에서 쓰는 것만 뽑아 만듭니다 |
| 날짜·숫자·빈 값 표기 | `frontend/src/shared/format/` | 화면에 값을 쓸 때 이 함수만 씁니다 |
| 오류·로딩 표시 | `frontend/src/shared/feedback/` | 조회 실패, 화면 오류 경계 |
| CSS 검사 | `frontend/stylelint.config.mjs` | 색, 크기, 시간 값을 토큰으로만 쓰게 막습니다 |
| 화면 만드는 순서와 규칙 | `frontend/README.md` | '새 화면 만들기', '규칙' |
| 라이브러리 결정 | `docs/adr/0003-frontend-foundation.md`, `docs/adr/0007-headless-ui-library.md` | React Aria를 쓰는 이유와 경계 |
| 패키지 버전 | `docs/import-list.md`, `frontend/package-lock.json` | 사내 저장소에 반입할 때 기준 |

## 3. 읽는 순서

옮기기 전에 아래를 순서대로 읽습니다. 괄호 안은 그 절에서 가져갈 것입니다.

1. `docs/design-guide.md` '컨셉', '확인 기준' (키워드 Precision, Clarity, Calm, Intelligent와 화면을 검토하는 기준)
2. '색' 전체 (뉴트럴, 의미색, 기준정보 상태, **서버 목업 토큰과의 대응**)
3. '토큰 파일과 Storybook', 'CSS 검사' (토큰을 바꾸는 방법과 막히는 값)
4. '컴포넌트' 중 옮길 화면에 나오는 절 (사이드 메뉴, 화면 머리, 탭, 조회 조건, 입력창과 선택 상자, 버튼, Y/N 값, 빈 상태, 오류를 보이는 자리, 확인 창을 띄우는 때)
5. '화면 골격과 반응형' (메뉴, 조회 조건, 그리드, 에이전트 패널의 자리와 창 폭별 동작)
6. `frontend/README.md` '규칙'
7. 이 레포에서 `cd frontend && npm ci && npm run storybook`을 실행하고 '기초'와 '컴포넌트' 페이지를 봅니다. 옮기는 동안 옆에 띄워 두고 비교합니다.

## 4. 대상 레포 확인

옮기기 전에 대상 레포에서 아래를 확인하고 적어 둡니다.

| 확인할 것 | 이 레포 | 다를 때 |
| --- | --- | --- |
| 화면 라이브러리 | React 19.3.1 | React 18이면 옮긴 뒤 타입 체크와 테스트로 확인합니다. React가 아니면 멈추고 묻습니다 |
| 빌드 도구 | Vite 8.3.6 | Vite가 아니면 멈추고 묻습니다(`@react-aria/optimize-locales-plugin`, Storybook 설정이 Vite 기준) |
| 스타일 방식 | CSS Modules(`*.module.css`) + CSS 변수 | Tailwind, styled-components 등을 쓰면 컴포넌트는 그대로 CSS Modules로 옮기고, 화면 쪽 스타일만 차례로 바꿉니다. 같은 요소에 두 방식을 섞지 않습니다 |
| 전역 CSS | `shared/styles/global.css` 하나 | 기존 전역 CSS(`body`, `button`, `input`, 리셋, Tailwind preflight)가 컴포넌트 모양을 덮을 수 있습니다. 6단계에서 확인합니다 |
| UI 라이브러리 | 없음(React Aria만 `shared/ui` 안에서) | MUI, antd 등을 쓰면 같은 종류의 컴포넌트를 섞지 않고 `shared/ui`로 바꿉니다 |
| 토큰 이름 | `--bg-app`, `--text`, `--border` 등(가이드 '토큰 이름') | 목업의 옛 토큰은 가이드 '서버 목업 토큰과의 대응'으로 바꿉니다. 대응표에 없는 이름은 멈추고 묻습니다 |
| 화면 이동 | `AppShell`의 `current`, `onNavigate` | react-router 등을 쓰면 `onNavigate`에서 라우터로 이동하고, `current`에 지금 화면 ID를 넘깁니다 |
| API 오류 타입 | `src/api/client.ts`의 `ApiRequestError`(status, code, message, traceId) | `shared/feedback/ErrorNotice.tsx`와 `shared/ui/Feedback.stories.tsx`의 import만 대상 레포의 오류 타입으로 바꿉니다 |
| Node.js, npm 접속 | Node 26, npm 레지스트리 | 접속이 안 되면 `docs/import-list.md`의 버전으로 사내 저장소에 반입합니다 |

## 5. 옮기기

경로는 대상 레포의 FE 폴더(`package.json`이 있는 곳)를 기준으로 씁니다. **폴더 구조를 이 레포와 같게 둡니다.** 스크립트가 `scripts/` 기준으로 `../src/shared/...`에 파일을 쓰고, 컴포넌트끼리 상대 경로로 import합니다.

### 5-1. 패키지

버전을 그대로(`^` 없이) 추가합니다.

| 패키지 | 버전 | 종류 |
| --- | --- | --- |
| `react-aria-components` | 1.22.1 | dependencies |
| `pretendard` | 1.3.9 | dependencies |
| `d2coding` | 1.3.2 | dependencies |
| `@react-aria/optimize-locales-plugin` | 2.1.0 | devDependencies |
| `stylelint` | 17.16.0 | devDependencies |
| `@fluentui/svg-icons` | 1.1.345 | devDependencies |
| `storybook`, `@storybook/react-vite` | 10.6.5 | devDependencies (컴포넌트 확인용, 권장) |
| `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom` | 5.1.0, 31.0.0, 16.3.3, 10.4.2 | devDependencies (컴포넌트 테스트) |

### 5-2. 파일 복사

| 이 레포 | 대상 레포 | 주의 |
| --- | --- | --- |
| `frontend/scripts/build-tokens.mjs` | `scripts/build-tokens.mjs` | 고치지 않습니다 |
| `frontend/scripts/build-icons.mjs` | `scripts/build-icons.mjs` | 고치지 않습니다 |
| `frontend/stylelint.config.mjs` | `stylelint.config.mjs` | 고치지 않습니다 |
| `frontend/src/shared/styles/` 전체 | `src/shared/styles/` | `foundations/`는 Storybook '기초' 페이지입니다. 함께 옮깁니다 |
| `frontend/src/shared/icons/` 전체 | `src/shared/icons/` | |
| `frontend/src/shared/format/` 전체 | `src/shared/format/` | |
| `frontend/src/shared/ui/` 전체 | `src/shared/ui/` | 테스트(`*.test.tsx`)와 스토리(`*.stories.tsx`)도 옮깁니다. `Feedback.stories.tsx`의 `ApiRequestError` import는 대상 레포의 오류 타입으로 바꿉니다 |
| `frontend/src/shared/feedback/` 전체 | `src/shared/feedback/` | `ErrorNotice.tsx`의 `ApiRequestError` import를 대상 레포의 오류 타입으로 바꿉니다 |
| `frontend/.storybook/preview.ts` | `.storybook/preview.ts` | 대상에 이미 있으면 `globalTypes`(테마, 글자 크기, 모니터), `decorators`(UiProvider), `global.css` import를 합칩니다 |
| `frontend/src/test-setup.ts` | `src/test-setup.ts` | 대상에 이미 있으면 내용을 합칩니다 |

### 5-3. 설정

1. `package.json`의 `scripts`에 더합니다.

   ```json
   "tokens": "node scripts/build-tokens.mjs",
   "tokens:check": "node scripts/build-tokens.mjs --check",
   "icons": "node scripts/build-icons.mjs",
   "icons:check": "node scripts/build-icons.mjs --check",
   "lint:css": "stylelint \"src/**/*.css\""
   ```

   `build` 앞에 `npm run tokens:check && npm run icons:check && npm run lint:css &&`를 붙입니다. 기존 화면이 남아 있는 동안은 6단계의 '검사 범위'를 따릅니다.

2. `vite.config`의 `plugins`에 `optimizeLocales.vite({ locales: ["ko-KR"] })`를 더합니다(`import optimizeLocales from "@react-aria/optimize-locales-plugin"`). 테스트 설정(`environment: "jsdom"`, `setupFiles`)은 이 레포의 `frontend/vite.config.ts`를 봅니다.

3. 앱 시작 파일(`main.tsx`)에서 전역 스타일과 화면 설정을 한 번 적용합니다.

   ```ts
   import { applyDisplaySettings, readDisplaySettings, watchScreenSize } from "./shared/styles/display";
   import "./shared/styles/global.css";

   watchScreenSize();
   applyDisplaySettings(readDisplaySettings());
   ```

4. 앱 맨 바깥을 `UiProvider`로 감싸고, 화면을 `AppShell` 안에 둡니다. 예는 이 레포의 `frontend/src/app/App.tsx`와 메뉴 정의 `frontend/src/app/menu.ts`입니다.

   ```tsx
   <UiProvider>
     <AppShell menu={menu} current={screenId} onNavigate={navigate} menuSearch={MENU_SEARCH}>
       {화면}
     </AppShell>
   </UiProvider>
   ```

### 5-4. 확인

아래가 모두 통과해야 다음 단계로 갑니다.

```bash
npm run tokens:check   # tokens.css가 스크립트와 같음
npm run icons:check    # 아이콘 파일이 스크립트와 같음
npx stylelint "src/shared/**/*.css"
npx tsc --noEmit
npm test
npm run build-storybook
```

Storybook '기초/색' 페이지의 값이 이 레포와 같은지 봅니다. 라이트 기준 메뉴 `#EDEFF0`, 본문 바탕 `#F5F7F9`, 패널 `#FCFDFE`, 그리드 머리글 `#EFF0F2`입니다. 도구 막대에서 다크, 글자 크게, 넓은 모니터도 바꿔 봅니다.

## 6. 기존 화면 옮기기

### 순서

1. **전역 CSS부터 정리합니다.** 기존 전역 CSS에서 `body`, `html`, `button`, `input`, `select`, `a`, `*`에 스타일을 주는 규칙을 찾습니다. `global.css`와 겹치거나 컴포넌트 모양을 바꾸는 규칙은 지웁니다. 지우기 전에 어떤 화면이 그 규칙에 기대는지 확인합니다.
2. **화면 틀을 바꿉니다.** 기존 사이드 메뉴와 레이아웃을 `AppShell`, `ScreenLayout`, `ScreenHeader`, `Tabs`, `QueryBar`, `WorkArea`로 바꿉니다(Storybook '컴포넌트/화면 틀').
3. **화면을 하나씩 옮깁니다.** 한 번에 한 화면만 옮기고, 옮길 때마다 5-4의 확인을 다시 합니다. 아래 '목업에서 바꿀 것'을 화면마다 확인합니다.

### 검사 범위

CSS 검사와 `shared/ui/boundaries.test.ts`(직접 쓴 `<button>`, `<input>`, `<select>`, `<textarea>`와 `shared/ui` 밖의 React Aria를 막는 테스트)는 기존 화면에서 처음에 실패합니다. 실패 목록이 곧 옮길 목록입니다. 검사를 끄지 않습니다.

옮기는 동안 빌드를 통과시켜야 하면 사용자와 정한 뒤 범위를 좁혀 시작합니다.

- `lint:css`를 `stylelint "src/shared/**/*.css" "src/<옮긴 화면 폴더>/**/*.css"`로 두고, 화면을 옮길 때마다 폴더를 더합니다.
- `boundaries.test.ts` 맨 위에 아직 옮기지 않은 폴더 목록을 두고 그 파일만 뺍니다. 주석에 '옮기기가 끝나면 비웁니다'라고 적습니다.
- 끝나면 `lint:css`를 `src/**/*.css`로 되돌리고 목록을 비웁니다(8단계 확인 목록).

### 목업에서 바꿀 것

가이드의 '서버 목업 토큰과의 대응'과 서버 목업 사진(2026-11-20)에서 본 것을 정리했습니다. 사진에서 본 항목은 실제 코드에서 다시 확인합니다.

| 목업에 있는 것 | 바꿀 것 | 가이드 절 |
| --- | --- | --- |
| 옛 바탕 값(`bg-app #F7F8FA`, `bg-surface #FFFFFF`, `bg-sunken #F1F3F6`, `bg-nav #EAEDF1`) | `tokens.css`의 같은 이름 토큰. 값은 손으로 넣지 않습니다 | 색 › 뉴트럴 |
| `bg-sunken`을 쓴 조회 조건 | `QueryBar`(패널 면 `bg-surface`). `bg-sunken`은 그리드 머리글, 읽기 전용 칸, 일반 안내 배너에만 씁니다 | 조회 조건 |
| 파랑 `bg-selected`, `bg-info` | 선택 행은 `--bg-selected`(투명도) + 글자색 2px 막대. 정보용 파랑은 없습니다. 안내는 `Banner`, 저장할 행은 그리드의 행 편집 상태 열(`+` `•` `−`) | 선택 표시, 의미색 |
| `bg-warning #FFF4E0` | `--bg-warning`(= `--warning-soft`) | 의미색 |
| 데모 안내 띠 (사진) | `<Banner tone="warning">` | 안내 배너 |
| 오른쪽 끝에 있는 조회·초기화 버튼 (사진) | 마지막 칸 바로 뒤. `QueryBar`가 맡습니다 | 조회 조건 |
| 점선 빈 상태 상자 (사진) | `EmptyState`. 점선을 쓰지 않습니다 | 빈 상태 |
| 메뉴 항목 `Route 관리 (SIC01051)` (사진) | 레거시 ID는 괄호 없이 D2Coding 안내 글자. `SideMenu`의 `legacyId` | 사이드 메뉴 |
| 활성 메뉴 항목 (사진) | 패널 면 + 구분선 윤곽 + 왼쪽 2px 브랜드 레드 막대. `SideMenu`가 맡습니다 | 사이드 메뉴 |
| 화면 설정 '밀도: 표준 / 넓게' (사진) | '글자 크기: 보통 / 크게'. 모니터 보정은 창 폭으로 자동입니다(`watchScreenSize`) | 크기 조정 |
| 화면 제목 아래 ID 줄 (사진) | `ScreenHeader`의 `ids` | 화면 머리 |
| 직접 쓴 `<button>`, `<input>`, `<select>`, `<textarea>` | `Button`, `TextInput`, `Select` | 버튼, 입력창과 선택 상자 |
| 사용여부 같은 Y/N 체크박스 | `YesNoField`(세그먼트 `Y \| N`) | Y/N 값 |
| 비활성 버튼 | `disabledReason`(이유를 툴팁으로 보입니다) | 버튼 |
| 기준정보 상태 배지의 옛 색 | 가이드의 상태별 글자, 테두리, 면, 앞 표시 | 기준정보 상태 |
| 손으로 만든 날짜·숫자 문자열 | `shared/format`의 `formatDateTime`, `formatNumber` 등 | 표기와 문구 |
| SVG를 붙여 넣은 아이콘 | `<Icon name="..." />`. 없는 아이콘은 이 레포의 `build-icons.mjs` 목록과 가이드 표에 먼저 더합니다 | 아이콘 |

## 7. 자주 하는 실수

- `tokens.css`를 손으로 고칩니다. → 이 레포의 가이드와 `build-tokens.mjs`를 고치고 `npm run tokens`로 다시 만든 뒤 옮깁니다.
- CSS에 `#fff`, `12px`, `150ms`, `!important`를 씁니다. → 토큰을 씁니다. 필요한 토큰이 없으면 검사를 끄지 말고 이 레포에 토큰을 더합니다.
- 화면에서 `react-aria-components`를 직접 import합니다. → `shared/ui`의 컴포넌트만 씁니다. 없으면 `shared/ui`에 먼저 만듭니다.
- 브랜드 레드를 버튼이나 넓은 면에 씁니다. → 로고 띠와 활성 메뉴 막대에만 씁니다. 주요 버튼은 차콜입니다.
- 순백(`#FFFFFF`)이나 순흑을 씁니다. → 패널은 `--bg-surface`입니다.
- 색만으로 상태를 나타냅니다. → 글자와 모양(체크, ×, !, 삼각형)을 함께 씁니다.
- 조회 조건에 접기 버튼을 둡니다. → 늘 펼쳐 둡니다. 덜 쓰는 조건은 그리드 열 필터로 옮깁니다.
- 오류를 확인 창으로 보입니다. → 오류는 일이 일어난 자리에 보입니다. 확인 창은 되돌릴 수 없을 때만 띄웁니다.
- 고칠 수 있는 화면에서 `useLeaveGuard`를 빠뜨립니다. → 저장하지 않은 변경 수를 넘깁니다.
- 라이트만 확인합니다. → Storybook 도구 막대에서 다크, 글자 크게, 넓은 모니터도 봅니다.
- 화면 설정 저장 키가 겹칩니다. → 이 레포는 브라우저 저장소에 `mmd.display`, `mmd.menu.collapsed`, `mmd.menu.openGroups`를 씁니다. 대상 레포가 같은 이름을 쓰는지 확인합니다.

## 8. 옮긴 뒤 확인 목록

- [ ] `npm run build`가 통과합니다(토큰, 아이콘, CSS 검사, 타입 체크 포함). `lint:css`가 `src/**/*.css` 전체를 봅니다.
- [ ] `npm test`가 통과합니다. `boundaries.test.ts`의 '아직 옮기지 않은 폴더' 목록이 비어 있습니다.
- [ ] 화면 코드에 hex 색, 옛 토큰 이름(`bg-info` 등), 직접 쓴 `<button>`이 없습니다.
- [ ] Storybook '기초/색'의 값이 이 레포와 같습니다.
- [ ] 창 폭 1600, 1280, 900에서 메뉴가 가이드 '화면 골격'대로 펼쳐지거나 서랍이 됩니다.
- [ ] 라이트, 다크, 글자 크게에서 대표 화면을 봅니다.
- [ ] 회사 모니터에서 노란빛이나 푸른빛이 도는지 봅니다. Night Shift, True Tone, Windows 야간 모드는 끄고 봅니다.

## 9. 아직 정하지 않은 것

회사에서 정합니다. 정하기 전에는 임시로 만들지 않고 사용자에게 묻습니다.

| 항목 | 정할 때 볼 것 |
| --- | --- |
| 상용 그리드 | 그리드 테마를 토큰에 맞출 수 있는지, Y/N 칸을 Y·N 키(한글 상태 ㅛ·ㅜ 포함)로 편집할 수 있는지, 새 행의 빈 필수 칸을 오류 셀로 보일 수 있는지. 가이드 '그리드' |
| 지원 브라우저 | 토큰은 hex로 출력해서 오래된 브라우저에서도 됩니다. `oklch()`, `color-mix()`를 쓰지 않습니다 |
| LG EI 글꼴 | 파일을 사내에서만 두고 `shared/styles/fonts.css`에 `@font-face`를 더합니다 |
| 시간대 | 날짜·시각 표기 함수의 기준 |
| 여러 화면을 함께 여는 방식(MDI) | 레거시 사용 습관을 확인한 뒤 정합니다 |
| 메뉴 검색 | `src/app/menu.ts`의 `MENU_SEARCH`(기본 켬)와 단축키 |
| 레거시 키보드 습관 | 그리드와 조회 조건의 키 동작 |
| 화면 설정 저장 위치 | 로그인이 생기면 브라우저 저장소에서 사용자 설정(BE)으로 옮깁니다 |

## 10. 모델에게 일을 맡길 때

한 번에 한 단계만 맡깁니다. 아래처럼 범위와 멈출 조건을 함께 줍니다.

```text
docs/design-system-apply.md의 5-2(파일 복사)만 해 줘.
- 표에 있는 파일만 옮기고, 옮긴 파일의 내용은 고치지 마.
- ErrorNotice.tsx와 Feedback.stories.tsx의 오류 타입 import만 우리 레포의 오류 타입으로 바꿔.
- 끝나면 5-4의 명령을 실행하고 결과를 그대로 보여 줘.
- 문서에 없는 값이나 모양이 필요하면 만들지 말고 멈춰서 물어 봐.
```

```text
docs/design-system-apply.md 6단계에 따라 '<화면 이름>' 화면 하나만 옮겨 줘.
- '목업에서 바꿀 것' 표를 이 화면에 하나씩 대 보고, 바꾼 것과 해당 없는 것을 목록으로 보여 줘.
- 색, 크기, 간격은 tokens.css의 변수만 써. 없는 토큰은 만들지 말고 물어 봐.
- 끝나면 npm run build와 npm test 결과를 보여 줘.
```
