import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuItem,
  IconButton,
  css,
  Flex,
  Text,
  truncate,
  theme,
  Tooltip,
  rawTheme,
  Link,
} from "@webstudio-is/design-system";
import { InfoCircleIcon, EllipsesIcon } from "@webstudio-is/icons";
import { type KeyboardEvent, useCallback, useRef, useState } from "react";
import type { ImageLoader } from "@webstudio-is/image";
import { builderPath } from "~/shared/router-utils";
import {
  RenameProjectDialog,
  DeleteProjectDialog,
  useCloneProject,
  ShareProjectDialog,
} from "./project-dialogs";
import {
  ThumbnailLinkWithAbbr,
  ThumbnailLinkWithImage,
  ThumbnailWithAbbr,
  ThumbnailWithImage,
} from "./thumbnail";
import { useNavigation } from "@remix-run/react";
import { Spinner } from "../shared/spinner";
import type { DashboardProject } from "@webstudio-is/dashboard";
import { Card, CardContent, CardFooter } from "../shared/card";
import { CloneProjectDialog } from "~/shared/clone-project";
import { useStore } from "@nanostores/react";
import { $tProject, locale } from "~/shared/nano-states";

const titleStyle = css({
  userSelect: "text",
  ...truncate(),
});

const infoIconStyle = css({ flexShrink: 0 });

const PublishedLink = ({
  domain,
  publisherHost,
  tabIndex,
}: {
  domain: string;
  publisherHost: string;
  tabIndex: number;
}) => {
  const publishedOrigin = `https://${domain}.${publisherHost}`;
  return (
    <Link
      href={publishedOrigin}
      target="_blank"
      rel="noreferrer"
      tabIndex={tabIndex}
      color="subtle"
      underline="hover"
      css={truncate()}
    >
      {new URL(publishedOrigin).host}
    </Link>
  );
};

const Menu = ({
  tabIndex,
  onDelete,
  onRename,
  onDuplicate,
  onShare,
  labels: { deleteAction, duplicate, rename, share },
}: {
  tabIndex: number;
  onDelete: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  labels: {
    deleteAction: string;
    duplicate: string;
    rename: string;
    share: string;
  };
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <IconButton
          aria-label="Menu Button"
          tabIndex={tabIndex}
          css={{ alignSelf: "center" }}
        >
          <EllipsesIcon width={15} height={15} />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onDuplicate}>
            {duplicate}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onRename}>{rename}</DropdownMenuItem>
          <DropdownMenuItem onSelect={onShare}>{share}</DropdownMenuItem>
          <DropdownMenuItem onSelect={onDelete}>
            {deleteAction}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

const useProjectCard = () => {
  const thumbnailRef = useRef<HTMLAnchorElement & HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const elements: Array<HTMLElement> = Array.from(
      event.currentTarget.querySelectorAll(`[tabIndex='-1']`)
    );
    const currentIndex = elements.indexOf(
      document.activeElement as HTMLElement
    );
    switch (event.key) {
      case "Enter": {
        // Only open project on enter when the project card container was focused,
        // otherwise we will always open project, even when a menu was pressed.
        if (event.currentTarget === document.activeElement) {
          thumbnailRef.current?.click();
        }
        break;
      }
      case "ArrowUp":
      case "ArrowRight": {
        const nextElement = elements.at(currentIndex + 1) ?? elements[0];
        nextElement?.focus();
        break;
      }
      case "ArrowDown":
      case "ArrowLeft": {
        const nextElement = elements.at(currentIndex - 1) ?? elements[0];
        nextElement?.focus();
        break;
      }
    }
  };

  return {
    thumbnailRef,
    handleKeyDown,
  };
};

