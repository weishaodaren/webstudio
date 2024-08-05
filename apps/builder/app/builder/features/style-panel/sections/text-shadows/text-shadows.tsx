import { CollapsibleSectionRoot } from "~/builder/shared/collapsible-section";
import type { SectionProps } from "../shared/section";
import type { LayersValue, StyleProperty } from "@webstudio-is/css-engine";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $tTextShadows } from "~/shared/nano-states";
import {
  SectionTitle,
  SectionTitleButton,
  SectionTitleLabel,
  Tooltip,
  Text,
} from "@webstudio-is/design-system";
import { InfoCircleIcon, PlusIcon } from "@webstudio-is/icons";
import { addLayer } from "../../style-layer-utils";
import { parseCssValue } from "@webstudio-is/css-data";
import { getDots } from "../../shared/collapsible-section";
import { PropertyName } from "../../shared/property-name";
import { getStyleSource } from "../../shared/style-info";
import { LayersList } from "../../style-layers-list";
import { ShadowContent } from "../../shared/shadow-content";

export const properties = ["textShadow"] satisfies Array<StyleProperty>;

const property: StyleProperty = properties[0];
const initialTextShadow = "0px 2px 5px rgba(0, 0, 0, 0.2)";

export const Section = (props: SectionProps) => {
  /**
   * Props
   */
  const { currentStyle, createBatchUpdate, deleteProperty } = props;

  /**
   * Store
   */
  const t = useStore($tTextShadows);

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
      label={t.textShadows}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <SectionTitle
          dots={getDots(currentStyle, properties)}
          suffix={
            <SectionTitleButton
              prefix={<PlusIcon />}
              onClick={() => {
                addLayer(
                  property,
                  parseCssValue(property, initialTextShadow) as LayersValue,
                  currentStyle,
                  createBatchUpdate
                );
                setIsOpen(true);
              }}
            />
          }
        >
          <PropertyName
            title={t.textShadows}
            style={currentStyle}
            properties={properties}
            description={t.description}
            label={
              <SectionTitleLabel color={sectionStyleSource}>
                {t.textShadows}
              </SectionTitleLabel>
            }
            onReset={() => deleteProperty(property)}
          />
        </SectionTitle>
      }
    >
      {value?.type === "layers" && value.value.length > 0 && (
        <LayersList
          {...props}
          property={property}
          value={value}
          label={t.textShadows}
          deleteProperty={deleteProperty}
          renderContent={(layerProps) => {
            if (layerProps.layer.type !== "tuple") {
              return <></>;
            }

            return (
              <ShadowContent
                {...layerProps}
                layer={layerProps.layer}
                property={property}
                tooltip={
                  <Tooltip
                    variant="wrapped"
                    content={
                      <Text>
                        Paste a text-shadow CSS code without the property name,
                        for example:
                        <br /> <br />
                        <Text variant="monoBold">{initialTextShadow}</Text>
                      </Text>
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
