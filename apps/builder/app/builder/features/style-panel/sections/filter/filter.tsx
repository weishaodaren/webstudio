import { CollapsibleSectionRoot } from "~/builder/shared/collapsible-section";
import { $tFilters } from "~/shared/nano-states";
import type { SectionProps } from "../shared/section";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import {
  Flex,
  SectionTitle,
  SectionTitleButton,
  SectionTitleLabel,
  Tooltip,
  Text,
} from "@webstudio-is/design-system";
import { parseCssValue } from "@webstudio-is/css-data";
import { getDots } from "../../shared/collapsible-section";
import { PropertyName } from "../../shared/property-name";
import { InfoCircleIcon, PlusIcon } from "@webstudio-is/icons";
import { LayersValue, type StyleProperty } from "@webstudio-is/css-engine";
import { getStyleSource } from "../../shared/style-info";
import { LayersList } from "../../style-layers-list";
import { addLayer } from "../../style-layer-utils";
import { FilterSectionContent } from "../../shared/filter-content";

export const properties = ["filter"] satisfies Array<StyleProperty>;

const property: StyleProperty = properties[0];
const initialFilter = "blur(0px)";

export const Section = (props: SectionProps) => {
  /**
   * Props
   */
  const { currentStyle, deleteProperty } = props;

  /**
   * Store
   */
  const t = useStore($tFilters);

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
      label={t.filters}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <SectionTitle
          dots={getDots(currentStyle, properties)}
          suffix={
            <Tooltip content={"Add a filter"}>
              <SectionTitleButton
                prefix={<PlusIcon />}
                onClick={() => {
                  addLayer(
                    property,
                    parseCssValue(property, initialFilter) as LayersValue,
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
            title={t.filters}
            style={currentStyle}
            properties={properties}
            description={t.description}
            label={
              <SectionTitleLabel color={sectionStyleSource}>
                {t.filters}
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
          label={t.filters}
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
                        <Text variant="regularBold">{t.filters}</Text>
                        <Text variant="monoBold">filter</Text>
                        <Text>
                          Applies graphical effects like blur or color shift to
                          an element, for example:
                          <br /> <br />
                          <Text variant="mono">{initialFilter}</Text>
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
