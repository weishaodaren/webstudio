import {
  toValue,
  type InvalidValue,
  type LayersValue,
  type RgbValue,
  type StyleValue,
  type TupleValue,
  type UnitValue,
} from "@webstudio-is/css-engine";
import {
  extractShadowProperties,
  type ExtractedShadowProperties,
} from "@webstudio-is/css-data";
import {
  Flex,
  Grid,
  Label,
  Separator,
  Text,
  TextArea,
  textVariants,
  theme,
  ToggleGroup,
  ToggleGroupButton,
  Tooltip,
} from "@webstudio-is/design-system";
import { ShadowInsetIcon, ShadowNormalIcon } from "@webstudio-is/icons";
import { useMemo, useState } from "react";
import type { IntermediateStyleValue } from "../shared/css-value-input";
import { CssValueInputContainer } from "../shared/css-value-input";
import { toPascalCase } from "../shared/keyword-utils";
import { ColorControl } from "../controls";
import type {
  DeleteProperty,
  SetProperty,
  StyleUpdateOptions,
} from "../shared/use-style-data";
import { parseCssFragment } from "./parse-css-fragment";

/*
  When it comes to checking and validating individual CSS properties for the box-shadow,
  splitting them fails the validation. As it needs a minimum of 2 values to validate.
  Instead, a workaround is to use a fallback CSS property
  that can handle the same values as the input being validated.

  Here's the box-shadow property with its components:

  box-shadow: color, inset, offsetX, offsetY, blur, spread;
  You can check more details from the spec
  https://www.w3.org/TR/css-backgrounds-3/#box-shadow

  offsetX: length, takes positive and negative values.
  offsetY: length, takes positive and negative values.
  blur: length, takes only positive values.
  spread: length, takes both positive and negative values.

  outline-offset: length, takes positive and negative values.
  https://www.w3.org/TR/css-ui-4/#outline-offset

  border-top-width: length, takes only positive values.
  https://www.w3.org/TR/css-backgrounds-3/#propdef-border-top-width
*/

type ShadowContentProps = {
  index: number;
  property: "boxShadow" | "textShadow";
  layer: TupleValue;
  propertyValue: string;
  tooltip: JSX.Element;
  onEditLayer: (
    index: number,
    layers: LayersValue,
    options: StyleUpdateOptions
  ) => void;
  deleteProperty: DeleteProperty;
  hideCodeEditor?: boolean;
  labels: {
    xOffsetLabel: string;
    xOffsetDescription: string;
    yOffsetLabel: string;
    yOffsetDescription: string;
    blurRadiusLabel: string;
    blurRadiusDescription: string;
    spreadRadiusLabel: string;
    spreadRadiusDescription: string;
    insetLabel: string;
    insetDescription: string;
    xLabel: string;
    yLabel: string;
    blurLabel: string;
    spreadLabel: string;
    colorDescription: string;
    colorLabel: string;
    codeLabel: string;
  };
};

const convertValuesToTupple = (
  values: Partial<Record<keyof ExtractedShadowProperties, StyleValue>>
): TupleValue => {
  return {
    type: "tuple",
    value: (Object.values(values) as Array<StyleValue>).filter(
      (item: StyleValue): item is UnitValue | RgbValue =>
        item !== null && item !== undefined
    ),
  };
};

const boxShadowInsetValues = [
  { value: "normal", Icon: ShadowNormalIcon },
  { value: "inset", Icon: ShadowInsetIcon },
] as const;

