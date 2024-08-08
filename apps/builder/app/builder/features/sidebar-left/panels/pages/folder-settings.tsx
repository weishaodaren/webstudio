import { z } from "zod";
import { type FocusEventHandler, useState, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { useDebouncedCallback } from "use-debounce";
import slugify from "slugify";
import {
  Folder,
  Pages,
  ROOT_FOLDER_ID,
  findParentFolderByChildId,
} from "@webstudio-is/sdk";
import {
  theme,
  Button,
  Label,
  InputErrorsTooltip,
  Tooltip,
  InputField,
  Grid,
  ScrollArea,
  rawTheme,
  Flex,
  Select,
  Dialog,
  DialogContent,
  Text,
  DialogClose,
  DialogTitle,
} from "@webstudio-is/design-system";
import {
  ChevronDoubleLeftIcon,
  TrashIcon,
  HelpIcon,
} from "@webstudio-is/icons";
import { useIds } from "~/shared/form-utils";
import { Header, HeaderSuffixSpacer } from "../../shared/panel";
import { $pages, $tPages, $tLeftPanel } from "~/shared/nano-states";
import { nanoid } from "nanoid";
import { serverSyncStore } from "~/shared/sync";
import { useEffectEvent } from "~/shared/hook-utils/effect-event";
import {
  isSlugAvailable,
  registerFolderChildMutable,
  deleteFolderWithChildrenMutable,
  deletePageMutable,
  filterSelfAndChildren,
} from "./page-utils";
import { Form } from "./form";
import { updateWebstudioData } from "~/shared/instance-utils";
import { useUnmount } from "~/shared/hook-utils/use-mount";

const Values = Folder.pick({ name: true, slug: true }).extend({
  parentFolderId: z.string(),
});

type Values = z.infer<typeof Values>;

type FieldName = keyof Values;

type Errors = {
  [fieldName in FieldName]?: string[];
};

const fieldDefaultValues = {
  name: "Untitled",
  slug: "untitled",
  parentFolderId: ROOT_FOLDER_ID,
} satisfies Values;

const fieldNames = Object.keys(fieldDefaultValues) as Array<FieldName>;

const validateValues = (
  pages: undefined | Pages,
  values: Values,
  errorMsg: string,
  folderId?: Folder["id"]
): Errors => {
  const parsedResult = Values.safeParse(values);
  const errors: Errors = {};
  if (parsedResult.success === false) {
    return parsedResult.error.formErrors.fieldErrors;
  }
  if (pages !== undefined && values.slug !== undefined) {
    if (
      isSlugAvailable(
        values.slug,
        pages.folders,
        values.parentFolderId,
        folderId
      ) === false
    ) {
      errors.slug = errors.slug ?? [];
      // errors.slug.push(`Slug "${values.slug}" is already in use`);
      errors.slug.push(errorMsg);
    }
  }
  return errors;
};

const toFormValues = (
  folderId: Folder["id"],
  folders: Array<Folder>
): Values => {
  const folder = folders.find(({ id }) => id === folderId);
  const parentFolder = findParentFolderByChildId(folderId, folders);
  return {
    name: folder?.name ?? "",
    slug: folder?.slug ?? "",
    parentFolderId: parentFolder?.id ?? ROOT_FOLDER_ID,
  };
};

const autoSelectHandler: FocusEventHandler<HTMLInputElement> = (event) =>
  event.target.select();

const FormFields = ({
  folderNameText,
  ParentFolderText,
  slugText,
  slugContent,
  disabled,
  autoSelect,
  errors,
  values,
  folderId,
  onChange,
}: {
  folderNameText: string;
  ParentFolderText: string;
  slugText: string;
  slugContent: string;
  disabled?: boolean;
  autoSelect?: boolean;
  errors: Errors;
  values: Values;
  folderId: Folder["id"];
  onChange: (
    event: {
      [K in keyof Values]: {
        field: K;
        value: Values[K];
      };
    }[keyof Values]
  ) => void;
}) => {
  const fieldIds = useIds(fieldNames);
  const pages = useStore($pages);

  if (pages === undefined) {
    return;
  }

  return (
    <Grid css={{ height: "100%" }}>
      <ScrollArea>
        <Grid gap={3} css={{ my: theme.spacing[5], mx: theme.spacing[8] }}>
          <Grid gap={1}>
            <Label htmlFor={fieldIds.name}>{folderNameText}</Label>
            <InputErrorsTooltip errors={errors.name}>
              <InputField
                tabIndex={1}
                color={errors.name && "error"}
                id={fieldIds.name}
                autoFocus
                onFocus={autoSelect ? autoSelectHandler : undefined}
                name="name"
                placeholder="About"
                disabled={disabled}
                value={values.name}
                onChange={(event) => {
                  onChange({ field: "name", value: event.target.value });
                }}
              />
            </InputErrorsTooltip>
          </Grid>

          <Grid gap={1}>
            <Label htmlFor={fieldIds.parentFolderId}>{ParentFolderText}</Label>
            <Select
              tabIndex={1}
              options={filterSelfAndChildren(folderId, pages.folders)}
              getValue={(folder) => folder.id}
              getLabel={(folder) => folder.name}
              value={pages.folders.find(
                ({ id }) => id === values.parentFolderId
              )}
              onChange={(folder) => {
                onChange({
                  field: "parentFolderId",
                  value: folder.id,
                });
              }}
            />
          </Grid>

          <Grid gap={1}>
            <Label htmlFor={fieldIds.slug}>
              <Flex align="center" css={{ gap: theme.spacing[3] }}>
                {slugText}
                <Tooltip content={slugContent} variant="wrapped">
                  <HelpIcon
                    color={rawTheme.colors.foregroundSubtle}
                    tabIndex={0}
                  />
                </Tooltip>
              </Flex>
            </Label>
            <InputErrorsTooltip errors={errors.slug}>
              <InputField
                tabIndex={1}
                color={errors.slug && "error"}
                id={fieldIds.slug}
                name="slug"
                placeholder="folder"
                disabled={disabled}
                value={values?.slug}
                onChange={(event) => {
                  onChange({
                    field: "slug",
                    value: event.target.value,
                  });
                }}
              />
            </InputErrorsTooltip>
          </Grid>
        </Grid>
      </ScrollArea>
    </Grid>
  );
};

const nameToSlug = (name: string) => {
  if (name === "") {
    return "";
  }

  return slugify(name, { lower: true, strict: true });
};

export const newFolderId = "new-folder";

/**
 * Component
 * @description 新文件夹设置
 */
export const NewFolderSettings = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (folderId: Folder["id"]) => void;
}) => {
  /**
   * Store
   */
  const t = useStore($tPages);
  const tPanel = useStore($tLeftPanel);
  const pages = useStore($pages);

  const [values, setValues] = useState<Values>({
    ...fieldDefaultValues,
    slug: nameToSlug(fieldDefaultValues.name),
  });

  const errors = validateValues(
    pages,
    values,
    t.slugInUse({ slug: values.slug })
  );
  const handleSubmit = () => {
    if (Object.keys(errors).length === 0) {
      const folderId = nanoid();
      createFolder(folderId, values);
      onSuccess(folderId);
    }
  };

  return (
    <NewFolderSettingsView
      createText={t.createFolder}
      creatingText={t.creating}
      title={t.newFolderSettings}
      cancelText={tPanel.cancel}
      onSubmit={handleSubmit}
      onClose={onClose}
      isSubmitting={false}
    >
      <FormFields
        autoSelect
        errors={errors}
        disabled={false}
        values={values}
        folderId={newFolderId}
        folderNameText={t.folderName}
        ParentFolderText={t.parentFolder}
        slugText={t.slug}
        slugContent={t.slugTooltip}
        onChange={(value) => {
          setValues((values) => {
            const changes = { [value.field]: value.value };

            if (value.field === "name") {
              if (values.slug === nameToSlug(values.name)) {
                changes.slug = nameToSlug(value.value);
              }
            }
            return { ...values, ...changes };
          });
        }}
      />
    </NewFolderSettingsView>
  );
};

