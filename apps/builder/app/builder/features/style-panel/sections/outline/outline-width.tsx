import type { StyleProperty } from "@webstudio-is/css-engine";
import { Grid, theme } from "@webstudio-is/design-system";
import type { SectionProps } from "../shared/section";
import { PropertyName } from "../../shared/property-name";
import { CssValueInputContainer } from "../../shared/css-value-input";
import { styleConfigByName } from "../../shared/configs";
import { getStyleSource } from "../../shared/style-info";

const property: StyleProperty = "outlineWidth";

/**
 * Compoennt
 */
export const OutlineWidth = (
  props: Pick<
    SectionProps,
    "currentStyle" | "setProperty" | "deleteProperty"
  > & { label: string }
) => {
  /**
   * Props
   */
  const { deleteProperty, setProperty, currentStyle, label } = props;
  const outlineWidthValue = currentStyle[property]?.value;
  const outlineStyleConfig = styleConfigByName(property);
  const outlineStyleWidthKeywords = outlineStyleConfig.items.map((item) => ({
    type: "keyword" as const,
    value: item.name,
  }));

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
        keywords={outlineStyleWidthKeywords}
        setValue={setProperty(property)}
        deleteProperty={deleteProperty}
        value={outlineWidthValue}
      />
    </Grid>
  );
};
