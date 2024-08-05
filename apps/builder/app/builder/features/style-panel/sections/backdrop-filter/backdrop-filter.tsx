import { useStore } from "@nanostores/react";
import { $tBackdropFilters } from "~/shared/nano-states";
import { CollapsibleSectionRoot } from "~/builder/shared/collapsible-section";
import type { SectionProps } from "../shared/section";
import type { LayersValue, StyleProperty } from "@webstudio-is/css-engine";
import { useState } from "react";
import {
  SectionTitle,
  SectionTitleButton,
  SectionTitleLabel,
  Tooltip,
  Flex,
  Text,
} from "@webstudio-is/design-system";
import { parseCssValue } from "@webstudio-is/css-data";
import { PropertyName } from "../../shared/property-name";
import { getStyleSource } from "../../shared/style-info";
import { getDots } from "../../shared/collapsible-section";
import { InfoCircleIcon, PlusIcon } from "@webstudio-is/icons";
import { addLayer } from "../../style-layer-utils";
import { LayersList } from "../../style-layers-list";
import { FilterSectionContent } from "../../shared/filter-content";

export const properties = ["backdropFilter"] satisfies Array<StyleProperty>;

const property: StyleProperty = properties[0];
const initialBackdropFilter = "blur(0px)";

export const Section = (props: SectionProps) => {
  /**
   * Props
   */
  const { currentStyle, deleteProperty } = props;

  /**
   * Store
   */
  const t = useStore($tBackdropFilters);

  /**
   * State
   */
  const [isOpen, setIsOpen] = useState(true);
  const value = currentStyle[property]?.value;
  const sectionStyleSource =
    value?.type === "unparsed" || value?.type === "guaranteedInvalid"
      ? undefined
      : getStyleSource(currentStyle[property]);

  return (
    <CollapsibleSectionRoot
      fullWidth
      label={t.backdropFilters}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <SectionTitle
          dots={getDots(currentStyle, properties)}
          suffix={
            <Tooltip content={"Add a backdrop-filter"}>
              <SectionTitleButton
                prefix={<PlusIcon />}
                onClick={() => {
                  addLayer(
                    property,
                    parseCssValue(
                      property,
                      initialBackdropFilter
                    ) as LayersValue,
                    currentStyle,
                    props.createBatchUpdate
                  );
                  setIsOpen(true);
                }}
              />
            </Tooltip>
          }
        >
          <PropertyName
            title={t.backdropFilters}
            style={currentStyle}
            properties={properties}
            description={t.description}
            label={
              <SectionTitleLabel color={sectionStyleSource}>
                {t.backdropFilters}
              </SectionTitleLabel>
            }
            onReset={() => deleteProperty(property)}
          />
        </SectionTitle>
      }
    >
      {value?.type === "tuple" && value.value.length > 0 && (
        <LayersList
          {...props}
          property={property}
          value={value}
          label={t.backdropFilters}
          deleteProperty={deleteProperty}
          renderContent={(layerProps) => {
            if (layerProps.layer.type !== "function") {
              return <></>;
            }

            return (
              <FilterSectionContent
                {...layerProps}
                property={property}
                layer={layerProps.layer}
                tooltip={
                  <Tooltip
                    variant="wrapped"
                    content={
                      <Flex gap="2" direction="column">
                        <Text variant="regularBold">{t.backdropFilters}</Text>
                        <Text variant="monoBold">backdrop-filter</Text>
                        <Text>
                          Applies graphical effects like blur or color shift to
                          the area behind an element
                          <br /> <br />
                          <Text variant="mono">{initialBackdropFilter}</Text>
                        </Text>
                      </Flex>
                    }
                  >
                    <InfoCircleIcon />
                  </Tooltip>
                }
              />
            );
          }}
        />
      )}
    </CollapsibleSectionRoot>
  );
};
