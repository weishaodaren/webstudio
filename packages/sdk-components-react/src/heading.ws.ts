import { HeadingIcon } from "@webstudio-is/icons/svg";
import type { ComponentProps } from "react";
import {
  defaultStates,
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import { h1, h2, h3, h4, h5, h6 } from "@webstudio-is/react-sdk/css-normalize";
import type { Heading } from "./heading";
import { props } from "./__generated__/heading.props";

type HeadingTags = NonNullable<ComponentProps<typeof Heading>["tag"]>;

const presetStyle = {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
} satisfies PresetStyle<HeadingTags>;

export const meta: WsComponentMeta = {
  category: "text",
  type: "container",
  icon: HeadingIcon,
  invalidAncestors: ["Heading"],
  states: defaultStates,
  presetStyle,
  order: 1,
  template: [
    {
      type: "instance",
      component: "标题",
      children: [
        {
          type: "text",
          value: "可编辑的标题文案",
          placeholder: true,
        },
      ],
    },
  ],
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: ["id", "className", "tag"],
};
