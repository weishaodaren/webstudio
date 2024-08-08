import { useStore } from "@nanostores/react";
import { $tSize, $tPosition } from "~/shared/nano-states";
import type { StyleProperty } from "@webstudio-is/css-engine";
import {
  Flex,
  Grid,
  IconButton,
  Separator,
  styled,
} from "@webstudio-is/design-system";
import type { SectionProps } from "../shared/section";
import { PropertyName } from "../../shared/property-name";
import {
  PositionControl,
  SelectControl,
  TextControl,
  type ControlProps,
} from "../../controls";
import {
  EyeconOpenIcon,
  EyeconClosedIcon,
  ScrollIcon,
  AutoScrollIcon,
  EllipsesIcon,
} from "@webstudio-is/icons";
import { CollapsibleSection } from "../../shared/collapsible-section";
import { theme } from "@webstudio-is/design-system";
import { ToggleGroupControl } from "../../controls/toggle-group/toggle-group-control";
import { getStyleSourceColor } from "../../shared/style-info";
import { FloatingPanel } from "~/builder/shared/floating-panel";

const SizeProperty = ({
  label,
  property,
  currentStyle,
  setProperty,
  deleteProperty,
}: ControlProps & { label: string }) => {
  return (
    <Grid gap={1}>
      <PropertyName
        label={label}
        properties={[property]}
        style={currentStyle}
        onReset={() => deleteProperty(property)}
      />
      <TextControl
        property={property}
        currentStyle={currentStyle}
        setProperty={setProperty}
        deleteProperty={deleteProperty}
      />
    </Grid>
  );
};

const ObjectPosition = ({
  property,
  currentStyle,
  setProperty,
  deleteProperty,
  isAdvanced,
  title,
  labels,
}: ControlProps & {
  title: string;
  labels: {
    leftText: string;
    topText: string;
    leftDesc: string;
    topDesc: string;
    positionText: string;
  };
}) => {
  const styleSourceColor = getStyleSourceColor({
    properties: [property],
    currentStyle,
  });

  return (
    <Flex justify="end">
      <FloatingPanel
        title={title}
        content={
          <Flex css={{ px: theme.spacing[9], py: theme.spacing[5] }}>
            <PositionControl
              property={property}
              currentStyle={currentStyle}
              setProperty={setProperty}
              deleteProperty={deleteProperty}
              isAdvanced={isAdvanced}
              labels={labels}
            />
          </Flex>
        }
      >
        <IconButton
          variant={styleSourceColor}
          onClick={(event) => {
            if (event.altKey) {
              event.preventDefault();
              deleteProperty(property);
            }
          }}
        >
          <EllipsesIcon />
        </IconButton>
      </FloatingPanel>
    </Flex>
  );
};

export const properties = [
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "overflowX",
  "overflowY",
  "objectFit",
  "objectPosition",
  "aspectRatio",
] satisfies Array<StyleProperty>;

const SectionLayout = styled(Grid, {
  columnGap: theme.spacing[5],
  rowGap: theme.spacing[5],
  px: theme.spacing[9],
});

export const Section = ({
  currentStyle,
  setProperty,
  deleteProperty,
  createBatchUpdate,
}: SectionProps) => {
  /**
   * Store
   */
  const t = useStore($tSize);
  const tPosition = useStore($tPosition);
  return (
    <CollapsibleSection
      label={t.size}
      currentStyle={currentStyle}
      properties={properties}
      fullWidth
    >
      <SectionLayout columns={2}>
        <SizeProperty
          label={t.width}
          property="width"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        <SizeProperty
          label={t.height}
          property="height"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        <SizeProperty
          label={t.minWidth}
          property="minWidth"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        <SizeProperty
          label={t.minHeight}
          property="minHeight"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        <SizeProperty
          label={t.maxWidth}
          property="maxWidth"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        <SizeProperty
          label={t.maxHeight}
          property="maxHeight"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        <PropertyName
          label={t.aspectRatio}
          properties={["aspectRatio"]}
          style={currentStyle}
          onReset={() => deleteProperty("aspectRatio")}
        />
        <TextControl
          property={"aspectRatio"}
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
      </SectionLayout>
      <Separator />
      <SectionLayout columns={2}>
        <PropertyName
          label={t.overflow}
          properties={["overflowX", "overflowY"]}
          style={currentStyle}
          onReset={() => {
            const batch = createBatchUpdate();
            deleteProperty("overflowX");
            deleteProperty("overflowY");
            batch.publish();
          }}
        />
        <ToggleGroupControl
          property="overflowX"
          currentStyle={currentStyle}
          setProperty={() => (value) => {
            const batch = createBatchUpdate();
            batch.setProperty("overflowX")(value);
            batch.setProperty("overflowY")(value);
            batch.publish();
          }}
          deleteProperty={() => {
            const batch = createBatchUpdate();
            batch.deleteProperty("overflowX");
            batch.deleteProperty("overflowY");
            batch.publish();
          }}
          items={[
            {
              child: <EyeconOpenIcon />,
              title: t.overflow,
              description: t.overflowVisibleDesc,
              value: "visible",
              propertyValues: "overflow-x: visible;\noverflow-y: visible;",
            },
            {
              child: <EyeconClosedIcon />,
              title: t.overflow,
              description: t.overflowHiddenDesc,
              value: "hidden",
              propertyValues: "overflow-x: hidden;\noverflow-y: hidden;",
            },
            {
              child: <ScrollIcon />,
              title: t.overflow,
              description: t.overflowScrollDesc,
              value: "scroll",
              propertyValues: "overflow-x: scroll;\noverflow-y: scroll;",
            },

            {
              child: <AutoScrollIcon />,
              title: t.overflow,
              description: t.overflowAutoDesc,
              value: "auto",
              propertyValues: "overflow-x: auto;\noverflow-y: auto;",
            },
          ]}
        />
        <PropertyName
          label={t.objectFit}
          properties={["objectFit"]}
          style={currentStyle}
          onReset={() => deleteProperty("objectFit")}
        />
        <SelectControl
          property="objectFit"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
        <PropertyName
          label={t.objectPosition}
          properties={["objectPosition"]}
          style={currentStyle}
          onReset={() => deleteProperty("objectPosition")}
        />
        <ObjectPosition
          title={t.objectPosition}
          labels={{
            leftDesc: t.leftDesc,
            leftText: t.left,
            topDesc: t.topDesc,
            topText: t.top,
            positionText: tPosition.position,
          }}
          property="objectPosition"
          currentStyle={currentStyle}
          setProperty={setProperty}
          deleteProperty={deleteProperty}
        />
      </SectionLayout>
    </CollapsibleSection>
  );
};
