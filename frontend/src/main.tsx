import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { watchScreenSize } from "./shared/styles/display";
import "./shared/styles/global.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root 요소가 없습니다.");
}

watchScreenSize();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
