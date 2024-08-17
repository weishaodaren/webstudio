import {
  css,
  Dialog,
  DialogContent,
  DialogTrigger,
  Flex,
  Text,
  theme,
} from "@webstudio-is/design-system";
import { CreateProject } from "./project-dialogs";

const contentStyle = css({
  maxWidth: "none",
  width: "80vw",
  aspectRatio: "16/9",
});

const iframeStyle = css({
  width: "100%",
  height: "100%",
  border: 0,
});

export const EmptyState = ({
  labels,
}: {
  labels: {
    confirmText: string;
    cancelText: string;
    title: string;
    buttonText: string;
  };
}) => (
  <Flex
    align="center"
    justify="center"
    direction="column"
    gap="6"
    css={{ height: theme.spacing[27] }}
  >
    <Text variant="brandMediumTitle" as="h1" align="center">
      你想创建什么?
    </Text>
    <Dialog>
      <DialogTrigger asChild>
        <CreateProject {...labels} buttonText="创建第一个项目" />
      </DialogTrigger>
      <DialogContent className={contentStyle()}>
        <iframe
          className={iframeStyle()}
          src="https://www.youtube-nocookie.com/embed/aL2sBSb3ghg?si=siExeIRt-YI_ypuA&autoplay=true"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </DialogContent>
    </Dialog>
  </Flex>
);
