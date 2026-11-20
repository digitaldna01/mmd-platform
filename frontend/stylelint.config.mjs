/**
 * CSS 검사: 색과 크기 값은 디자인 토큰(src/shared/styles/tokens.css의 CSS 변수)으로만 씁니다.
 * 규칙과 이유: docs/design-guide.md 'CSS 검사'. 실행: npm run lint:css (npm run build에 포함)
 */

/** 토큰 이름으로 시작하는 값만 허용합니다 */
const token = (prefix) => new RegExp(`^var\\(--${prefix}`);

export default {
  ignoreFiles: [
    // 토큰 자체를 정의하는 파일 (scripts/build-tokens.mjs가 만듭니다)
    "src/shared/styles/tokens.css",
    // 글꼴 파일 선언 (@font-face의 font-family는 글꼴 이름입니다)
    "src/shared/styles/fonts.css",
    // '기초' 스토리의 그림. 규칙을 보여 주기 위한 것이라 화면에서 가져다 쓰지 않습니다
    "src/shared/styles/foundations/**",
  ],
  rules: {
    // 색: 토큰만
    "color-no-hex": true,
    "color-named": "never",
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hwb",
      "lab",
      "lch",
      "oklab",
      "oklch",
      "color",
      "color-mix",
    ],

    // 길이: 토큰만. 0, %, fr, vw·vh는 씁니다.
    // 화면 배치 구간은 변수를 쓸 수 없어 @media의 폭·높이와 @container에는 숫자를 씁니다(@container는 검사하지 않음)
    "unit-disallowed-list": [
      ["px", "rem", "em", "ex", "ch", "pt", "pc", "cm", "mm", "in", "q"],
      {
        ignoreMediaFeatureNames: {
          px: ["width", "min-width", "max-width", "height", "min-height", "max-height"],
        },
      },
    ],

    // 시간: 모션 토큰만
    "declaration-property-unit-disallowed-list": {
      "/^transition/": ["ms", "s"],
      "/^animation/": ["ms", "s"],
    },

    // 글꼴: font 줄임 속성은 값을 숨기므로 쓰지 않고, 각 속성은 토큰만
    "property-disallowed-list": ["font"],
    "declaration-property-value-allowed-list": {
      "font-size": [token("text-"), "inherit"],
      "font-weight": [token("weight-"), "inherit"],
      "font-family": [token("font-"), "inherit"],
      "line-height": [token("leading-"), "1", "inherit"],
      // 모서리마다 다르게 줄 때도 토큰과 0만 씁니다(예: 0 var(--radius-md) var(--radius-md) 0)
      "/radius$/": [/^((0|50%|var\(--radius-[a-z]+\))(\s+|$))+$/, "inherit"],
      "z-index": [token("z-"), /^calc\(var\(--z-/, "0", "1", "-1", "auto"],
    },

    // 스타일을 이기려고 !important를 쓰지 않습니다
    "declaration-no-important": true,
  },
};
