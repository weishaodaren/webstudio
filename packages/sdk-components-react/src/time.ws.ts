import { CalendarIcon } from "@webstudio-is/icons/svg";

import {
  defaultStates,
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";

import { time } from "@webstudio-is/react-sdk/css-normalize";

import { props } from "./__generated__/time.props";

const presetStyle = {
  time,
} satisfies PresetStyle<"time">;

export const meta: WsComponentMeta = {
  category: "data",
  type: "container",
  icon: CalendarIcon,
  states: defaultStates,
  presetStyle,
  order: 5,
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: ["datetime", "language", "country", "dateStyle", "timeStyle"],
};
