import { useCallback, useEffect, useMemo, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
  TreeItemLabel,
  TreeItemBody,
  TreeNode,
  type TreeItemRenderProps,
  type ItemSelector,
  Tooltip,
  Box,
  Button,
  SmallIconButton,
  Text,
} from "@webstudio-is/design-system";
import {
  ChevronRightIcon,
  FolderIcon,
  HomeIcon,
  EllipsesIcon,
  NewFolderIcon,
  NewPageIcon,
  PageIcon,
  DynamicPageIcon,
} from "@webstudio-is/icons";
import type { TabContentProps } from "../../types";
import { CloseButton, Header, Root } from "../../shared/panel";
import { ExtendedPanel } from "../../shared/extended-panel";
import { NewPageSettings, PageSettings } from "./page-settings";
import {
  $pages,
  $selectedPageId,
  $tLeftPanelCategory,
  $tPages,
} from "~/shared/nano-states";
import { switchPage } from "~/shared/pages";
import {
  $editingPagesItemId,
  getAllChildrenAndSelf,
  reparentOrphansMutable,
  toTreeData,
  type TreeData,
} from "./page-utils";
import {
  FolderSettings,
  NewFolderSettings,
  newFolderId,
} from "./folder-settings";
import { serverSyncStore } from "~/shared/sync";
import { useMount } from "~/shared/hook-utils/use-mount";
import { ROOT_FOLDER_ID, type Folder } from "@webstudio-is/sdk";
import { atom } from "nanostores";
import { isPathnamePattern } from "~/builder/shared/url-pattern";

const ItemSuffix = ({
  isParentSelected,
  itemId,
  editingItemId,
  onEdit,
  type,
  closePageText,
  closeFolderText,
  openPageText,
  openFolderText,
}: {
  isParentSelected: boolean;
  itemId: string;
  editingItemId: string | undefined;
  onEdit: (itemId: string | undefined) => void;
  type: "folder" | "page";
  closePageText: string;
  closeFolderText: string;
  openPageText: string;
  openFolderText: string;
}) => {
  const isEditing = editingItemId === itemId;

  const menuLabel =
    type === "page"
      ? isEditing
        ? closePageText
        : openPageText
      : isEditing
        ? closeFolderText
        : openFolderText;

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const prevEditingItemId = useRef(editingItemId);
  useEffect(() => {
    // when settings panel close, move focus back to the menu button
    if (
      editingItemId === undefined &&
      prevEditingItemId.current === itemId &&
      buttonRef.current
    ) {
      buttonRef.current.focus();
    }
    prevEditingItemId.current = editingItemId;
  }, [editingItemId, itemId]);

  return (
    <Tooltip content={menuLabel} disableHoverableContent>
      <SmallIconButton
        aria-label={menuLabel}
        state={isParentSelected ? "open" : undefined}
        onClick={() => onEdit(isEditing ? undefined : itemId)}
        ref={buttonRef}
        icon={isEditing ? <ChevronRightIcon /> : <EllipsesIcon />}
      />
    </Tooltip>
  );
};

const useReparentOrphans = () => {
  useMount(() => {
    // Pages may not be loaded yet when switching betwen projects and the pages
    // panel was already visible - it mounts faster than we load the pages.
    if ($pages.get() === undefined) {
      return;
    }
    serverSyncStore.createTransaction([$pages], (pages) => {
      if (pages === undefined) {
        return;
      }
      reparentOrphansMutable(pages);
    });
  });
};

const isFolder = (id: string, folders: Array<Folder>) => {
  return id === newFolderId || folders.some((folder) => folder.id === id);
};

// We want to keep the state when panel is closed and opened again.
const $expandedItems = atom<Set<string>>(new Set());

