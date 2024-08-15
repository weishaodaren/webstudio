import * as components from "./components";
import * as navigator from "./navigator";
import * as assets from "./assets";
import * as pages from "./pages";
// import * as marketplace from "./marketplace";
import type { TabContentProps, TabName } from "../types";
import type { ReactNode } from "react";
import type { IconComponent } from "@webstudio-is/icons";

type PanelExports = {
  TabContent: (props: TabContentProps) => ReactNode;
  Icon: IconComponent;
  label: ReactNode;
};

export const panels = new Map<TabName, PanelExports>([
  ["components", components],
  ["pages", pages],
  ["navigator", navigator],
  ["assets", assets],
  // 暂时隐藏
  // ["marketplace", marketplace],
]);
