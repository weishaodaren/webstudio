import {
  DeprecatedList,
  DeprecatedListItem,
  useDeprecatedList,
  theme,
  useSearchFieldKeys,
  findNextListItemIndex,
} from "@webstudio-is/design-system";
import {
  AssetsShell,
  deleteAssets,
  Separator,
  useAssets,
} from "~/builder/shared/assets";
import { useEffect, useMemo, useState } from "react";
import { useMenu } from "./item-menu";
import { CheckMarkIcon } from "@webstudio-is/icons";
import {
  type Item,
  filterIdsByFamily,
  filterItems,
  groupItemsByType,
  toItems,
} from "./item-utils";

const useLogic = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const { assetContainers } = useAssets("font");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const fontItems = useMemo(() => toItems(assetContainers), [assetContainers]);

  const searchProps = useSearchFieldKeys({
    onMove({ direction }) {
      if (direction === "current") {
        handleChangeCurrent(selectedIndex);
        return;
      }
      const nextIndex = findNextListItemIndex(
        selectedIndex,
        groupedItems.length,
        direction
      );
      setSelectedIndex(nextIndex);
    },
  });

  const filteredItems = useMemo(
    () =>
      searchProps.value === ""
        ? fontItems
        : filterItems(searchProps.value, fontItems),
    [fontItems, searchProps.value]
  );

  const { uploadedItems, systemItems, groupedItems } = useMemo(
    () => groupItemsByType(filteredItems),
    [filteredItems]
  );
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    setCurrentIndex(groupedItems.findIndex((item) => item.label === value));
  }, [groupedItems, value]);

  const handleChangeCurrent = (nextCurrentIndex: number) => {
    const item = groupedItems[nextCurrentIndex];
    if (item !== undefined) {
      setCurrentIndex(nextCurrentIndex);
      onChange(item.label);
    }
  };

  const { getItemProps, getListProps } = useDeprecatedList({
    items: groupedItems,
    selectedIndex,
    currentIndex,
    onSelect: setSelectedIndex,
    onChangeCurrent: handleChangeCurrent,
  });

  const handleDelete = (index: number) => {
    const family = groupedItems[index].label;
    const ids = filterIdsByFamily(family, assetContainers);
    deleteAssets(ids);
    if (index === currentIndex) {
      setCurrentIndex(-1);
    }
  };

  return {
    groupedItems,
    uploadedItems,
    systemItems,
    selectedIndex,
    handleDelete,
    handleSelect: setSelectedIndex,
    getItemProps,
    getListProps,
    searchProps,
  };
};

type FontsManagerProps = {
  value: string;
  onChange: (value: string) => void;
};

export const FontsManager = ({ value, onChange }: FontsManagerProps) => {
  const {
    groupedItems,
    uploadedItems,
    systemItems,
    handleDelete,
    handleSelect,
    selectedIndex,
    getListProps,
    getItemProps,
    searchProps,
  } = useLogic({ onChange, value });

  const listProps = getListProps();
  const { render: renderMenu, isOpen: isMenuOpen } = useMenu({
    selectedIndex,
    onSelect: handleSelect,
    onDelete: handleDelete,
  });

  const renderItem = (item: Item, index: number) => {
    const { key, ...itemProps } = getItemProps({ index });
    return (
      <DeprecatedListItem
        {...itemProps}
        key={key}
        prefix={itemProps.current ? <CheckMarkIcon /> : undefined}
        suffix={item.type === "uploaded" ? renderMenu(index) : undefined}
      >
        {item.label}
      </DeprecatedListItem>
    );
  };

  return (
    <AssetsShell
      searchProps={searchProps}
      type="font"
      isEmpty={groupedItems.length === 0}
    >
      <DeprecatedList
        {...listProps}
        onBlur={(event) => {
          if (isMenuOpen === false) {
            listProps.onBlur(event);
          }
        }}
      >
        {uploadedItems.length !== 0 && (
          <DeprecatedListItem state="disabled">{"Uploaded"}</DeprecatedListItem>
        )}
        {uploadedItems.map(renderItem)}
        {systemItems.length !== 0 && (
          <>
            {uploadedItems.length !== 0 && (
              <Separator css={{ mx: theme.spacing[9] }} />
            )}
            <DeprecatedListItem state="disabled">{"System"}</DeprecatedListItem>
          </>
        )}
        {systemItems.map((item, index) =>
          renderItem(item, index + uploadedItems.length)
        )}
      </DeprecatedList>
    </AssetsShell>
  );
};