const PagesPanel = ({
  onClose,
  onCreateNewFolder,
  onCreateNewPage,
  onSelect,
  selectedPageId,
  onEdit,
  editingItemId,
}: {
  onClose: () => void;
  onCreateNewFolder: () => void;
  onCreateNewPage: () => void;
  onSelect: (pageId: string) => void;
  selectedPageId: string;
  onEdit: (pageId: string | undefined) => void;
  editingItemId?: string;
}) => {
  /**
   * Store
   */
  const t = useStore($tPages);
  const pages = useStore($pages);
  const treeData = useMemo(() => pages && toTreeData(pages), [pages]);
  const expandedItems = useStore($expandedItems);

  useReparentOrphans();
  const renderItem = useCallback(
    (props: TreeItemRenderProps<TreeData>) => {
      const isEditing = editingItemId === props.itemData.id;

      if (props.itemData.id === ROOT_FOLDER_ID) {
        return null;
      }

      return (
        <TreeItemBody
          {...props}
          suffix={
            <ItemSuffix
              closeFolderText={t.closeFolderSettings}
              closePageText={t.closePageSettings}
              openFolderText={t.openFolderSettings}
              openPageText={t.openPageSettings}
              type={props.itemData.type}
              isParentSelected={props.isSelected ?? false}
              itemId={props.itemData.id}
              editingItemId={editingItemId}
              onEdit={onEdit}
            />
          }
          alwaysShowSuffix={isEditing}
          forceFocus={isEditing}
        >
          {props.itemData.type === "folder" && (
            <TreeItemLabel prefix={<FolderIcon />}>
              {props.itemData.name}
            </TreeItemLabel>
          )}
          {props.itemData.type === "page" && (
            <TreeItemLabel
              prefix={
                props.itemData.id === pages?.homePage.id ? (
                  <HomeIcon />
                ) : isPathnamePattern(props.itemData.data.path) ? (
                  <DynamicPageIcon />
                ) : (
                  <PageIcon />
                )
              }
            >
              {props.itemData.data.name}
            </TreeItemLabel>
          )}
        </TreeItemBody>
      );
    },
    [editingItemId, onEdit, pages?.homePage.id, t]
  );

  const selectTreeNode = useCallback(
    ([itemId]: ItemSelector, all?: boolean) => {
      const folders = pages?.folders ?? [];
      if (isFolder(itemId, folders)) {
        const items = all
          ? getAllChildrenAndSelf(itemId, folders, "folder")
          : [itemId];
        const nextExpandedItems = new Set(expandedItems);
        items.forEach((itemId) => {
          nextExpandedItems.has(itemId)
            ? nextExpandedItems.delete(itemId)
            : nextExpandedItems.add(itemId);
        });
        $expandedItems.set(nextExpandedItems);
        return;
      }
      onSelect(itemId);
    },
    [onSelect, pages?.folders, expandedItems]
  );

  if (treeData === undefined || pages === undefined) {
    return null;
  }

  return (
    <Root>
      <Header
        title={t.pages}
        suffix={
          <>
            <Tooltip content={t.newFolder} side="bottom">
              <Button
                onClick={() => onCreateNewFolder()}
                aria-label={t.newFolder}
                prefix={<NewFolderIcon />}
                color="ghost"
              />
            </Tooltip>
            <Tooltip content={t.newPage} side="bottom">
              <Button
                onClick={() => onCreateNewPage()}
                aria-label={t.newPage}
                prefix={<NewPageIcon />}
                color="ghost"
              />
            </Tooltip>
            <CloseButton onClick={onClose} />
          </>
        }
      />
      <Box css={{ overflowY: "auto", flexBasis: 0, flexGrow: 1 }}>
        <TreeNode<TreeData>
          selectedItemSelector={[selectedPageId, treeData.root.id]}
          onSelect={selectTreeNode}
          itemData={treeData.root}
          renderItem={renderItem}
          getItemChildren={([nodeId]) => {
            if (nodeId === ROOT_FOLDER_ID) {
              return treeData.root.children;
            }
            const item = treeData.index.get(nodeId);
            if (item?.type === "folder") {
              return item.children;
            }
            // Page can't have children.
            return [];
          }}
          isItemHidden={() => false}
          getIsExpanded={([itemId]) => {
            return expandedItems.has(itemId);
          }}
          setIsExpanded={([itemId], isExpanded, all) => {
            const nextExpandedItems = new Set(expandedItems);
            if (itemId === undefined) {
              return;
            }
            const items = all
              ? getAllChildrenAndSelf(itemId, pages.folders, "folder")
              : [itemId];
            items.forEach((itemId) => {
              if (isExpanded) {
                nextExpandedItems.add(itemId);
                return;
              }
              nextExpandedItems.delete(itemId);
            });
            $expandedItems.set(nextExpandedItems);
          }}
        />
      </Box>
    </Root>
  );
};

