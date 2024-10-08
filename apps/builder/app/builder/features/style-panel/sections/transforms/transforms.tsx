import { CollapsibleSectionRoot } from "~/builder/shared/collapsible-section";
import type { SectionProps } from "../shared/section";
import type { StyleProperty } from "@webstudio-is/css-engine";
import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { $tTransforms } from "~/shared/nano-states";
import {
  CssValueListArrowFocus,
  CssValueListItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  Flex,
  Label,
  SectionTitle,
  SectionTitleButton,
  SectionTitleLabel,
  SmallIconButton,
  SmallToggleButton,
  theme,
} from "@webstudio-is/design-system";
import {
  EyeconClosedIcon,
  PlusIcon,
  SubtractIcon,
  EyeconOpenIcon,
} from "@webstudio-is/icons";
import {
  addDefaultsForTransormSection,
  isTransformPanelPropertyUsed,
  handleDeleteTransformProperty,
  handleHideTransformProperty,
  getHumanizedTextFromTransformLayer,
  type TransformPanelProps,
} from "./transform-utils";
import { FloatingPanel } from "~/builder/shared/floating-panel";
import { TranslatePanelContent } from "./transform-translate";
import { ScalePanelContent } from "./transform-scale";
import { RotatePanelContent } from "./transform-rotate";
import { SkewPanelContent } from "./transform-skew";
import { BackfaceVisibility } from "./transform-backface-visibility";
import { getStyleSource } from "../../shared/style-info";
import { PropertyName } from "../../shared/property-name";
import { getDots } from "../../shared/collapsible-section";
import { isFeatureEnabled } from "@webstudio-is/feature-flags";

export const transformPanels = [
  "translate",
  "scale",
  "rotate",
  "skew",
] as const;

export const transformPanelDropdown = [
  ...transformPanels,
  "backfaceVisibility",
] as const;

export type TransformPanel = (typeof transformPanels)[number];

export const properties = [
  "translate",
  "scale",
  "transform",
  "backfaceVisibility",
] satisfies Array<StyleProperty>;

/**
 * Component
 */