export const ShadowContent = ({
  layer,
  index,
  property,
  propertyValue,
  tooltip,
  hideCodeEditor = false,
  onEditLayer,
  deleteProperty,
  labels: {
    xOffsetLabel,
    xOffsetDescription,
    yOffsetLabel,
    yOffsetDescription,
    blurRadiusLabel,
    blurRadiusDescription,
    spreadRadiusLabel,
    spreadRadiusDescription,
    insetLabel,
    insetDescription,
    xLabel,
    yLabel,
    blurLabel,
    spreadLabel,
    colorDescription,
    colorLabel,
    codeLabel,
  },
}: ShadowContentProps) => {
  const [intermediateValue, setIntermediateValue] = useState<
    IntermediateStyleValue | InvalidValue | undefined
  >();
  const layerValues = useMemo<ExtractedShadowProperties>(() => {
    setIntermediateValue({ type: "intermediate", value: propertyValue });
    return extractShadowProperties(layer);
  }, [layer, propertyValue]);

  const { offsetX, offsetY, blur, spread, color, inset } = layerValues;
  const colorControlProp = color ?? {
    type: "rgb",
    r: 0,
    g: 0,
    b: 0,
    alpha: 1,
  };

  const handleChange = (value: string) => {
    setIntermediateValue({
      type: "intermediate",
      value,
    });
  };

  const handleComplete = () => {
    if (intermediateValue === undefined) {
      return;
    }
    const parsed = parseCssFragment(intermediateValue.value, property);
    const parsedValue = parsed.get(property);
    if (parsedValue?.type === "layers") {
      onEditLayer(index, parsedValue, { isEphemeral: false });
      return;
    }
    setIntermediateValue({
      type: "invalid",
      value: intermediateValue.value,
    });
  };

  const handlePropertyChange = (
    params: Partial<Record<keyof ExtractedShadowProperties, StyleValue>>,
    options: StyleUpdateOptions = { isEphemeral: false }
  ) => {
    const newLayer = convertValuesToTupple({ ...layerValues, ...params });
    setIntermediateValue({
      type: "intermediate",
      value: toValue(newLayer),
    });
    onEditLayer(index, { type: "layers", value: [newLayer] }, options);
  };

  const colorControlCallback: SetProperty = () => {
    return (value, options) => {
      handlePropertyChange({ color: value }, options);
    };
  };

  return (
    <Flex direction="column">
      <Grid
        gap="2"
        css={{
          px: theme.spacing[9],
          marginTop: theme.spacing[5],
          gridTemplateColumns:
            property === "boxShadow" ? "1fr 1fr" : "1fr 1fr 1fr",
        }}
      >
        <Flex direction="column">
          <Tooltip
            variant="wrapped"
            content={
              <Flex gap="2" direction="column">
                <Text variant="regularBold">{xOffsetLabel}</Text>
                <Text variant="monoBold">offset-x</Text>
                <Text>{xOffsetDescription}</Text>
              </Flex>
            }
          >
            <Label css={{ width: "fit-content" }}>{xLabel}</Label>
          </Tooltip>
          <CssValueInputContainer
            key="boxShadowOffsetX"
            // outline-offset is a fake property for validating box-shadow's offsetX.
            property="outlineOffset"
            styleSource="local"
            keywords={[]}
            value={offsetX ?? { type: "unit", value: 0, unit: "px" }}
            setValue={(value, options) =>
              handlePropertyChange({ offsetX: value }, options)
            }
            deleteProperty={() =>
              handlePropertyChange({
                offsetX: offsetX ?? undefined,
              })
            }
          />
        </Flex>

        <Flex direction="column">
          <Tooltip
            variant="wrapped"
            content={
              <Flex gap="2" direction="column">
                <Text variant="regularBold">{yOffsetLabel}</Text>
                <Text variant="monoBold">offset-y</Text>
                <Text>{yOffsetDescription}</Text>
              </Flex>
            }
          >
            <Label css={{ width: "fit-content" }}>{yLabel}</Label>
          </Tooltip>
          <CssValueInputContainer
            key="boxShadowOffsetY"
            // outline-offset is a fake property for validating box-shadow's offsetY.
            property="outlineOffset"
            styleSource="local"
            keywords={[]}
            value={offsetY ?? { type: "unit", value: 0, unit: "px" }}
            setValue={(value, options) =>
              handlePropertyChange({ offsetY: value }, options)
            }
            deleteProperty={() =>
              handlePropertyChange({
                offsetY: offsetY ?? undefined,
              })
            }
          />
        </Flex>

        <Flex direction="column">
          <Tooltip
            variant="wrapped"
            content={
              <Flex gap="2" direction="column">
                <Text variant="regularBold">{blurRadiusLabel}</Text>
                <Text variant="monoBold">blur-radius</Text>
                <Text>{blurRadiusDescription}</Text>
              </Flex>
            }
          >
            <Label css={{ width: "fit-content" }}>{blurLabel}</Label>
          </Tooltip>
          <CssValueInputContainer
            key="boxShadowBlur"
            // border-top-width is a fake property for validating box-shadow's blur.
            property="borderTopWidth"
            styleSource="local"
            keywords={[]}
            value={blur ?? { type: "unit", value: 0, unit: "px" }}
            setValue={(value, options) =>
              handlePropertyChange({ blur: value }, options)
            }
            deleteProperty={() =>
              handlePropertyChange({
                blur: blur ?? undefined,
              })
            }
          />
        </Flex>

        {property === "boxShadow" ? (
          <Flex direction="column">
            <Tooltip
              variant="wrapped"
              content={
                <Flex gap="2" direction="column">
                  <Text variant="regularBold">{spreadRadiusLabel}</Text>
                  <Text variant="monoBold">spread-radius</Text>
                  <Text>{spreadRadiusDescription}</Text>
                </Flex>
              }
            >
              <Label css={{ width: "fit-content" }}>{spreadLabel}</Label>
            </Tooltip>
            <CssValueInputContainer
              key="boxShadowSpread"
              // outline-offset is a fake property for validating box-shadow's spread.
              property="outlineOffset"
              styleSource="local"
              keywords={[]}
              value={spread ?? { type: "unit", value: 0, unit: "px" }}
              setValue={(value, options) =>
                handlePropertyChange({ spread: value }, options)
              }
              deleteProperty={() =>
                handlePropertyChange({
                  spread: spread ?? undefined,
                })
              }
            />
          </Flex>
        ) : null}
      </Grid>

      <Grid
        gap="2"
        css={{
          px: theme.spacing[9],
          marginTop: theme.spacing[5],
          paddingBottom: theme.spacing[5],
          ...(property === "boxShadow" && { gridTemplateColumns: "3fr 1fr" }),
        }}
      >
        <Flex direction="column">
          <Tooltip
            variant="wrapped"
            content={
              <Flex gap="2" direction="column">
                <Text variant="regularBold">{colorLabel}</Text>
                <Text variant="monoBold">color</Text>
                <Text>{colorDescription}</Text>
              </Flex>
            }
          >
            <Label css={{ width: "fit-content" }}>{colorLabel}</Label>
          </Tooltip>
          <ColorControl
            property="color"
            currentStyle={{
              color: {
                value: colorControlProp,
                currentColor: colorControlProp,
              },
            }}
            setProperty={colorControlCallback}
            deleteProperty={() =>
              handlePropertyChange({ color: colorControlProp })
            }
          />
        </Flex>

        {property === "boxShadow" ? (
          <Flex direction="column">
            <Tooltip
              variant="wrapped"
              content={
                <Flex gap="2" direction="column">
                  <Text variant="regularBold">{insetLabel}</Text>
                  <Text variant="monoBold">inset</Text>
                  <Text>{insetDescription}</Text>
                </Flex>
              }
            >
              <Label css={{ display: "inline" }}>{insetLabel}</Label>
            </Tooltip>
            <ToggleGroup
              type="single"
              value={inset?.value ?? "normal"}
              defaultValue="inset"
              onValueChange={(value) => {
                if (value === "inset") {
                  handlePropertyChange({
                    inset: { type: "keyword", value: "inset" },
                  });
                } else {
                  handlePropertyChange({ inset: undefined });
                }
              }}
            >
              {boxShadowInsetValues.map(({ value, Icon }) => (
                <Tooltip key={value} content={toPascalCase(value)}>
                  <ToggleGroupButton value={value}>
                    <Icon />
                  </ToggleGroupButton>
                </Tooltip>
              ))}
            </ToggleGroup>
          </Flex>
        ) : null}
      </Grid>

      {hideCodeEditor === false ? (
        <>
          <Separator css={{ gridColumn: "span 2" }} />
          <Flex
            direction="column"
            css={{
              px: theme.spacing[9],
              paddingTop: theme.spacing[5],
              paddingBottom: theme.spacing[9],
              gap: theme.spacing[3],
              minWidth: theme.spacing[30],
            }}
          >
            <Label>
              <Flex align={"center"} gap={1}>
                {codeLabel}
                {tooltip}
              </Flex>
            </Label>
            <TextArea
              rows={3}
              name="description"
              value={intermediateValue?.value ?? propertyValue ?? ""}
              css={{ minHeight: theme.spacing[14], ...textVariants.mono }}
              color={
                intermediateValue?.type === "invalid" ? "error" : undefined
              }
              onChange={handleChange}
              onBlur={handleComplete}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleComplete();
                  event.preventDefault();
                }

                if (event.key === "Escape") {
                  deleteProperty(property, { isEphemeral: true });
                  setIntermediateValue(undefined);
                  event.preventDefault();
                }
              }}
            />
          </Flex>
        </>
      ) : undefined}
    </Flex>
  );
};
