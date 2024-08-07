import type { StyleProperty } from "@webstudio-is/css-engine";
import { Grid, theme, Box } from "@webstudio-is/design-system";

import type { SectionProps } from "../shared/section";
import { PropertyName } from "../../shared/property-name";
import {
  ToggleGroupControl,
  type ToggleGroupControlProps,
} from "../../controls/toggle-group/toggle-group-control";

const property: StyleProperty = "outlineStyle";

/**
 * Component
 */
export const OutlineStyle = (
  props: Pick<
    SectionProps,
    "currentStyle" | "setProperty" | "deleteProperty"
  > & { label: string; items: ToggleGroupControlProps["items"] }
) => {
  /**
   * Props
   */
  const { deleteProperty, label, items } = props;

  return (
    <Grid
      css={{
        gridTemplateColumns: `1fr ${theme.spacing[20]} ${theme.spacing[12]}`,
      }}
      gap={2}
    >
      <PropertyName
        properties={[property]}
        style={props.currentStyle}
        label={label}
        onReset={() => deleteProperty(property)}
      />
      <Box css={{ gridColumn: `span 2`, justifySelf: "end" }}>
        <ToggleGroupControl {...props} items={items} property={property} />
      </Box>
    </Grid>
  );
};