const NewFolderSettingsView = ({
  onSubmit,
  isSubmitting,
  onClose,
  children,
  title,
  cancelText,
  creatingText,
  createText,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
  onClose: () => void;
  children: JSX.Element;
  title: string;
  cancelText: string;
  creatingText: string;
  createText: string;
}) => {
  return (
    <>
      <Header
        title={title}
        suffix={
          <>
            <Tooltip content={cancelText} side="bottom">
              <Button
                onClick={onClose}
                aria-label={cancelText}
                prefix={<ChevronDoubleLeftIcon />}
                color="ghost"
                // Tab should go:
                //   trought form fields -> create button -> cancel button
                tabIndex={3}
              />
            </Tooltip>
            <HeaderSuffixSpacer />
            <Button
              state={isSubmitting ? "pending" : "auto"}
              onClick={onSubmit}
              tabIndex={2}
            >
              {isSubmitting ? creatingText : createText}
            </Button>
          </>
        }
      />
      <Form onSubmit={onSubmit}>{children}</Form>
    </>
  );
};

const createFolder = (folderId: Folder["id"], values: Values) => {
  serverSyncStore.createTransaction([$pages], (pages) => {
    if (pages === undefined) {
      return;
    }
    pages.folders.push({
      id: folderId,
      name: values.name,
      slug: values.slug,
      children: [],
    } satisfies Folder);
    const parentFolder = pages.folders.find(
      ({ id }) => id === values.parentFolderId
    );
    parentFolder?.children.push(folderId);
  });
};

