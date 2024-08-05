import type { StyleProperty, UnitValue } from "@webstudio-is/css-engine";
import { Grid, theme } from "@webstudio-is/design-system";
import { CssValueInputContainer } from "../../shared/css-value-input";
import type { SectionProps } from "../shared/section";
import { PropertyName } from "../../shared/property-name";
import { styleConfigByName } from "../../shared/configs";
import { getStyleSource } from "../../shared/style-info";

const property: StyleProperty = "outlineOffset";
const defaultOutlineOffsetValue: UnitValue = {
  type: "unit",
  value: 0,
  unit: "number",
};

/**
 * Component
 */
export const OutlineOffset = (
  props: Pick<
    SectionProps,
    "currentStyle" | "setProperty" | "deleteProperty"
  > & { label: string }
) => {
  /**
   * Props
   */
  const { deleteProperty, setProperty, currentStyle, label } = props;
  const outlineOffsetValue =
    currentStyle[property]?.value ?? defaultOutlineOffsetValue;
  const outlineOffsetStyleConfig = styleConfigByName(property);
  const outlineOffsetWidthKeywords = outlineOffsetStyleConfig.items.map(
    (item) => ({
      type: "keyword" as const,
      value: item.name,
    })
  );

  return (
    <Grid
      css={{
        gridTemplateColumns: `1fr ${theme.spacing[20]}`,
      }}
      gap={2}
    >
      <PropertyName
        properties={[property]}
        style={props.currentStyle}
        label={label}
        onReset={() => deleteProperty(property)}
      />

      <CssValueInputContainer
        key={property}
        property={property}
        styleSource={getStyleSource(currentStyle[property])}
        keywords={outlineOffsetWidthKeywords}
        setValue={setProperty(property)}
        deleteProperty={deleteProperty}
        value={outlineOffsetValue}
      />
    </Grid>
  );
};
