import { useStore } from "@nanostores/react";
import {
  Button,
  FloatingPanelPopover,
  FloatingPanelPopoverContent,
  FloatingPanelPopoverTitle,
  FloatingPanelPopoverTrigger,
  FloatingPanelAnchor,
  theme,
  Tooltip,
  rawTheme,
} from "@webstudio-is/design-system";
import { ShareProjectContainer } from "~/shared/share-project";
import { $authPermit, $tInspector } from "~/shared/nano-states";
import { $isShareDialogOpen } from "~/builder/shared/nano-states";

export const ShareButton = ({
  projectId,
  hasProPlan,
}: {
  projectId: string;
  hasProPlan: boolean;
}) => {
  /**
   * Store
   */
  const t = useStore($tInspector);
  const isShareDialogOpen = useStore($isShareDialogOpen);
  const authPermit = useStore($authPermit);

  const isShareDisabled = authPermit !== "own";
  const tooltipContent = isShareDisabled
    ? "Only owner can share projects"
    : undefined;

  return (
    <FloatingPanelPopover
      modal
      open={isShareDialogOpen}
      onOpenChange={(isOpen) => {
        $isShareDialogOpen.set(isOpen);
      }}
    >
      <FloatingPanelAnchor>
        <Tooltip
          content={tooltipContent ?? t.shareTooltip}
          sideOffset={Number.parseFloat(rawTheme.spacing[5])}
        >
          <FloatingPanelPopoverTrigger asChild>
            <Button disabled={isShareDisabled} color="gradient">
              {t.share}
            </Button>
          </FloatingPanelPopoverTrigger>
        </Tooltip>
      </FloatingPanelAnchor>
      <FloatingPanelPopoverContent
        sideOffset={Number.parseFloat(rawTheme.spacing[8])}
        css={{
          marginRight: theme.spacing[3],
        }}
      >
        <ShareProjectContainer projectId={projectId} hasProPlan={hasProPlan} />
        <FloatingPanelPopoverTitle>{t.share}</FloatingPanelPopoverTitle>
      </FloatingPanelPopoverContent>
    </FloatingPanelPopover>
  );
};
