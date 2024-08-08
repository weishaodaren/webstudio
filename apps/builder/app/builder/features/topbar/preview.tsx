import { useStore } from "@nanostores/react";
import { PlayIcon } from "@webstudio-is/icons";
import { ToolbarToggleItem, Tooltip } from "@webstudio-is/design-system";
import { $isPreviewMode, $tInspector } from "~/shared/nano-states";
import { emitCommand } from "~/builder/shared/commands";

/**
 * Component
 */
export const PreviewButton = () => {
  /**
   * Store
   */
  const t = useStore($tInspector);
  const isPreviewMode = useStore($isPreviewMode);

  return (
    <Tooltip content={t.preview}>
      <ToolbarToggleItem
        value="preview"
        aria-label={t.preview}
        variant="preview"
        data-state={isPreviewMode ? "on" : "off"}
        onClick={() => emitCommand("togglePreview")}
        tabIndex={0}
      >
        <PlayIcon />
      </ToolbarToggleItem>
    </Tooltip>
  );
};
