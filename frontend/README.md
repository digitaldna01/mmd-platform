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
| `npm run build` | 타입 체크와 운영 빌드 |
| `npm run build-storybook` | Storybook 빌드 |
| `npm run check:api` | API 코드 재생성과 타입 체크 |

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
- 에러는 `shared/feedback/ErrorNotice`로 표시합니다. 사용자 메시지와 추적 ID가 함께 나옵니다.
- 스타일은 CSS Modules로 쓰고, 색상과 간격은 `shared/styles/tokens.css`의 CSS 변수를 씁니다.
- `tokens.css`의 값은 임시입니다. 상용 그리드와 디자인을 정할 때 바꿉니다.
