import { ListIcon } from "@webstudio-is/icons/svg";
import {
  defaultStates,
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import { ol, ul } from "@webstudio-is/react-sdk/css-normalize";
import { props } from "./__generated__/list.props";
import type { ListTag } from "./list";

const presetStyle = {
  ol: [
    ...ol,
    {
      property: "marginTop",
      value: { type: "keyword", value: "0" },
    },
    {
      property: "marginBottom",
      value: { type: "keyword", value: "10px" },
    },
    {
      property: "paddingLeft",
      value: { type: "keyword", value: "40px" },
    },
  ],
  ul: [
    ...ul,
    {
      property: "marginTop",
      value: { type: "keyword", value: "0" },
    },
    {
      property: "marginBottom",
      value: { type: "keyword", value: "10px" },
    },
    {
      property: "paddingLeft",
      value: { type: "keyword", value: "40px" },
    },
  ],
} satisfies PresetStyle<ListTag>;

export const meta: WsComponentMeta = {
  category: "general",
  type: "container",
  icon: ListIcon,
  states: defaultStates,
  presetStyle,
  order: 3,
  template: [
    {
      type: "instance",
      component: "List",
      children: [
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
    },
  ],
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: ["id", "className", "ordered", "start", "reversed"],
};
