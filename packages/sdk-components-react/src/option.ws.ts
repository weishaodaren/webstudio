import { ItemIcon } from "@webstudio-is/icons/svg";
import {
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";

import type { defaultTag } from "./option";
import { props } from "./__generated__/option.props";

const presetStyle = {
  option: [
    {
      property: "backgroundColor",
      state: ":checked",
      value: {
        type: "rgb",
        alpha: 1,
        r: 209,
        g: 209,
        b: 209,
      },
    },
  ],
} satisfies PresetStyle<typeof defaultTag>;

export const meta: WsComponentMeta = {
  category: "hidden",
  // @todo: requiredAncestors should be ["Select", "Optgroup", "Datalist"] but that gives unreadable error when adding Select onto Canvas
  requiredAncestors: ["Select"],
  type: "control",
  description: "下拉菜单中的一项，用户可以将其选择为所选值。",
  icon: ItemIcon,
  presetStyle,
  states: [
    // Applies when option is being activated (clicked)
    { selector: ":active", label: "Active" },
    // Applies to the currently selected option
    { selector: ":checked", label: "Checked" },
    // For <option> elements: The :default pseudo-class selects the <option> that has the selected attribute when the page loads. This is true even if the user later selects a different option.
    { selector: ":default", label: "Default" },
    { selector: ":hover", label: "Hover" },
    { selector: ":disabled", label: "Disabled" },
  ],
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: ["label", "selected", "value", "label", "disabled"],
};
