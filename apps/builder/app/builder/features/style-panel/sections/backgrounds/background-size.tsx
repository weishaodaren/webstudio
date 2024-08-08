import { Grid, Select, theme } from "@webstudio-is/design-system";
import { toValue } from "@webstudio-is/css-engine";
import { styleConfigByName } from "../../shared/configs";
import { parseCssValue } from "@webstudio-is/css-data";
import { CssValueInputContainer } from "../../shared/css-value-input";
import {
  type StyleValue,
  TupleValue,
  TupleValueItem,
} from "@webstudio-is/css-engine";
import type { SetValue } from "../../shared/use-style-data";
import { NonResetablePropertyName } from "../../shared/property-name";
import type { ControlProps } from "../../controls";

const StyleKeywordAuto = { type: "keyword" as const, value: "auto" };

const toTuple = (
  valueX?: StyleValue | string,
  valueY?: StyleValue | string
) => {
  const parsedValue = TupleValue.safeParse(valueX);
  if (parsedValue.success) {
    return parsedValue.data;
  }

  const parsedValueX = valueX ? TupleValueItem.parse(valueX) : StyleKeywordAuto;
  const parsedValueY = valueY ? TupleValueItem.parse(valueY) : parsedValueX;

  return {
    type: "tuple" as const,
    value: [parsedValueX, parsedValueY],
  };
};

export const BackgroundSize = (
  props: Omit<ControlProps, "property" | "items">
) => {
  const property = "backgroundSize";

  const styleInfo = props.currentStyle[property];
  const styleValue = styleInfo?.value;
  const styleSource = "default";
  const { items: defaultItems } = styleConfigByName(property);

  const selectOptions = [
    ...defaultItems,
    { name: "custom", label: "Custom" },
  ].map(({ name }) => name);
  const selectValue =
    styleValue?.type === "keyword" ? toValue(styleValue) : "custom";

  const customSizeDisabled = styleValue?.type === "keyword";
  const customSizeOptions = [StyleKeywordAuto];
  const customSizeValue = toTuple(styleValue);

  const setValue = props.setProperty(property);

  const setValueX: SetValue = (value, options) => {
    const [x] = value.type === "layers" ? value.value : [];
    const nextValue = toTuple(x, customSizeValue.value[1]);
    setValue(nextValue, options);
  };

  const setValueY: SetValue = (value, options) => {
    const [y] = value.type === "layers" ? value.value : [];
    const nextValue = toTuple(customSizeValue.value[0], y);
    setValue(nextValue, options);
  };

  return (
    <>
      <Grid
        css={{ gridTemplateColumns: `1fr ${theme.spacing[23]}` }}
        align="center"
        gap={2}
      >
        <NonResetablePropertyName
          style={props.currentStyle}
          properties={[property]}
          label="Size"
        />

        <Select
          // show empty field instead of radix placeholder
          // like css value input does
          placeholder=""
          options={selectOptions}
          value={selectValue}
          onChange={(name: string) => {
            if (name === "custom") {
              return setValue({
                type: "tuple",
                value: [StyleKeywordAuto, StyleKeywordAuto],
              });
            }
            const cssValue = parseCssValue(property, name);
            setValue(cssValue);
          }}
          onItemHighlight={(name) => {
            // No need to preview custom size as it needs additional user input.
            if (name === "custom") {
              return;
            }
            // Remove preview when mouse leaves the item.
            if (name === undefined) {
              if (styleValue !== undefined) {
                setValue(styleValue, { isEphemeral: true });
              }
              return;
            }
            // Preview on mouse enter or focus.
            const cssValue = parseCssValue(property, name);
            setValue(cssValue, { isEphemeral: true });
          }}
          onOpenChange={(isOpen) => {
            // Remove ephemeral changes when closing the menu.
            if (isOpen === false && styleValue !== undefined) {
              setValue(styleValue, { isEphemeral: true });
            }
          }}
          getItemProps={() => ({ text: "sentence" })}
        />
      </Grid>

      <Grid
        css={{ mt: theme.spacing[4] }}
        align="center"
        columns={2}
        gapX={2}
        gapY={1}
      >
        <NonResetablePropertyName
          style={props.currentStyle}
          properties={[property]}
          label="Width"
          description="The width of the background image."
          disabled={customSizeDisabled}
        />

        <NonResetablePropertyName
          style={props.currentStyle}
          properties={[property]}
          label="Height"
          description="The height of the background image."
          disabled={customSizeDisabled}
        />

        <CssValueInputContainer
          disabled={customSizeDisabled}
          property={property}
          styleSource={styleSource}
          keywords={customSizeOptions}
          value={customSizeValue.value[0]}
          setValue={setValueX}
          deleteProperty={props.deleteProperty}
        />

        <CssValueInputContainer
          disabled={customSizeDisabled}
          property={property}
          styleSource={styleSource}
          keywords={customSizeOptions}
          value={customSizeValue.value[1]}
          setValue={setValueY}
          deleteProperty={props.deleteProperty}
        />
      </Grid>
    </>
  );
};