export const Section = (props: SectionProps) => {
  /**
   * Store
   */
  const t = useStore($tTransforms);

  /**
   * State
   */
  const [isOpen, setIsOpen] = useState(true);

  if (isFeatureEnabled("transforms") === false) {
    return;
  }

  const { currentStyle, createBatchUpdate } = props;
  const translateStyleSource = getStyleSource(currentStyle["translate"]);
  const scaleStyleSource = getStyleSource(currentStyle["scale"]);
  const rotateAndSkewStyleSrouce = getStyleSource(currentStyle["transform"]);
  const backfaceVisibilityStyleSource = getStyleSource(
    currentStyle["backfaceVisibility"]
  );

  const isAnyTransformPropertyAdded = transformPanels.some((panel) =>
    isTransformPanelPropertyUsed({
      currentStyle: props.currentStyle,
      panel,
    })
  );

  const handleResetForAllTransformProperties = () => {
    const batch = createBatchUpdate();
    batch.deleteProperty("translate");
    batch.deleteProperty("scale");
    batch.deleteProperty("transform");
    batch.deleteProperty("backfaceVisibility");
    batch.publish();
  };

  return (
    <CollapsibleSectionRoot
      fullWidth
      label={t.transforms}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <SectionTitle
          dots={getDots(currentStyle, properties)}
          suffix={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SectionTitleButton prefix={<PlusIcon />}></SectionTitleButton>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  collisionPadding={16}
                  css={{ width: theme.spacing[20] }}
                >
                  {transformPanelDropdown.map((panel) => {
                    return (
                      <DropdownMenuItem
                        disabled={
                          isTransformPanelPropertyUsed({
                            currentStyle: props.currentStyle,
                            panel,
                          }) === true
                        }
                        key={panel}
                        onSelect={() => {
                          addDefaultsForTransormSection({
                            currentStyle: props.currentStyle,
                            setProperty: props.setProperty,
                            panel,
                          });
                          setIsOpen(true);
                        }}
                      >
                        {t[panel]}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          }
        >
          <PropertyName
            title={t.transforms}
            style={currentStyle}
            properties={properties}
            label={
              <SectionTitleLabel
                color={
                  translateStyleSource ||
                  scaleStyleSource ||
                  rotateAndSkewStyleSrouce ||
                  backfaceVisibilityStyleSource
                }
              >
                {t.transforms}
              </SectionTitleLabel>
            }
            onReset={handleResetForAllTransformProperties}
          />
        </SectionTitle>
      }
    >
      {isAnyTransformPropertyAdded === true ? (
        <CssValueListArrowFocus>
          <Flex direction="column">
            {transformPanels.map((panel, index) => (
              <TransformSection
                {...props}
                key={panel}
                index={index}
                panel={panel}
              />
            ))}
          </Flex>
        </CssValueListArrowFocus>
      ) : undefined}

      <BackfaceVisibility {...props} />
    </CollapsibleSectionRoot>
  );
};

/**
 * Compoennt
 */
const TransformSection = (
  props: SectionProps & { index: number; panel: TransformPanel }
) => {
  /**
   * Props
   */
  const { currentStyle, setProperty, deleteProperty, panel, index } = props;

  /**
   * Store
   */
  const t = useStore($tTransforms);

  const properties = useMemo(() => {
    const property =
      panel === "rotate" || panel === "skew" ? "transform" : panel;
    const value = currentStyle[property]?.value;

    if (value === undefined || value.type !== "tuple") {
      return;
    }

    return getHumanizedTextFromTransformLayer(panel, value);
  }, [currentStyle, panel]);

  if (properties === undefined) {
    return;
  }

  const contentPanelProps: TransformPanelProps = {
    currentStyle,
    setProperty,
    deleteProperty,
    propertyValue: properties.value,
  };

  const translatePanelProps: TransformPanelProps = {
    ...contentPanelProps,
    labels: {
      xLable: t.translateX,
      yLabel: t.translateY,
      zLabel: t.translateZ,
    },
  };

  const scalePanelProps: TransformPanelProps = {
    ...contentPanelProps,
    labels: {
      xLable: t.scaleX,
      yLabel: t.scaleY,
      zLabel: t.scaleZ,
    },
  };

  const rotatePanelProps: TransformPanelProps = {
    ...contentPanelProps,
    labels: {
      xLable: t.scaleX,
      yLabel: t.scaleY,
      zLabel: t.scaleZ,
    },
  };

  const skewPanelProps: TransformPanelProps = {
    ...contentPanelProps,
    labels: {
      xLable: t.scaleX,
      yLabel: t.scaleY,
    },
  };

  return (
    <FloatingPanel
      title={t[panel]}
      content={
        <Flex direction="column" css={{ p: theme.spacing[9] }}>
          {panel === "translate" && (
            <TranslatePanelContent {...translatePanelProps} />
          )}
          {panel === "scale" && <ScalePanelContent {...scalePanelProps} />}
          {panel === "rotate" && <RotatePanelContent {...rotatePanelProps} />}
          {panel === "skew" && <SkewPanelContent {...skewPanelProps} />}
        </Flex>
      }
    >
      <CssValueListItem
        id={panel}
        index={index}
        hidden={properties.value.hidden}
        label={<Label truncate>{properties.label}</Label>}
        buttons={
          <>
            <SmallToggleButton
              variant="normal"
              pressed={properties.value.hidden}
              tabIndex={-1}
              onPressedChange={() =>
                handleHideTransformProperty({
                  currentStyle,
                  setProperty,
                  panel,
                })
              }
              icon={
                properties.value.hidden ? (
                  <EyeconClosedIcon />
                ) : (
                  <EyeconOpenIcon />
                )
              }
            />
            <SmallIconButton
              variant="destructive"
              tabIndex={-1}
              disabled={properties.value.hidden}
              icon={<SubtractIcon />}
              onClick={() =>
                handleDeleteTransformProperty({
                  currentStyle,
                  setProperty,
                  deleteProperty,
                  panel,
                })
              }
            />
          </>
        }
      ></CssValueListItem>
    </FloatingPanel>
  );
};
