import { useMemo, useState } from "react";
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
  SearchField,
  Separator,
  useSearchFieldKeys,
  findNextListItemIndex,
  Text,
  Box,
  Kbd,
} from "@webstudio-is/design-system";
import { PlusIcon } from "@webstudio-is/icons";
import { CollapsibleSection } from "~/builder/shared/collapsible-section";
import type { TabContentProps } from "../../types";
import { Header, CloseButton, Root } from "../../shared/panel";
import { dragItemAttribute, useDraggable } from "./use-draggable";
import { MetaIcon } from "~/builder/shared/meta-icon";
import {
  $registeredComponentMetas,
  $selectedPage,
  $tComponents,
  $tComponentsCategory,
} from "~/shared/nano-states";
import {
  getMetaMaps,
  type MetaByCategory,
  type ComponentNamesByMeta,
  type ComponentsInfo,
} from "./get-meta-maps";
import { getInstanceLabel } from "~/shared/instance-utils";
import { isFeatureEnabled } from "@webstudio-is/feature-flags";
import { insert } from "./insert";
import { matchSorter } from "match-sorter";
import { parseComponentName } from "@webstudio-is/sdk";

const namespace = "@webstudio-is/sdk-components-react-radix";

const matchComponents = (
  metas: Array<WsComponentMeta>,
  componentNamesByMeta: ComponentNamesByMeta,
  search: string
) => {
  const getKey = (meta: WsComponentMeta) => {
    if (meta.label) {
      return meta.label.toLowerCase();
    }
    const component = componentNamesByMeta.get(meta);

    if (component) {
      const [_namespace, name] = parseComponentName(component);
      return name.toLowerCase();
    }
    return "";
  };

  return matchSorter(metas, search, {
    keys: [getKey],
  });
};

type Groups = Array<{
  category: Exclude<WsComponentMeta["category"], undefined> | "found";
  metas: Array<WsComponentMeta>;
}>;

const filterAndGroupComponents = ({
  documentType = "html",
  metaByCategory,
  componentNamesByMeta,
  search,
}: {
  documentType?: "html" | "xml";
  metaByCategory: MetaByCategory;
  componentNamesByMeta: ComponentNamesByMeta;
  search: string;
}): Groups => {
  const categories = componentCategories.filter((category) => {
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
  });

  let groups: Groups = categories.map((category) => {
    const metas = (metaByCategory.get(category) ?? []).filter((meta) => {
      const component = componentNamesByMeta.get(meta);

      if (component === undefined) {
        return false;
      }

      // 内部组件隐藏
      if (meta.category === "internal") {
        return false;
      }

      // 海外视频组件隐藏
      if (component === "Vimeo") {
        return false;
      }

      if (documentType === "xml" && meta.category === "data") {
        return component === "ws:collection";
      }

      if (component === "RemixForm" && isFeatureEnabled("filters") === false) {
        return false;
      }

      if (component === "ContentEmbed" && isFeatureEnabled("cms") === false) {
        return false;
      }

      return true;
    });

    return { category, metas };
  });

  if (search.length !== 0) {
    let metas = groups.map((group) => group.metas).flat();
    metas = matchComponents(metas, componentNamesByMeta, search);
    groups = [{ category: "found", metas }];
  }

  groups = groups.filter((group) => group.metas.length > 0);

  return groups;
};

const findComponentIndex = (
  groups: Groups,
  componentNamesByMeta: ComponentNamesByMeta,
  selectedComponent?: string
) => {
  if (selectedComponent === undefined) {
    return { index: -1, metas: groups[0].metas };
  }

  for (const { metas } of groups) {
    const index = metas.findIndex((meta) => {
      return componentNamesByMeta.get(meta) === selectedComponent;
    });
    if (index === -1) {
      continue;
    }
    return { index, metas };
  }

  return { index: -1, metas: [] };
};

