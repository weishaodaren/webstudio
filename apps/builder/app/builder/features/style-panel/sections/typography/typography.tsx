import { forwardRef, type ComponentProps } from "react";
import { useStore } from "@nanostores/react";
import { $tTypography, $tOutline, $tDeclarations } from "~/shared/nano-states";
import {
  Flex,
  Grid,
  EnhancedTooltip,
  theme,
  IconButton,
} from "@webstudio-is/design-system";
import { toValue, type StyleProperty } from "@webstudio-is/css-engine";
import type { SectionProps } from "../shared/section";
import { PropertyName } from "../../shared/property-name";
import {
  ColorControl,
  FontFamilyControl,
  FontWeightControl,
  SelectControl,
  TextControl,
} from "../../controls";
import {
  CrossSmallIcon,
  EllipsesIcon,
  TextDirectionLTRIcon,
  TextDirectionRTLIcon,
  TextAlignCenterIcon,
  TextAlignJustifyIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextCapitalizeIcon,
  TextHyphenIcon,
  TextItalicIcon,
  TextLowercaseIcon,
  TextStrikethroughIcon,
  TextTruncateIcon,
  TextUnderlineIcon,
  TextUppercaseIcon,
} from "@webstudio-is/icons";
import { ToggleGroupControl } from "../../controls/toggle-group/toggle-group-control";
import { FloatingPanel } from "~/builder/shared/floating-panel";
import { getStyleSourceColor, type StyleInfo } from "../../shared/style-info";
import { CollapsibleSection } from "../../shared/collapsible-section";

export const properties = [
  "fontFamily",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "color",
  "textAlign",
  "fontStyle",
  "textDecorationLine",
  "letterSpacing",
  "textTransform",
  "direction",
  "whiteSpaceCollapse",
  "textWrapMode",
  "textWrapStyle",
  "textOverflow",
  "hyphens",
] satisfies Array<StyleProperty>;

export const Section = (props: SectionProps) => {
  /**
   * Store
   */
  const t = useStore($tTypography);
  const tOutline = useStore($tOutline);
  return (
    <CollapsibleSection
      label={t.typography}
      currentStyle={props.currentStyle}
      properties={properties}
    >
      <Flex gap="2" direction="column">
        <TypographySectionFont
          {...props}
          familyLabel={t.family}
          weightLabel={t.weight}
          colorLabel={tOutline.color}
        />
        <TypographySectionSizing
          {...props}
          widthLabel={t.fontSize}
          heightLabel={t.lineHeight}
          spacingLabel={t.spacing}
        />
        <TypographySectionAdvanced {...props} />
      </Flex>
    </CollapsibleSection>
  );
};

export const TypographySectionFont = (
  props: SectionProps & {
    familyLabel: string;
    weightLabel: string;
    colorLabel: string;
  }
) => {
  const {
    currentStyle,
    setProperty,
    deleteProperty,
    familyLabel,
    weightLabel,
    colorLabel,
  } = props;

  return (
    <Grid css={{ gridTemplateColumns: "4fr 6fr" }} gap={2}>
      <PropertyName
        style={currentStyle}
        label={familyLabel}
        properties={["fontFamily"]}
        onReset={() => deleteProperty("fontFamily")}
      />
      <FontFamilyControl
        property="fontFamily"
        currentStyle={currentStyle}
        setProperty={setProperty}
        deleteProperty={deleteProperty}
      />
      <PropertyName
        style={currentStyle}
        label={weightLabel}
        properties={["fontWeight"]}
        onReset={() => deleteProperty("fontWeight")}
      />
      <FontWeightControl
        property="fontWeight"
        currentStyle={currentStyle}
        setProperty={setProperty}
        deleteProperty={deleteProperty}
      />
      <PropertyName
        style={currentStyle}
        label={colorLabel}
        properties={["color"]}
        onReset={() => deleteProperty("color")}
      />
      <ColorControl
        property="color"
        currentStyle={currentStyle}
        setProperty={setProperty}
        deleteProperty={deleteProperty}
      />
    </Grid>
  );
};

