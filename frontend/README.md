# MMD Frontend

React 화면 코드입니다. Node.js 26이 필요합니다.

## 준비

```bash
cd frontend
npm ci
```

`npm ci`가 React와 Storybook을 포함한 필요한 패키지를 모두 받고, `contracts/openapi/backend.json`에서 API 코드를 생성합니다.

## 명령

| 명령 | 내용 |
| ------------------------- | ------------------------------------------ |
| `npm run dev` | 개발 서버 (`http://localhost:5173`) |
| `npm run storybook` | Storybook (`http://localhost:6006`) |
| `npm test` | 테스트 |
| `npm run build` | 토큰·아이콘·CSS 검사, 타입 체크, 운영 빌드 |
| `npm run build-storybook` | Storybook 빌드 |
| `npm run check:api` | API 코드 재생성과 타입 체크 |
| `npm run tokens` | 디자인 토큰(`tokens.css`)과 대비 검사 결과 생성 |
| `npm run icons` | 아이콘(`icons.generated.ts`) 생성 |
| `npm run lint:css` | CSS 검사 (색과 크기는 토큰만) |

개발 서버는 `/api` 요청을 `http://localhost:8080`으로 넘깁니다. BE는 루트에서 `./gradlew :backend:bootRun`으로 실행합니다.

## 새 화면 만들기

`src/screens/system/`이 복사해서 시작하는 샘플입니다. LOT 이력 화면을 예로 듭니다.

1. `src/screens/system/`을 `src/screens/lot/`으로 복사하고 파일 이름을 `LotHistory...`로 바꿉니다.
2. `src/screens/registry.ts`에 화면 ID를 추가합니다.

   ```ts
   "lot.history": lazy(() => import("./lot/LotHistoryScreen")),
   ```

3. `LotHistoryView`와 스토리를 먼저 만듭니다. Storybook에서 BE 없이 정상, 로딩, 빈 결과, 에러 상태를 확인합니다.
4. `LotHistoryScreen`에서 생성된 API 훅을 `LotHistoryView`에 연결합니다.
5. `LotHistoryView` 테스트를 작성합니다.

아직 화면 배치가 없으므로, 앱에서 확인할 때는 `src/app/App.tsx`의 `screenId`를 새 화면 ID로 잠시 바꿉니다.

## 규칙

- `Screen`은 데이터를 연결하고 `View`는 받은 값을 표시합니다. `View`에서 API를 호출하지 않습니다.
- `Screen`은 지연 로딩을 위해 default export로 내보냅니다.
- API는 `src/api/generated/`의 훅과 함수만 씁니다. 이 폴더는 직접 고치지 않습니다.
- 오류는 일이 일어난 자리에 보입니다(디자인 가이드 '오류를 보이는 자리'). 조회 실패는 그리드 자리에 `shared/feedback/ErrorNotice`(사용자 메시지, 추적 ID, 다시 조회)로, 저장 실패는 걸린 칸의 오류 셀과 `useToast().error`로 보입니다. 오류를 확인 창으로 보이지 않습니다.
- 성공과 결과 안내는 `useToast()`, 늘 보이는 안내는 `Banner`, 그리드 자리의 조회 전·결과 없음·권한 없음은 `EmptyState`로 보입니다.
- 확인 창(`useConfirm`)은 삭제가 든 저장과 저장하지 않은 변경을 버릴 때만 띄웁니다. 평소 저장에는 띄우지 않습니다.
- 스타일은 CSS Modules로 쓰고, 색, 크기, 간격, 글꼴, 모서리, 층, 모션 시간은 `shared/styles/tokens.css`의 CSS 변수만 씁니다. 규칙과 토큰 이름은 `docs/design-guide.md`에 있고, Storybook의 '기초' 페이지에서 볼 수 있습니다.
- CSS에 `#fff`, `12px`, `150ms` 같은 값을 직접 쓰면 `npm run lint:css`(빌드에 포함)가 막습니다. 필요한 값이 토큰에 없으면 검사를 끄지 말고 토큰을 더합니다(디자인 가이드 'CSS 검사').
- `tokens.css`는 `scripts/build-tokens.mjs`가 만듭니다. 손으로 고치지 않고, 값을 바꿀 때는 디자인 가이드와 스크립트를 함께 고친 뒤 `npm run tokens`를 실행합니다.
- 버튼은 `shared/ui/Button`으로만 씁니다. `<button>`을 직접 쓰지 않습니다. 비활성은 `disabledReason`, 처리 중은 `busy`, 아이콘만 있는 버튼은 `icon`과 `label`로 만듭니다. Storybook '컴포넌트/버튼'에 쓰는 법과 놓는 자리가 있습니다.
- 입력창은 `shared/ui/TextInput`, 선택 상자는 `shared/ui/Select`로만 씁니다. `<input>`, `<select>`, `<textarea>`를 직접 쓰지 않습니다. 비워도 되는 선택 상자는 `emptyLabel`(조회 조건 '전체', 폼 '없음')을 줍니다. Storybook '컴포넌트/입력창과 선택 상자'에 조회 조건과 상세 폼 예가 있습니다.
- DB에 저장하는 Y/N 값(사용여부 등)은 `shared/ui/YesNoField`(세그먼트 `Y | N`)로 받습니다. 체크박스로 받지 않습니다. 체크박스(`Checkbox`)는 저장하지 않는 옵션과 여러 개 고르기에만, 짧은 선택지 2~4개는 `SegmentedControl`, 선택지마다 설명이 필요하면 `RadioGroup`을 씁니다.
- React Aria(`react-aria-components`)는 `shared/ui` 안에서만 가져옵니다. 화면에 필요한 컴포넌트가 없으면 `shared/ui`에 감싼 컴포넌트를 먼저 만듭니다(ADR-0007).
- `npm test`의 `shared/ui/boundaries.test.ts`가 위 두 규칙(직접 쓴 `<button>`·`<input>`·`<select>`·`<textarea>`, `shared/ui` 밖의 React Aria)을 검사합니다.
- 툴팁은 `shared/ui/Tooltip`으로, 기다림 표시는 `shared/ui/useDelayedBusy`와 `Spinner`로 씁니다.
- 아이콘은 `shared/icons/Icon`으로만 씁니다(`<Icon name="search" />`). 새 아이콘은 `scripts/build-icons.mjs`의 목록과 디자인 가이드의 표에 함께 더하고 `npm run icons`를 실행합니다. SVG를 직접 붙여 넣지 않습니다.
- 날짜, 시각, 숫자, 빈 값은 `shared/format`의 함수로만 화면에 씁니다(`formatDateTime`, `formatNumber` 등). 문구와 용어는 디자인 가이드의 '표기와 문구'를 따릅니다.