export const TabContent = ({ publish, onSetActiveTab }: TabContentProps) => {
  /**
   * Store
   */
  const t = useStore($tComponents);
  const tComponentsCategory = useStore($tComponentsCategory);
  const metaByComponentName = useStore($registeredComponentMetas);

  const selectedPage = useStore($selectedPage);
  const [selectedComponent, setSelectedComponent] = useState<string>();

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
      sheet,
      sheetDescription,
      navigationMenu,
      navigationMenuDescription,
      tabs,
      tabsDescription,
      accordion,
      accordionDescription,
      dialog,
      dialogDescription,
      collapsible,
      collapsibleDescription,
      popover,
      popoverDescription,
      tooltip,
      tooltipDescription,
      selectComponent,
      switchComponent,
      switchDescription,
      radioGroup,
      radioGroupDescription,
      labelComponent,
      labelDescription,
      markdownLabel,
      markdownDescription,
    } = t;
    return {
      Box: { label: box, description: boxDescription },
      Link: { label: link, description: linkDescription },
      List: { label: list, description: listDescription },
      ListItem: { label: listItem, description: listItemDescription },
      Separator: { label: separator, description: separatorDescription },
      Slot: { label: slot, description: slotDescription },
      CodeText: { label: code, description: codeDescription },
      Text: { label: text, description: textDescription },
      Heading: { label: heading, description: headingDescription },
      Paragraph: { label: paragraph, description: paragraphDescription },
      Blockquote: { label: blockquote, description: blockquoteDescription },
      Form: { label: webhook, description: webhookDescription },
      ContentEmbed: {
        label: contentEmbed,
        description: contentEmbedDescription,
      },
      Checkbox: {
        label: checkbox,
        description: checkboxDescription,
      },
      Image: { label: image, description: imageDescription },
      Vimeo: { label: vimeo, description: vimeoDescription },
      RemixForm: { label: form, description: formDescription },
      Button: { label: button, description: buttonDescription },
      "Input Label": { label: inputLabel, description: inputLabelDescription },
      Input: { label: textInput, description: textInputDescription },
      Select: { label: select, description: selectDescription },
      Textarea: { label: textarea, description: textareaDescription },
      RadioButton: { label: radio, description: radioDescription },
      [`${namespace}:Checkbox`]: {
        label: checkbox,
        description: checkboxDescription,
      },
      "ws:collection": {
        label: collection,
        description: collectionDescription,
      },
      "ws:descendant": {
        label: collection,
        description: collectionDescription,
      },
      Time: { label: time, description: timeDescription },
      [`${namespace}:Sheet`]: { label: sheet, description: sheetDescription },
      [`${namespace}:NavigationMenu`]: {
        label: navigationMenu,
        description: navigationMenuDescription,
      },
      [`${namespace}:Tabs`]: { label: tabs, description: tabsDescription },
      [`${namespace}:Accordion`]: {
        label: accordion,
        description: accordionDescription,
      },
      [`${namespace}:Dialog`]: {
        label: dialog,
        description: dialogDescription,
      },
      [`${namespace}:Collapsible`]: {
        label: collapsible,
        description: collapsibleDescription,
      },
      [`${namespace}:Popover`]: {
        label: popover,
        description: popoverDescription,
      },
      [`${namespace}:Tooltip`]: {
        label: tooltip,
        description: tooltipDescription,
      },
      [`${namespace}:Switch`]: {
        label: switchComponent,
        description: switchDescription,
      },
      [`${namespace}:RadioGroup`]: {
        label: radioGroup,
        description: radioGroupDescription,
      },
      [`${namespace}:Label`]: {
        label: labelComponent,
        description: labelDescription,
      },
      [`${namespace}:Select`]: {
        label: selectComponent,
        description: selectDescription,
      },
      HtmlEmbed: { label: html, description: htmlDescription },
      MarkdownEmbed: { label: markdownLabel, description: markdownDescription },
    };
  }, [t]);

  const handleInsert = (component: string) => {
    onSetActiveTab("none");
    insert(component);
  };

  const resetSelectedComponent = () => {
    setSelectedComponent(undefined);
  };

  const getSelectedComponent = () => {
    // When user didn't select a component but they have search input,
    // we want to always have the first component selected, so that user can just hit enter.
    if (selectedComponent === undefined && searchFieldProps.value) {
      return componentNamesByMeta.get(groups[0].metas[0]);
    }
    return selectedComponent;
  };

  const searchFieldProps = useSearchFieldKeys({
    onChange: resetSelectedComponent,
    onCancel: resetSelectedComponent,
    onMove({ direction }) {
      if (direction === "current") {
        const component = getSelectedComponent();
        if (component !== undefined) {
          handleInsert(component);
        }
        return;
      }

      const { index, metas } = findComponentIndex(
        groups,
        componentNamesByMeta,
        selectedComponent
      );

      const nextIndex = findNextListItemIndex(index, metas.length, direction);
      const nextComponent = componentNamesByMeta.get(metas[nextIndex]);

      if (nextComponent) {
        setSelectedComponent(nextComponent);
      }
    },
  });

  const { metaByCategory, componentNamesByMeta } = useMemo(
    () => getMetaMaps(metaByComponentName, mapping),
    [metaByComponentName, mapping]
  );

  const { dragCard, draggableContainerRef } = useDraggable({
    publish,
    metaByComponentName,
  });

  const groups = filterAndGroupComponents({
    documentType: selectedPage?.meta.documentType,
    metaByCategory,
    componentNamesByMeta,
    search: searchFieldProps.value,
  });

  return (
    <Root ref={draggableContainerRef}>
      <Header
        title={t.components}
        suffix={<CloseButton onClick={() => onSetActiveTab("none")} />}
      />
      {/* 隐藏搜索功能 */}
      {/* <Box css={{ padding: theme.spacing[9] }}>
        <SearchField
          {...searchFieldProps}
          autoFocus
          placeholder="Find components"
        />
      </Box> */}

      {/* <Separator /> */}

      <ScrollArea>
        {groups.map((group) => (
          <CollapsibleSection
            label={tComponentsCategory[group.category]}
            key={group.category}
            fullWidth
          >
            <List asChild>
              <Flex
                gap="2"
                wrap="wrap"
                css={{ px: theme.spacing[9], overflow: "auto" }}
              >
                {group.metas.map((meta: WsComponentMeta, index) => {
                  const component = componentNamesByMeta.get(meta);

                  if (component === undefined) {
                    return;
                  }

                  return (
                    <ListItem
                      asChild
                      state={
                        component === getSelectedComponent()
                          ? "selected"
                          : undefined
                      }
                      index={index}
                      key={component}
                      onSelect={() => {
                        handleInsert(component);
                      }}
                      onFocus={() => {
                        setSelectedComponent(component);
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
                {group.metas.length === 0 && (
                  <Flex grow justify="center" css={{ py: theme.spacing[10] }}>
                    <Text>No matching component</Text>
                  </Flex>
                )}
              </Flex>
            </List>
          </CollapsibleSection>
        ))}
      </ScrollArea>
    </Root>
  );
};

export const Icon = PlusIcon;

// export const label = (
//   <Flex gap="1">
//     <Text>Components</Text>
//     <Kbd value={["(A)"]} />
//   </Flex>
// );
export const label = "Components";
