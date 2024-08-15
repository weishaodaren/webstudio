import { FormTextFieldIcon } from "@webstudio-is/icons/svg";
import {
  defaultStates,
  type PresetStyle,
  type WsComponentMeta,
  type WsComponentPropsMeta,
} from "@webstudio-is/react-sdk";
import { input } from "@webstudio-is/react-sdk/css-normalize";
import type { defaultTag } from "./input";
import { props } from "./__generated__/input.props";

const presetStyle = {
  input: [
    ...input,
    {
      property: "display",
      value: { type: "keyword", value: "block" },
    },
  ],
} satisfies PresetStyle<typeof defaultTag>;

export const meta: WsComponentMeta = {
  category: "forms",
  invalidAncestors: ["Button", "Link"],
  type: "control",
  icon: FormTextFieldIcon,
  presetStyle,
  order: 3,
  states: [
    ...defaultStates,
    { selector: "::placeholder", label: "Placeholder" },
    { selector: ":valid", label: "Valid" },
    { selector: ":invalid", label: "Invalid" },
    { selector: ":required", label: "Required" },
    { selector: ":optional", label: "Optional" },
    // Additional states will go into submenu
    //{ selector: ":disabled", label: "Disabled" },
    //{ selector: ":enabled", label: "Enabled" },
    //{ selector: ":read-only", label: "Read Only" },
    //{ selector: ":read-write", label: "Read Write" },
  ],
};

export const propsMeta: WsComponentPropsMeta = {
  props,
  initialProps: [
    "id",
    "className",
    "name",
    "type",
    "placeholder",
    "required",
    "autoFocus",
  ],
};