const updateFolder = (folderId: Folder["id"], values: Partial<Values>) => {
  serverSyncStore.createTransaction([$pages], (pages) => {
    if (pages === undefined) {
      return;
    }
    const folder = pages.folders.find((folder) => folder.id === folderId);
    if (folder === undefined) {
      return;
    }
    if (values.name !== undefined) {
      folder.name = values.name;
    }
    if (values.slug !== undefined) {
      folder.slug = values.slug;
    }
    if (values.parentFolderId !== undefined) {
      registerFolderChildMutable(
        pages.folders,
        folderId,
        values.parentFolderId
      );
    }
  });
};

export const FolderSettings = ({
  onClose,
  onDelete,
  folderId,
}: {
  onClose: () => void;
  onDelete: () => void;
  folderId: string;
}) => {
  /**
   * Store
   */
  const t = useStore($tPages);
  const pages = useStore($pages);
  const folder = pages?.folders.find(({ id }) => id === folderId);
  const [unsavedValues, setUnsavedValues] = useState<Partial<Values>>({});

  const values: Values = {
    ...(pages ? toFormValues(folderId, pages.folders) : fieldDefaultValues),
    ...unsavedValues,
  };

  const errors = validateValues(
    pages,
    values,
    t.slugInUse({ slug: values.slug }),
    folderId
  );

  const debouncedFn = useEffectEvent(() => {
    if (
      Object.keys(unsavedValues).length === 0 ||
      Object.keys(errors).length !== 0
    ) {
      return;
    }

    updateFolder(folderId, unsavedValues);

    setUnsavedValues({});
  });

  const handleSubmitDebounced = useDebouncedCallback(debouncedFn, 1000);

  const handleChange = useCallback(
    <Name extends FieldName>(event: { field: Name; value: Values[Name] }) => {
      setUnsavedValues((values) => ({
        ...values,
        [event.field]: event.value,
      }));
      handleSubmitDebounced();
    },
    [handleSubmitDebounced]
  );

  useUnmount(() => {
    if (
      Object.keys(unsavedValues).length === 0 ||
      Object.keys(errors).length !== 0
    ) {
      return;
    }
    updateFolder(folderId, unsavedValues);
  });

  if (folder === undefined) {
    return null;
  }

  const handleDelete = () => {
    updateWebstudioData((data) => {
      const { pageIds } = deleteFolderWithChildrenMutable(
        folderId,
        data.pages.folders
      );
      pageIds.forEach((pageId) => {
        deletePageMutable(pageId, data);
      });
    });
    onDelete();
  };

  return (
    <FolderSettingsView
      title={t.folderSettings}
      deleteText={t.deleteFolder}
      closeText={t.closeFolderSettings}
      folder={folder}
      onClose={onClose}
      onDelete={handleDelete}
    >
      <FormFields
        folderNameText={t.folderName}
        ParentFolderText={t.parentFolder}
        slugText={t.slug}
        slugContent={t.slugTooltip}
        folderId={folderId}
        errors={errors}
        values={values}
        onChange={handleChange}
      />
    </FolderSettingsView>
  );
};

const FolderSettingsView = ({
  onDelete,
  onClose,
  children,
  folder,
  title,
  deleteText,
  closeText,
}: {
  onDelete: () => void;
  onClose: () => void;
  children: JSX.Element;
  folder: Folder;
  title: string;
  deleteText: string;
  closeText: string;
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  const hanldeRequestDelete = () => {
    if (folder.children.length > 0) {
      setShowDeleteConfirmation(true);
      return;
    }
    onDelete();
  };

  return (
    <>
      <Header
        title={title}
        suffix={
          <>
            <Tooltip content={deleteText} side="bottom">
              <Button
                color="ghost"
                prefix={<TrashIcon />}
                onClick={hanldeRequestDelete}
                aria-label={deleteText}
                tabIndex={2}
              />
            </Tooltip>
            <Tooltip content={closeText} side="bottom">
              <Button
                color="ghost"
                prefix={<ChevronDoubleLeftIcon />}
                onClick={onClose}
                aria-label={closeText}
                tabIndex={2}
              />
            </Tooltip>
            {showDeleteConfirmation && (
              <DeleteConfirmationDialog
                folder={folder}
                onClose={() => {
                  setShowDeleteConfirmation(false);
                }}
                onConfirm={onDelete}
              />
            )}
          </>
        }
      />
      <Form onSubmit={onClose}>{children}</Form>
    </>
  );
};

type DeleteConfirmationDialogProps = {
  onClose: () => void;
  onConfirm: () => void;
  folder: Folder;
};

const DeleteConfirmationDialog = ({
  onClose,
  onConfirm,
  folder,
}: DeleteConfirmationDialogProps) => {
  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (isOpen === false) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <Flex gap="3" direction="column" css={{ padding: theme.spacing[9] }}>
          <Text>{`Delete folder "${folder.name}" including all of its pages?`}</Text>
          <Flex direction="rowReverse" gap="2">
            <DialogClose asChild>
              <Button
                color="destructive"
                onClick={() => {
                  onConfirm();
                }}
              >
                Delete
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button color="ghost">Cancel</Button>
            </DialogClose>
          </Flex>
        </Flex>
        <DialogTitle>Delete confirmation</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};