const formatDate = (date: string) => {
  // return new Date(date).toLocaleDateString("en-US", {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

type ProjectCardProps = {
  project: DashboardProject;
  hasProPlan: boolean;
  publisherHost: string;
  imageLoader: ImageLoader;
};

/**
 * Component
 */
export const ProjectCard = ({
  project: {
    id,
    title,
    domain,
    isPublished,
    createdAt,
    latestBuild,
    previewImageAsset,
  },
  hasProPlan,
  publisherHost,
  imageLoader,
}: ProjectCardProps) => {
  /**
   * Store
   */
  const t = useStore($tProject);

  /**
   * State
   */
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const { thumbnailRef, handleKeyDown } = useProjectCard();
  const handleCloneProject = useCloneProject(id);
  const { state, location } = useNavigation();
  const linkPath = builderPath({ projectId: id });
  // Transition to the project has started, we may need to show a spinner
  const isTransitioning = state !== "idle" && linkPath === location.pathname;

  /**
   * Callback
   * @description 格式化日期
   * @param {String} data
   * @returns {String}
   */
  const formatDate = useCallback(
    (date: string) =>
      new Date(date).toLocaleDateString(locale.value, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    []
  );

  return (
    <Card hidden={isHidden} tabIndex={0} onKeyDown={handleKeyDown}>
      <CardContent
        css={{ background: theme.colors.brandBackgroundProjectCardBack }}
      >
        {previewImageAsset ? (
          <ThumbnailLinkWithImage
            to={linkPath}
            name={previewImageAsset.name}
            ref={thumbnailRef}
            imageLoader={imageLoader}
          />
        ) : (
          <ThumbnailLinkWithAbbr
            title={title}
            to={linkPath}
            ref={thumbnailRef}
          />
        )}
        {isTransitioning && <Spinner delay={0} />}
      </CardContent>
      <CardFooter>
        <Flex direction="column" justify="around" grow>
          <Flex gap="1">
            <Text variant="titles" className={titleStyle()}>
              {title}
            </Text>
            <Tooltip
              variant="wrapped"
              content={
                <Text variant="small">
                  {t.createdTime({ createdAt: formatDate(createdAt) })}
                  {/* Created on {formatDate(createdAt)} */}
                  {latestBuild?.publishStatus === "PUBLISHED" && (
                    <>
                      <br />
                      Published on {formatDate(latestBuild.updatedAt)}
                    </>
                  )}
                </Text>
              }
            >
              <InfoCircleIcon
                color={rawTheme.colors.foregroundSubtle}
                tabIndex={-1}
                className={infoIconStyle()}
              />
            </Tooltip>
          </Flex>
          {isPublished ? (
            <PublishedLink
              publisherHost={publisherHost}
              domain={domain}
              tabIndex={-1}
            />
          ) : (
            <Text color="subtle">{t.notPublished}</Text>
          )}
        </Flex>
        <Menu
          labels={{
            duplicate: t.duplicate,
            rename: t.rename,
            share: t.share,
            deleteAction: t.delete,
          }}
          tabIndex={-1}
          onDelete={() => {
            setIsDeleteDialogOpen(true);
          }}
          onRename={() => {
            setIsRenameDialogOpen(true);
          }}
          onShare={() => {
            setIsShareDialogOpen(true);
          }}
          onDuplicate={handleCloneProject}
        />
      </CardFooter>
      <RenameProjectDialog
        buttonText={t.rename}
        label={t.title}
        isOpen={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        title={title}
        projectId={id}
      />
      <DeleteProjectDialog
        buttonText={t.deleteAction}
        desc={t.deleteDesc}
        dialogTitle={t.deleteConfirmation}
        confirmTypingText={t.confirmTyping}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onHiddenChange={setIsHidden}
        title={title}
        projectId={id}
      />
      <ShareProjectDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        projectId={id}
        hasProPlan={hasProPlan}
      />
    </Card>
  );
};

export const ProjectTemplateCard = ({
  project,
  publisherHost,
  imageLoader,
}: Omit<ProjectCardProps, "hasProPlan">) => {
  const { thumbnailRef, handleKeyDown } = useProjectCard();
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const { title, domain, previewImageAsset, isPublished } = project;
  return (
    <Card tabIndex={0} onKeyDown={handleKeyDown}>
      <CardContent
        css={{ background: theme.colors.brandBackgroundProjectCardBack }}
      >
        {previewImageAsset ? (
          <ThumbnailWithImage
            name={previewImageAsset.name}
            ref={thumbnailRef}
            onClick={() => {
              setIsDuplicateDialogOpen(true);
            }}
            imageLoader={imageLoader}
          />
        ) : (
          <ThumbnailWithAbbr
            title={title}
            ref={thumbnailRef}
            onClick={() => {
              setIsDuplicateDialogOpen(true);
            }}
          />
        )}
      </CardContent>
      <CardFooter>
        <Flex direction="column" justify="around">
          <Text variant="titles" truncate userSelect="text">
            {title}
          </Text>
          {isPublished ? (
            <PublishedLink
              publisherHost={publisherHost}
              domain={domain}
              tabIndex={-1}
            />
          ) : (
            <Text color="subtle">Not Published</Text>
          )}
        </Flex>
      </CardFooter>
      <CloneProjectDialog
        isOpen={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        project={project}
      />
    </Card>
  );
};
