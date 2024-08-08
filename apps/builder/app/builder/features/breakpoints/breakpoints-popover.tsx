import { useState } from "react";
import { useStore } from "@nanostores/react";
import type { Breakpoint } from "@webstudio-is/sdk";
import {
  theme,
  PopoverSeparator,
  Flex,
  Label,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  MenuCheckedIcon,
  MenuItemIndicator,
  List,
  ListItem,
  MenuItemButton,
  Box,
  PopoverMenuItemRightSlot,
  Tooltip,
} from "@webstudio-is/design-system";
import { BreakpointsEditor } from "./breakpoints-editor";
import { BreakpointsPopoverToolbarButton } from "./breakpoints-popover-toolbar-button";
import { WidthInput } from "./width-input";
import { ConfirmationDialog } from "./confirmation-dialog";
import {
  $breakpoints,
  $styles,
  $selectedBreakpointId,
  $selectedBreakpoint,
  $tInspector,
  $tSize,
} from "~/shared/nano-states";
import {
  $breakpointsMenuView,
  groupBreakpoints,
  isBaseBreakpoint,
  minCanvasWidth,
} from "~/shared/breakpoints";
import { $scale } from "~/builder/shared/nano-states";
import { setCanvasWidth } from "./use-set-initial-canvas-width";
import { serverSyncStore } from "~/shared/sync";

export const BreakpointsPopover = () => {
  /**
   * Store
   */
  const t = useStore($tInspector);
  const tSize = useStore($tSize);
  const view = useStore($breakpointsMenuView);
  const [breakpointToDelete, setBreakpointToDelete] = useState<
    Breakpoint | undefined
  >();
  const breakpoints = useStore($breakpoints);
  const selectedBreakpoint = useStore($selectedBreakpoint);
  const scale = useStore($scale);

  if (selectedBreakpoint === undefined) {
    return null;
  }

  const handleDelete = () => {
    if (breakpointToDelete === undefined) {
      return;
    }
    serverSyncStore.createTransaction(
      [$breakpoints, $styles],
      (breakpoints, styles) => {
        const breakpointId = breakpointToDelete.id;
        breakpoints.delete(breakpointId);
        for (const [styleDeclKey, styleDecl] of styles) {
          if (styleDecl.breakpointId === breakpointId) {
            styles.delete(styleDeclKey);
          }
        }
      }
    );

    if (breakpointToDelete.id === selectedBreakpoint.id) {
      const breakpointsArray = Array.from(breakpoints.values());
      const base =
        breakpointsArray.find(isBaseBreakpoint) ?? breakpointsArray[0];
      $selectedBreakpointId.set(base.id);
      setCanvasWidth(base.id);
    }
    setBreakpointToDelete(undefined);
    $breakpointsMenuView.set("editor");
  };

  return (
    <Popover
      open={view !== undefined}
      onOpenChange={(isOpen) => {
        $breakpointsMenuView.set(isOpen ? "initial" : undefined);
      }}
    >
      <Tooltip content={t.breakpoints}>
        <PopoverTrigger aria-label={t.breakpoints} asChild>
          <BreakpointsPopoverToolbarButton css={{ gap: theme.spacing[5] }} />
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent sideOffset={0} collisionPadding={4} align="start">
        {view === "confirmation" && breakpointToDelete && (
          <ConfirmationDialog
            labels={{
              deleteBreakpoints: t.deleteBreakpoints,
              deleteBreakpointsContent: t.deleteBreakpointsContent,
              deleteText: t.deleteText,
              abortText: t.abortText,
            }}
            breakpoint={breakpointToDelete}
            onAbort={() => {
              setBreakpointToDelete(undefined);
              $breakpointsMenuView.set("editor");
            }}
            onConfirm={handleDelete}
          />
        )}
        {view === "editor" && (
          <BreakpointsEditor
            onDelete={(breakpoint) => {
              setBreakpointToDelete(breakpoint);
              $breakpointsMenuView.set("confirmation");
            }}
          />
        )}
        {view === "initial" && (
          <>
            <Flex css={{ px: theme.spacing[7], py: theme.spacing[5] }} gap="3">
              <WidthInput label={tSize.width} min={minCanvasWidth} />
              <Flex align="center" gap="2">
                <Label>{t.scale}</Label>
                <Button
                  color="neutral"
                  css={{ width: theme.spacing[17] }}
                  tabIndex={-1}
                >
                  {Math.round(scale)}%
                </Button>
              </Flex>
            </Flex>
            <PopoverSeparator />
            <List asChild>
              <Flex
                direction="column"
                css={{ px: theme.spacing[3], py: theme.spacing[5] }}
              >
                {groupBreakpoints(Array.from(breakpoints.values())).map(
                  (breakpoint, index) => {
                    return (
                      <ListItem
                        asChild
                        onSelect={() => {
                          $selectedBreakpointId.set(breakpoint.id);
                          setCanvasWidth(breakpoint.id);
                        }}
                        index={index}
                        key={breakpoint.id}
                      >
                        <MenuItemButton withIndicator>
                          {breakpoint === selectedBreakpoint && (
                            <MenuItemIndicator>
                              <MenuCheckedIcon />
                            </MenuItemIndicator>
                          )}
                          <Box
                            css={{ flexGrow: 1, textAlign: "left" }}
                            as="span"
                          >
                            {breakpoint.label}
                          </Box>
                          <PopoverMenuItemRightSlot
                            css={{ color: theme.colors.foregroundSubtle }}
                          >
                            {breakpoint.minWidth !== undefined
                              ? `≥ ${breakpoint.minWidth} PX`
                              : breakpoint.maxWidth !== undefined
                                ? `≤ ${breakpoint.maxWidth} PX`
                                : t.allSizes}
                          </PopoverMenuItemRightSlot>
                        </MenuItemButton>
                      </ListItem>
                    );
                  }
                )}
              </Flex>
            </List>
          </>
        )}
        {(view === "editor" || view === "initial") && (
          <>
            <PopoverSeparator />
            <Flex
              css={{
                justifyContent: "center",
                padding: theme.spacing[5],
              }}
            >
              <Button
                color="neutral"
                css={{ flexGrow: 1 }}
                onClick={(event) => {
                  event.preventDefault();
                  $breakpointsMenuView.set(
                    view === "initial" ? "editor" : "initial"
                  );
                }}
              >
                {view === "editor" ? t.done : t.editBreakpoints}
              </Button>
            </Flex>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