const newPageId = "new-page";

const PageEditor = ({
  editingPageId,
  setEditingPageId,
}: {
  editingPageId: string;
  setEditingPageId: (pageId?: string) => void;
}) => {
  const currentPageId = useStore($selectedPageId);

  if (editingPageId === newPageId) {
    return (
      <NewPageSettings
        onClose={() => setEditingPageId(undefined)}
        onSuccess={(pageId) => {
          setEditingPageId(undefined);
          switchPage(pageId);
        }}
      />
    );
  }

  return (
    <PageSettings
      onClose={() => setEditingPageId(undefined)}
      onDelete={() => {
        setEditingPageId(undefined);
        // switch to home page when deleted currently selected page
        if (editingPageId === currentPageId) {
          const pages = $pages.get();
          if (pages) {
            switchPage(pages.homePage.id);
          }
        }
      }}
      onDuplicate={(newPageId) => {
        setEditingPageId(undefined);
        switchPage(newPageId);
      }}
      pageId={editingPageId}
      key={editingPageId}
    />
  );
};

const FolderEditor = ({
  editingFolderId,
  setEditingFolderId,
}: {
  editingFolderId: string;
  setEditingFolderId: (pageId?: string) => void;
}) => {
  if (editingFolderId === newFolderId) {
    return (
      <NewFolderSettings
        onClose={() => setEditingFolderId(undefined)}
        onSuccess={() => {
          setEditingFolderId(undefined);
        }}
        key={newFolderId}
      />
    );
  }

  return (
    <FolderSettings
      onClose={() => setEditingFolderId(undefined)}
      onDelete={() => {
        setEditingFolderId(undefined);
      }}
      folderId={editingFolderId}
      key={editingFolderId}
    />
  );
};

export const TabContent = ({ onSetActiveTab }: TabContentProps) => {
  const currentPageId = useStore($selectedPageId);
  const editingItemId = useStore($editingPagesItemId);
  const pages = useStore($pages);

  if (currentPageId === undefined || pages === undefined) {
    return;
  }

  return (
    <>
      <PagesPanel
        onClose={() => onSetActiveTab("none")}
        onCreateNewFolder={() => {
          $editingPagesItemId.set(
            editingItemId === newFolderId ? undefined : newFolderId
          );
        }}
        onCreateNewPage={() =>
          $editingPagesItemId.set(
            editingItemId === newPageId ? undefined : newPageId
          )
        }
        onSelect={(itemId) => {
          if (isFolder(itemId, pages.folders)) {
            return;
          }
          switchPage(itemId);
          onSetActiveTab("none");
        }}
        selectedPageId={currentPageId}
        onEdit={$editingPagesItemId.set}
        editingItemId={editingItemId}
      />

      <ExtendedPanel isOpen={editingItemId !== undefined}>
        {editingItemId !== undefined && (
          <>
            {isFolder(editingItemId, pages.folders) ? (
              <FolderEditor
                editingFolderId={editingItemId}
                setEditingFolderId={$editingPagesItemId.set}
              />
            ) : (
              <PageEditor
                editingPageId={editingItemId}
                setEditingPageId={$editingPagesItemId.set}
              />
            )}
          </>
        )}
      </ExtendedPanel>
    </>
  );
};

export const Icon = PageIcon;

export const label = "Pages";
