import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import {
  type WsComponentMeta,
  componentCategories,
} from "@webstudio-is/react-sdk";
import {
  theme,
  Flex,
  ComponentCard,
  ScrollArea,
  List,
  ListItem,
} from "@webstudio-is/design-system";
import { PlusIcon } from "@webstudio-is/icons";
import { CollapsibleSection } from "~/builder/shared/collapsible-section";
import type { TabContentProps } from "../../types";
import { Header, CloseButton, Root } from "../../shared/panel";
import {
  dragItemAttribute,
  elementToComponentName,
  useDraggable,
} from "./use-draggable";
import { MetaIcon } from "~/builder/shared/meta-icon";
import {
  $registeredComponentMetas,
  $selectedPage,
  $tComponents,
  $tComponentsCategory,
  $tLeftPanel,
} from "~/shared/nano-states";
import { getMetaMaps, type ComponentsInfo } from "./get-meta-maps";
import { getInstanceLabel } from "~/shared/instance-utils";
import { isFeatureEnabled } from "@webstudio-is/feature-flags";
import { insert } from "./insert";

/**
 * Component
 */
export const TabContent = ({ publish, onSetActiveTab }: TabContentProps) => {
  /**
   * Store
   */
  const t = useStore($tComponents);
  const tComponentsCategory = useStore($tComponentsCategory);
  const tLeftPanel = useStore($tLeftPanel);
  const metaByComponentName = useStore($registeredComponentMetas);
  const selectedPage = useStore($selectedPage);

  const documentType = selectedPage?.meta.documentType ?? "html";

  /**
   * Memo
   * @description 组件国际化映射
   * @returns { ComponentsInfo }
   */
  const mapping: ComponentsInfo = useMemo(() => {
    const {
      box,
      boxDescription,
      link,
      linkDescription,
      list,
      listDescription,
      listItem,
      listItemDescription,
      separator,
      separatorDescription,
      slot,
      slotDescription,
      html,
      htmlDescription,
      code,
      codeDescription,
      text,
      textDescription,
      heading,
      headingDescription,
      paragraph,
      paragraphDescription,
      blockquote,
      blockquoteDescription,
      webhook,
      webhookDescription,
      contentEmbed,
      contentEmbedDescription,
      image,
      imageDescription,
      vimeo,
      vimeoDescription,
      form,
      formDescription,
      button,
      buttonDescription,
      inputLabel,
      inputLabelDescription,
      textInput,
      textInputDescription,
      select,
      selectDescription,
      textarea,
      textareaDescription,
      radio,
      radioDescription,
      checkbox,
      checkboxDescription,
      collection,
      collectionDescription,
      time,
      timeDescription,
    } = t;
    return {
      Box: { label: box, description: boxDescription },
      Link: { label: link, description: linkDescription },
      List: { label: list, description: listDescription },
      "List Item": { label: listItem, description: listItemDescription },
      Separator: { label: separator, description: separatorDescription },
      Slot: { label: slot, description: slotDescription },
      "HTML Embed": { label: html, description: htmlDescription },
      "Code Text": { label: code, description: codeDescription },
      Text: { label: text, description: textDescription },
      Heading: { label: heading, description: headingDescription },
      Paragraph: { label: paragraph, description: paragraphDescription },
      Blockquote: { label: blockquote, description: blockquoteDescription },
      "Webhook Form": { label: webhook, description: webhookDescription },
      "Content Embed": {
        label: contentEmbed,
        description: contentEmbedDescription,
      },
      Image: { label: image, description: imageDescription },
      Vimeo: { label: vimeo, description: vimeoDescription },
      Form: { label: form, description: formDescription },
      Button: { label: button, description: buttonDescription },
      "Input Label": { label: inputLabel, description: inputLabelDescription },
      "Text Input": { label: textInput, description: textInputDescription },
      Select: { label: select, description: selectDescription },
      "Text Area": { label: textarea, description: textareaDescription },
      Radio: { label: radio, description: radioDescription },
      Checkbox: { label: checkbox, description: checkboxDescription },
      Collection: { label: collection, description: collectionDescription },
      Time: { label: time, description: timeDescription },
    };
  }, [t]);

  /**
   * Memo
   * @description 组件分类
   */
  const { metaByCategory, componentNamesByMeta } = useMemo(
    () => getMetaMaps(metaByComponentName, mapping),
    [mapping, metaByComponentName]
  );

  const { dragCard, draggableContainerRef } = useDraggable({
    publish,
    metaByComponentName,
  });

  return (
    <Root ref={draggableContainerRef}>
      <Header
        title={t.components}
        suffix={
          <CloseButton
            onClick={() => onSetActiveTab("none")}
            label={tLeftPanel.closePanel}
          />
        }
      />
      <ScrollArea>
        {/* 分类 */}
        {componentCategories
          .filter((category) => {
            if (category === "hidden") {
              return false;
            }

            // Only xml category is allowed for xml document type
            if (documentType === "xml") {
              return category === "xml" || category === "data";
            }
            // Hide xml category for non-xml document types
            if (category === "xml") {
              return false;
            }

            if (
              isFeatureEnabled("internalComponents") === false &&
              category === "internal"
            ) {
              return false;
            }

            return true;
          })
          .map((category) => (
            <CollapsibleSection
              label={tComponentsCategory[category]}
              key={category}
              fullWidth
            >
              <List asChild>
                <Flex
                  gap="2"
                  wrap="wrap"
                  css={{ px: theme.spacing[9], overflow: "auto" }}
                >
                  {/* 组件 */}
                  {(metaByCategory.get(category) ?? [])
                    .filter((meta: WsComponentMeta) => {
                      if (documentType === "xml" && meta.category === "data") {
                        return (
                          componentNamesByMeta.get(meta) === "ws:collection"
                        );
                      }
                      return true;
                    })
                    .map((meta: WsComponentMeta, index) => {
                      const component = componentNamesByMeta.get(meta);
                      if (component === undefined) {
                        return;
                      }
                      if (
                        isFeatureEnabled("filters") === false &&
                        component === "RemixForm"
                      ) {
                        return;
                      }
                      if (
                        isFeatureEnabled("cms") === false &&
                        component === "ContentEmbed"
                      ) {
                        return;
                      }
                      return (
                        <ListItem
                          asChild
                          index={index}
                          key={component}
                          onSelect={(event) => {
                            const component = elementToComponentName(
                              event.target as HTMLElement,
                              metaByComponentName
                            );
                            if (component) {
                              onSetActiveTab("none");
                              insert(component);
                            }
                          }}
                        >
                          <ComponentCard
                            {...{ [dragItemAttribute]: component }}
                            label={getInstanceLabel({ component }, meta)}
                            description={meta.description}
                            icon={<MetaIcon size="auto" icon={meta.icon} />}
                          />
                        </ListItem>
                      );
                    })}
                  {dragCard}
                </Flex>
              </List>
            </CollapsibleSection>
          ))}
      </ScrollArea>
    </Root>
  );
};

export const Icon = PlusIcon;

export const label = "Components";
