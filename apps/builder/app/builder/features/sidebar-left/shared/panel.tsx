import { useStore } from "@nanostores/react";
import {
  Button,
  Tooltip,
  Separator,
  PanelTitle,
  TitleSuffixSpacer,
  Flex,
  theme,
} from "@webstudio-is/design-system";
import { CrossIcon } from "@webstudio-is/icons";
import { forwardRef, type ComponentProps } from "react";
import { $tLeftPanel } from "~/shared/nano-states";

type HeaderProps = {
  title: string;
  suffix: React.ReactNode;
};

export const Header = ({ title, suffix }: HeaderProps) => {
  return (
    <>
      <PanelTitle suffix={suffix}>{title}</PanelTitle>
      <Separator />
    </>
  );
};

export { TitleSuffixSpacer as HeaderSuffixSpacer };

export const CloseButton = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label?: string;
}) => {
  /**
   * Store
   */
  const t = useStore($tLeftPanel);

  return (
    <Tooltip content={label || t.closePanel} side="bottom">
      <Button
        onClick={onClick}
        color="ghost"
        prefix={<CrossIcon />}
        aria-label={label}
      />
    </Tooltip>
  );
};

export const Root = forwardRef<HTMLDivElement, ComponentProps<typeof Flex>>(
  (props, ref) => {
    return (
      <Flex
        css={{
          position: "relative",
          height: "100%",
          flexGrow: 1,
          background: theme.colors.backgroundPanel,
        }}
        direction="column"
        ref={ref}
        {...props}
      />
    );
  }
);

Root.displayName = "Root";
