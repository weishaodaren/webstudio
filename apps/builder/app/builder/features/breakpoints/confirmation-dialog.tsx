import type { Breakpoint } from "@webstudio-is/sdk";
import { theme, Button, Flex, Text } from "@webstudio-is/design-system";

type ConfirmationDialogProps = {
  onAbort: () => void;
  onConfirm: () => void;
  breakpoint: Breakpoint;
  labels: {
    deleteBreakpoints: ({ label }: { label: string }) => string;
    deleteBreakpointsContent: string;
    deleteText: string;
    abortText: string;
  };
};

export const ConfirmationDialog = ({
  breakpoint,
  onConfirm,
  onAbort,
  labels: {
    deleteBreakpoints,
    deleteBreakpointsContent,
    deleteText,
    abortText,
  },
}: ConfirmationDialogProps) => {
  return (
    <Flex
      gap="2"
      direction="column"
      css={{ px: theme.spacing[11], py: theme.spacing[5], width: 300 }}
    >
      {/* <Text>{`Are you sure you want to delete "${breakpoint.label}"?`}</Text> */}
      <Text>{deleteBreakpoints({ label: breakpoint.label })}</Text>
      <Text>{deleteBreakpointsContent}</Text>
      <Flex justify="end" gap="2">
        <Button
          onClick={() => {
            onConfirm();
          }}
        >
          {deleteText}
        </Button>
        <Button
          color="neutral"
          autoFocus
          onClick={() => {
            onAbort();
          }}
        >
          {abortText}
        </Button>
      </Flex>
    </Flex>
  );
};
