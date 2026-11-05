import { lazy } from "react";

export const screens = {
  "system.info": lazy(() => import("./system/SystemInfoScreen")),
};

export type ScreenId = keyof typeof screens;
