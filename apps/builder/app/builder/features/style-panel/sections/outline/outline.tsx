import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $tOutline, $tDeclarations } from "~/shared/nano-states";
import { Flex, Grid, theme, Box } from "@webstudio-is/design-system";
import type { StyleProperty } from "@webstudio-is/css-engine";
import { ColorControl } from "../../controls";
import { CollapsibleSection } from "../../shared/collapsible-section";
import type { SectionProps } from "../shared/section";
import { OutlineStyle } from "./outline-style";
import { PropertyName } from "../../shared/property-name";
import { OutlineWidth } from "./outline-width";
import { OutlineOffset } from "./outline-offset";
import {
  DashBorderIcon,
  DashedBorderIcon,
  DottedBorderIcon,
  SmallXIcon,
} from "@webstudio-is/icons";

const property: StyleProperty = "outlineColor";
export const properties = [
  "outlineStyle",
  "outlineColor",
  "outlineWidth",
  "outlineOffset",
] satisfies Array<StyleProperty>;

/**
 * Component
 */
export const Section = (props: SectionProps) => {
  /**
   * Props
   */
  const { currentStyle, setProperty, deleteProperty } = props;
  const { outlineStyle } = currentStyle;

  /**
   * Store
   */
  const t = useStore($tOutline);
  const tD = useStore($tDeclarations);

  /**
   * Memo
   * @description 单选集合
   */
  const items = useMemo(
    () => [
      {
        child: <SmallXIcon />,
        title: t.none,
        description: tD["outlineStyle:none"],
        value: "none",
        propertyValues: "outline-style: none;",
      },
      {
        child: <DashBorderIcon />,
        title: t.solid,
        description: tD["outlineStyle:solid"],
        value: "solid",
        propertyValues: "outline-style: solid;",
      },
      {
        child: <DashedBorderIcon />,
        title: t.dashed,
        description: tD["outlineStyle:dashed"],
        value: "dashed",
        propertyValues: "outline-style: dashed;",
      },
      {
        child: <DottedBorderIcon />,
        title: t.dotted,
        description: tD["outlineStyle:dotted"],
        value: "dotted",
        propertyValues: "outline-style: dotted;",
      },
    ],
    [tD]
  );

  if (outlineStyle?.value.type !== "keyword") {
    return;
  }

  return (
    <CollapsibleSection
      label={t.outline}
      currentStyle={currentStyle}
      properties={properties}
    >
      <Flex direction="column" gap={2}>
        <OutlineStyle
          label={t.style}
          items={items}
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        {outlineStyle.value.value !== "none" && (
          <>
            <Grid
              css={{
                gridTemplateColumns: `1fr ${theme.spacing[20]} ${theme.spacing[12]}`,
              }}
              gapX={2}
            >
              <PropertyName
                style={currentStyle}
                properties={[property]}
                label={t.color}
                onReset={() => deleteProperty(property)}
              />

              <Box
                css={{
                  gridColumn: `span 2`,
                }}
              >
                <ColorControl
                  property={property}
                  currentStyle={currentStyle}
                  setProperty={setProperty}
                  deleteProperty={deleteProperty}
                />
              </Box>
            </Grid>

            <OutlineWidth
              label={t.width}
              currentStyle={currentStyle}
              setProperty={setProperty}
              deleteProperty={deleteProperty}
            />

            <OutlineOffset
              label={t.offset}
              currentStyle={currentStyle}
              setProperty={setProperty}
              deleteProperty={deleteProperty}
            />
          </>
        )}
      </Flex>
    </CollapsibleSection>
  );
};
