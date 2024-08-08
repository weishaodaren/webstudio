import { useStore } from "@nanostores/react";
import { $tBorder, $tOutline, $tDeclarations } from "~/shared/nano-states";
import { Flex } from "@webstudio-is/design-system";
import type { StyleProperty } from "@webstudio-is/css-engine";
import type { SectionProps } from "../shared/section";
import { CollapsibleSection } from "../../shared/collapsible-section";
import {
  BorderRadius,
  properties as borderRadiusProperties,
} from "./border-radius";
import {
  BorderStyle,
  properties as borderStyleProperties,
} from "./border-style";
import {
  BorderWidth,
  properties as borderWidthProperties,
} from "./border-width";
import {
  BorderColor,
  properties as borderColorProperties,
} from "./border-color";

export const properties = [
  ...borderColorProperties,
  ...borderRadiusProperties,
  ...borderStyleProperties,
  ...borderWidthProperties,
] satisfies Array<StyleProperty>;

/**
 * Component
 */
export const Section = (props: SectionProps) => {
  /**
   * Store
   */
  const t = useStore($tBorder);
  const tOutline = useStore($tOutline);
  const tDeclarations = useStore($tDeclarations);

  return (
    <CollapsibleSection
      label={t.borders}
      currentStyle={props.currentStyle}
      properties={properties}
    >
      <Flex direction="column" gap={2}>
        <BorderStyle
          {...props}
          label={tOutline.style}
          itemLabels={{
            noneStyleLabel: t.borderStyleNone,
            solidStyleLabel: t.borderStyleSolid,
            dashedStyleLabel: t.borderStyleDashed,
            dottedStyleLabel: t.borderStyleDotted,
          }}
          itemDescriptions={{
            borderBlockStyleNone: tDeclarations["borderBlockStyle:none"],
            borderBlockStyleSolid: tDeclarations["borderBlockStyle:solid"],
            borderBlockStyleDashed: tDeclarations["borderBlockStyle:dashed"],
            borderBlockStyleDotted: tDeclarations["borderBlockStyle:dotted"],
          }}
        />
        <BorderColor
          {...props}
          label={tOutline.color}
          description={t.colorDescription}
        />
        <BorderWidth
          {...props}
          label={tOutline.width}
          description={t.widthDescription}
        />
        <BorderRadius
          {...props}
          label={t.radius}
          description={t.radiusDescription}
        />
      </Flex>
    </CollapsibleSection>
  );
};
