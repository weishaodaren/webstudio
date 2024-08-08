import { useStore } from "@nanostores/react";
import { $tLeftPanelCategory } from "~/shared/nano-states";
import { ImageIcon } from "@webstudio-is/icons";
import { ImageManager } from "~/builder/shared/image-manager";
import type { TabContentProps } from "../../types";
import { Header, CloseButton, Root } from "../../shared/panel";

export const TabContent = ({ onSetActiveTab }: TabContentProps) => {
  const t = useStore($tLeftPanelCategory);
  return (
    <Root>
      <Header
        title={t.assets}
        suffix={<CloseButton onClick={() => onSetActiveTab("none")} />}
      />
      <ImageManager />
    </Root>
  );
};

export const Icon = ImageIcon;

export const label = "Assets";
