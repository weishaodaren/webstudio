import type { StyleProperty } from "@webstudio-is/css-engine";
import { Box, Grid } from "@webstudio-is/design-system";
import {
  DashBorderIcon,
  DashedBorderIcon,
  DottedBorderIcon,
  SmallXIcon,
} from "@webstudio-is/icons";
import { PropertyName } from "../../shared/property-name";
import type { SectionProps } from "../shared/section";
import { ToggleGroupControl } from "../../controls/toggle-group/toggle-group-control";
import {
  declarationDescriptions,
  propertyDescriptions,
} from "@webstudio-is/css-data";
import {
  deleteAllProperties,
  setAllProperties,
  rowCss,
  isAdvancedValue,
} from "./utils";
import { useMemo } from "react";

export const properties: StyleProperty[] = [
  "borderTopStyle",
  "borderRightStyle",
  "borderLeftStyle",
  "borderBottomStyle",
] satisfies Array<StyleProperty>;

/**
 * Component
 */
export const BorderStyle = (
  props: Pick<
    SectionProps,
    "currentStyle" | "setProperty" | "deleteProperty" | "createBatchUpdate"
  > & {
    label: string;
    itemLabels: {
      noneStyleLabel: string;
      solidStyleLabel: string;
      dashedStyleLabel: string;
      dottedStyleLabel: string;
    };
    itemDescriptions: {
      borderBlockStyleNone: string;
      borderBlockStyleSolid: string;
      borderBlockStyleDashed: string;
      borderBlockStyleDotted: string;
    };
  }
) => {
  // We do not use shorthand properties such as borderWidth or borderRadius in our code.
  // However, in the UI, we can display a single field, and in that case, we can use any property
  // from the shorthand property set and pass it instead.
  const firstPropertyName = properties[0];

  const deleteBorderProperties = deleteAllProperties(
    properties,
    props.createBatchUpdate
  );

  const setBorderProperties = setAllProperties(
    properties,
    props.createBatchUpdate
  )(firstPropertyName);

  const handleDelete = () => deleteBorderProperties(firstPropertyName);

  /**
   * Memo
   * @description 风格单选框
   * @returns {JSX.Element}
   */
  const items = useMemo(
    () => [
      {
        child: <SmallXIcon />,
        title: props.itemLabels.noneStyleLabel,
        // description: declarationDescriptions["borderBlockStyle:none"],
        description: props.itemDescriptions.borderBlockStyleNone,
        value: "none",
        propertyValues: "border-style: none;",
      },
      {
        child: <DashBorderIcon />,
        title: props.itemLabels.solidStyleLabel,
        description: props.itemDescriptions.borderBlockStyleSolid,
        value: "solid",
        propertyValues: "border-style: solid;",
      },
      {
        child: <DashedBorderIcon />,
        title: props.itemLabels.dashedStyleLabel,
        description: props.itemDescriptions.borderBlockStyleDashed,
        value: "dashed",
        propertyValues: "border-style: dashed;",
      },
      {
        child: <DottedBorderIcon />,
        title: props.itemLabels.dottedStyleLabel,
        description: props.itemDescriptions.borderBlockStyleDotted,
        value: "dotted",
        propertyValues: "border-style: dotted;",
      },
    ],
    [
      props.itemDescriptions.borderBlockStyleDashed,
      props.itemDescriptions.borderBlockStyleDotted,
      props.itemDescriptions.borderBlockStyleNone,
      props.itemDescriptions.borderBlockStyleSolid,
      props.itemLabels.dashedStyleLabel,
      props.itemLabels.dottedStyleLabel,
      props.itemLabels.noneStyleLabel,
      props.itemLabels.solidStyleLabel,
    ]
  );

  return (
    <Grid css={rowCss}>
      <PropertyName
        style={props.currentStyle}
        properties={properties}
        label={props.label}
        description={propertyDescriptions.borderBlockStyle}
        onReset={handleDelete}
      />
      <Box css={{ gridColumn: `span 2`, justifySelf: "end" }}>
        <ToggleGroupControl
          {...props}
          items={items}
          property={firstPropertyName}
          deleteProperty={handleDelete}
          setProperty={() => setBorderProperties}
          isAdvanced={isAdvancedValue(properties, props.currentStyle)}
        />
      </Box>
    </Grid>
  );
};
