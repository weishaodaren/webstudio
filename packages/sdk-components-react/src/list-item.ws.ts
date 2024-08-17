import { ListItemIcon } from "@webstudio-is/icons/svg";
import {
  defaultStates,
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import { li } from "@webstudio-is/react-sdk/css-normalize";
import type { defaultTag } from "./list-item";
import { props } from "./__generated__/list-item.props";

const presetStyle = {
  li,
} satisfies PresetStyle<typeof defaultTag>;

export const meta: WsComponentMeta = {
  category: "general",
  type: "container",
  requiredAncestors: ["List"],
  icon: ListItemIcon,
  states: defaultStates,
  presetStyle,
  order: 4,
  template: [
    {
      type: "instance",
      component: "ListItem",
      children: [
        {
          type: "text",
          value: "可编辑的列表项",
          placeholder: true,
        },
      ],
    },
  ],
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: ["id", "className"],
};
