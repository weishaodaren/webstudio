import type { StyleProperty } from "@webstudio-is/css-engine";
import {
  BorderRadiusIndividualIcon,
  BorderRadiusBottomRightIcon,
  BorderRadiusTopLeftIcon,
  BorderRadiusTopRightIcon,
  BorderRadiusBottomLeftIcon,
} from "@webstudio-is/icons";
import type { SectionProps } from "../shared/section";
import { BorderProperty } from "./border-property";

export const properties = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
] satisfies Array<StyleProperty>;

const borderPropertyOptions = {
  borderTopLeftRadius: {
    icon: <BorderRadiusTopLeftIcon />,
  },
  borderTopRightRadius: {
    icon: <BorderRadiusTopRightIcon />,
  },
  borderBottomLeftRadius: {
    icon: <BorderRadiusBottomLeftIcon />,
  },
  borderBottomRightRadius: {
    icon: <BorderRadiusBottomRightIcon />,
  },
} as const satisfies Partial<{ [property in StyleProperty]: unknown }>;

/**
 * Component
 */
export const BorderRadius = (
  props: Pick<
    SectionProps,
    "currentStyle" | "setProperty" | "deleteProperty" | "createBatchUpdate"
  > & { label: string; description: string }
) => {
  return (
    <BorderProperty
      currentStyle={props.currentStyle}
      setProperty={props.setProperty}
      deleteProperty={props.deleteProperty}
      createBatchUpdate={props.createBatchUpdate}
      label={props.label}
      description={props.description}
      borderPropertyOptions={borderPropertyOptions}
      individualModeIcon={<BorderRadiusIndividualIcon />}
    />
  );
};