export const TypographySectionSizing = (
  props: SectionProps & {
    widthLabel: string;
    heightLabel: string;
    spacingLabel: string;
  }
) => {
  const {
    currentStyle,
    setProperty,
    deleteProperty,
    widthLabel,
    heightLabel,
    spacingLabel,
  } = props;

  return (
    <Grid gap="2" css={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
      <Grid gap="1">
        <PropertyName
          style={currentStyle}
          properties={["fontSize"]}
          label={widthLabel}
          onReset={() => deleteProperty("fontSize")}
        />
        <TextControl
          property="fontSize"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
      </Grid>
      <Grid gap="1">
        <PropertyName
          style={currentStyle}
          properties={["lineHeight"]}
          label={heightLabel}
          onReset={() => deleteProperty("lineHeight")}
        />
        <TextControl
          property="lineHeight"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
      </Grid>
      <Grid gap="1">
        <PropertyName
          style={currentStyle}
          properties={["letterSpacing"]}
          label={spacingLabel}
          onReset={() => deleteProperty("letterSpacing")}
        />
        <TextControl
          property="letterSpacing"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
      </Grid>
    </Grid>
  );
};

export const TypographySectionAdvanced = (props: SectionProps) => {
  const { currentStyle } = props;

  /**
   * Store
   */
  const t = useStore($tTypography);
  const textAlignValue = toValue(currentStyle.textAlign?.value);
  return (
    <Grid gap="2" columns="2" align="end">
      <ToggleGroupControl
        {...props}
        property="textAlign"
        value={
          // Convert to logical props
          textAlignValue === "left"
            ? "start"
            : textAlignValue === "right"
              ? "end"
              : textAlignValue
        }
        items={[
          {
            child: <TextAlignLeftIcon />,
            title: t.textAlign,
            description: t.textAlignStartDesc,
            value: "start",
            propertyValues: "text-align: start;",
          },
          {
            child: <TextAlignCenterIcon />,
            title: t.textAlign,
            description: t.textAlignCenterDesc,
            value: "center",
            propertyValues: "text-align: center;",
          },
          {
            child: <TextAlignRightIcon />,
            title: t.textAlign,
            description: t.textAlignEndDesc,
            value: "end",
            propertyValues: "text-align: end;",
          },
          {
            child: <TextAlignJustifyIcon />,
            title: t.textAlign,
            description: t.textAlignJustifyDesc,
            value: "justify",
            propertyValues: "text-align: justify;",
          },
        ]}
      />
      <ToggleGroupControl
        {...props}
        property="textDecorationLine"
        items={[
          {
            child: <CrossSmallIcon />,
            title: t.textDecoration,
            description: t.textDecorationNoneDesc,
            value: "none",
            propertyValues: "text-decoration-line: none;",
          },
          {
            title: t.textDecoration,
            child: <TextUnderlineIcon />,
            description: t.textDecorationUnderlineDesc,
            value: "underline",
            propertyValues: "text-decoration-line: underline;",
          },
          {
            title: t.textDecoration,
            child: <TextStrikethroughIcon />,
            description: t.textDecorationLinethroughDesc,
            value: "line-through",
            propertyValues: "text-decoration-line: line-through;",
          },
        ]}
      />
      <ToggleGroupControl
        {...props}
        property="textTransform"
        items={[
          {
            child: <CrossSmallIcon />,
            title: t.textTransform,
            description: t.textTransformNoneDesc,
            value: "none",
            propertyValues: "text-transform: none;",
          },
          {
            child: <TextUppercaseIcon />,
            title: t.textTransform,
            description: t.textTransformUpperDesc,
            value: "uppercase",
            propertyValues: "text-transform: uppercase;",
          },
          {
            child: <TextCapitalizeIcon />,
            title: t.textTransform,
            description: t.textTransformCapsDesc,
            value: "capitalize",
            propertyValues: "text-transform: capitalize;",
          },
          {
            child: <TextLowercaseIcon />,
            title: t.textTransform,
            description: t.textTransformLowerDesc,
            value: "lowercase",
            propertyValues: "text-transform: lowercase;",
          },
        ]}
      />
      <Grid align="end" gap="1" css={{ gridTemplateColumns: "3fr 1fr" }}>
        <ToggleGroupControl
          {...props}
          property="fontStyle"
          items={[
            {
              child: <CrossSmallIcon />,
              title: t.fontStyle,
              description: t.normalDesc,
              value: "normal",
              propertyValues: "font-style: normal;",
            },
            {
              child: <TextItalicIcon />,
              title: t.fontStyle,
              description: t.italicDesc,
              value: "italic",
              propertyValues: "font-style: italic;",
            },
          ]}
        />
        <TypographySectionAdvancedPopover
          {...props}
          title={t.advanced}
          tooltip={t.advancedTooltip}
          labels={{
            whiteSpace: t.whiteSpace,
            wrapMode: t.wrapMode,
            wrapStyle: t.wrapStyle,
            direction: t.direction,
            directionLTRDesc: t.directionLTRDesc,
            directionRTLDesc: t.directionRTLDesc,
            hyphens: t.hyphens,
            hyphensNoneDesc: t.hyphensNoneDesc,
            hyphensAutoDesc: t.hyphensAutoDesc,
            overflow: t.overflow,
            overflowClipDesc: t.overflowClipDesc,
            overflowEllipsisDesc: t.overflowEllipsisDesc,
          }}
        />
      </Grid>
    </Grid>
  );
};

const AdvancedOptionsButton = forwardRef<
  HTMLButtonElement,
  ComponentProps<typeof IconButton> & {
    currentStyle: StyleInfo;
    properties: StyleProperty[];
    onReset: () => void;
    /** https://www.radix-ui.com/docs/primitives/components/collapsible#trigger */
    "data-state"?: "open" | "closed";
    tooltip: string;
  }
>(({ currentStyle, properties, onReset, onClick, tooltip, ...rest }, ref) => {
  const styleSourceColor = getStyleSourceColor({
    properties,
    currentStyle,
  });
  return (
    <Flex>
      <EnhancedTooltip content={tooltip}>
        <IconButton
          {...rest}
          onClick={(event) => {
            if (event.altKey) {
              onReset();
              return;
            }
            onClick?.(event);
          }}
          variant={styleSourceColor}
          ref={ref}
        >
          <EllipsesIcon />
        </IconButton>
      </EnhancedTooltip>
    </Flex>
  );
});
AdvancedOptionsButton.displayName = "AdvancedOptionsButton";

export const TypographySectionAdvancedPopover = (
  props: SectionProps & {
    title: string;
    tooltip: string;
    labels: {
      whiteSpace: string;
      wrapMode: string;
      wrapStyle: string;
      direction: string;
      directionLTRDesc: string;
      directionRTLDesc: string;
      hyphens: string;
      hyphensNoneDesc: string;
      hyphensAutoDesc: string;
      overflow: string;
      overflowClipDesc: string;
      overflowEllipsisDesc: string;
    };
  }
) => {
  const {
    deleteProperty,
    setProperty,
    createBatchUpdate,
    currentStyle,
    title,
    tooltip,
    labels,
  } = props;
  const properties = {
    whiteSpaceCollapse: "whiteSpaceCollapse",
    textWrapMode: "textWrapMode",
    textWrapStyle: "textWrapStyle",
    direction: "direction",
    hyphens: "hyphens",
    textOverflow: "textOverflow",
  } as const; // in Record<StyleProperty, StyleProperty>//{ [key: StyleProperty]: StyleProperty }  { [key in StyleProperty]: string };

  return (
    <FloatingPanel
      title={title}
      content={
        <Grid
          css={{
            padding: theme.spacing[9],
            gap: theme.spacing[9],
            width: theme.spacing[30],
          }}
        >
          <Grid css={{ gridTemplateColumns: "4fr 6fr" }} gap={2}>
            <PropertyName
              style={currentStyle}
              properties={[properties.whiteSpaceCollapse]}
              label={labels.whiteSpace}
              onReset={() => deleteProperty(properties.whiteSpaceCollapse)}
            />
            <SelectControl
              property={properties.whiteSpaceCollapse}
              currentStyle={currentStyle}
              setProperty={setProperty}
              deleteProperty={deleteProperty}
            />
          </Grid>
          {/* @todo cannot set because not supported in browser ??? */}
          <Grid css={{ gridTemplateColumns: "4fr 6fr" }} gap={2}>
            <PropertyName
              style={currentStyle}
              properties={[properties.textWrapMode]}
              label={labels.wrapMode}
              onReset={() => deleteProperty(properties.textWrapMode)}
            />
            <SelectControl
              property={properties.textWrapMode}
              currentStyle={currentStyle}
              setProperty={setProperty}
              deleteProperty={deleteProperty}
            />
          </Grid>
          <Grid css={{ gridTemplateColumns: "4fr 6fr" }} gap={2}>
            <PropertyName
              style={currentStyle}
              properties={[properties.textWrapStyle]}
              label={labels.wrapStyle}
              onReset={() => deleteProperty(properties.textWrapStyle)}
            />
            <SelectControl
              property={properties.textWrapStyle}
              currentStyle={currentStyle}
              setProperty={setProperty}
              deleteProperty={deleteProperty}
            />
          </Grid>
          <Grid css={{ gridTemplateColumns: "4fr auto" }}>
            <PropertyName
              style={currentStyle}
              properties={[properties.direction]}
              label={labels.direction}
              onReset={() => deleteProperty(properties.direction)}
            />
            <ToggleGroupControl
              {...props}
              property={properties.direction}
              items={[
                {
                  child: <TextDirectionLTRIcon />,
                  title: labels.direction,
                  description: labels.directionLTRDesc,
                  value: "ltr",
                  propertyValues: "direction: ltr;",
                },
                {
                  child: <TextDirectionRTLIcon />,
                  title: labels.direction,
                  description: labels.directionRTLDesc,
                  value: "rtl",
                  propertyValues: "direction: rtl;",
                },
              ]}
            />
          </Grid>
          <Grid css={{ gridTemplateColumns: "4fr auto" }}>
            <PropertyName
              style={currentStyle}
              properties={[properties.hyphens]}
              label={labels.hyphens}
              onReset={() => deleteProperty(properties.hyphens)}
            />
            <ToggleGroupControl
              {...props}
              property={properties.hyphens}
              items={[
                {
                  child: <CrossSmallIcon />,
                  title: labels.hyphens,
                  description: labels.hyphensNoneDesc,
                  value: "manual",
                  propertyValues: "hyphens: none;",
                },
                {
                  child: <TextHyphenIcon />,
                  title: labels.hyphens,
                  description: labels.hyphensAutoDesc,
                  value: "auto",
                  propertyValues: "hyphens: auto;",
                },
              ]}
            />
          </Grid>
          <Grid css={{ gridTemplateColumns: "4fr auto" }}>
            <PropertyName
              style={currentStyle}
              properties={[properties.textOverflow]}
              label={labels.overflow}
              onReset={() => deleteProperty(properties.textOverflow)}
            />
            <ToggleGroupControl
              {...props}
              property={properties.textOverflow}
              items={[
                {
                  child: <CrossSmallIcon />,
                  title: labels.overflow,
                  description: labels.overflowClipDesc,
                  value: "clip",
                  propertyValues: "text-overflow: clip;",
                },
                {
                  child: <TextTruncateIcon />,
                  title: labels.overflow,
                  description: labels.overflowEllipsisDesc,
                  value: "ellipsis",
                  propertyValues: "text-overflow: ellipsis;",
                },
              ]}
            />
          </Grid>
        </Grid>
      }
    >
      <AdvancedOptionsButton
        tooltip={tooltip}
        currentStyle={currentStyle}
        properties={Object.values(properties)}
        onReset={() => {
          const batch = createBatchUpdate();
          Object.values(properties).forEach((property) => {
            batch.deleteProperty(property);
          });
          batch.publish();
        }}
      />
    </FloatingPanel>
  );
};
