import { useRef, useState } from "react";
import { computed } from "nanostores";
import { useStore } from "@nanostores/react";
import {
  Button,
  CssValueListArrowFocus,
  CssValueListItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  Flex,
  Label,
  SectionTitle,
  SectionTitleButton,
  SectionTitleLabel,
  SmallIconButton,
  Text,
  theme,
} from "@webstudio-is/design-system";
import { EllipsesIcon, PlusIcon } from "@webstudio-is/icons";
import type { DataSource } from "@webstudio-is/sdk";
import {
  decodeDataSourceVariable,
  getExpressionIdentifiers,
} from "@webstudio-is/sdk";
import {
  $dataSources,
  $instances,
  $props,
  $resources,
  $selectedInstanceSelector,
  $selectedPage,
  $tInspector,
  $variableValuesByInstanceSelector,
} from "~/shared/nano-states";
import { serverSyncStore } from "~/shared/sync";
import {
  CollapsibleSectionRoot,
  useOpenState,
} from "~/builder/shared/collapsible-section";
import {
  ValuePreviewDialog,
  formatValuePreview,
} from "~/builder/shared/expression-editor";
import {
  VariablePopoverProvider,
  VariablePopoverTrigger,
} from "./variable-popover";

/**
 * find variables defined specifically on this selected instance
 */
const $instanceVariables = computed(
  [$selectedInstanceSelector, $dataSources],
  (instanceSelector, dataSources) => {
    const matchedVariables: DataSource[] = [];
    if (instanceSelector === undefined) {
      return matchedVariables;
    }
    const [instanceId] = instanceSelector;
    for (const dataSource of dataSources.values()) {
      if (instanceId === dataSource.scopeInstanceId) {
        matchedVariables.push(dataSource);
      }
    }
    return matchedVariables;
  }
);

const $instanceVariableValues = computed(
  [$selectedInstanceSelector, $variableValuesByInstanceSelector],
  (instanceSelector, variableValuesByInstanceSelector) => {
    const key = JSON.stringify(instanceSelector);
    return variableValuesByInstanceSelector.get(key) ?? new Map();
  }
);

/**
 * find variables used in
 *
 * instance children
 * expression prop
 * action prop
 * url resource field
 * header resource field
 * body resource fiel
 */
const $usedVariables = computed(
  [$instances, $props, $resources, $selectedPage],
  (instances, props, resources, page) => {
    const usedVariables = new Map<DataSource["id"], number>();
    const collectExpressionVariables = (expression: string) => {
      const identifiers = getExpressionIdentifiers(expression);
      for (const identifier of identifiers) {
        const id = decodeDataSourceVariable(identifier);
        if (id !== undefined) {
          const count = usedVariables.get(id) ?? 0;
          usedVariables.set(id, count + 1);
        }
      }
    };
    for (const instance of instances.values()) {
      for (const child of instance.children) {
        if (child.type === "expression") {
          collectExpressionVariables(child.value);
        }
      }
    }
    for (const resource of resources.values()) {
      collectExpressionVariables(resource.url);
      for (const { value } of resource.headers) {
        collectExpressionVariables(value);
      }
      if (resource.body) {
        collectExpressionVariables(resource.body);
      }
    }
    for (const prop of props.values()) {
      if (prop.type === "expression") {
        collectExpressionVariables(prop.value);
      }
      if (prop.type === "action") {
        for (const value of prop.value) {
          collectExpressionVariables(value.code);
        }
      }
    }
    if (page) {
      collectExpressionVariables(page.title);
      collectExpressionVariables(page.meta.description ?? "");
      collectExpressionVariables(page.meta.excludePageFromSearch ?? "");
      collectExpressionVariables(page.meta.socialImageUrl ?? "");
      collectExpressionVariables(page.meta.language ?? "");
      collectExpressionVariables(page.meta.status ?? "");
      collectExpressionVariables(page.meta.redirect ?? "");
      if (page.meta.custom) {
        for (const { content } of page.meta.custom) {
          collectExpressionVariables(content);
        }
      }
    }
    return usedVariables;
  }
);

const deleteVariable = (variableId: DataSource["id"]) => {
  serverSyncStore.createTransaction(
    [$dataSources, $resources],
    (dataSources, resources) => {
      const dataSource = dataSources.get(variableId);
      if (dataSource === undefined) {
        return;
      }
      dataSources.delete(variableId);
      if (dataSource.type === "resource") {
        resources.delete(dataSource.resourceId);
      }
    }
  );
};

const EmptyVariables = ({
  emptyText1,
  emptyText2,
  createText,
}: {
  emptyText1: string;
  emptyText2: string;
  createText: string;
}) => {
  return (
    <Flex direction="column" css={{ gap: theme.spacing[5] }}>
      <Flex justify="center" align="center" css={{ height: theme.spacing[13] }}>
        <Text variant="labelsSentenceCase" align="center">
          {emptyText1}
          <br /> {emptyText2}
        </Text>
      </Flex>
      <Flex justify="center" align="center" css={{ height: theme.spacing[13] }}>
        <VariablePopoverTrigger>
          <Button prefix={<PlusIcon />}>{createText}</Button>
        </VariablePopoverTrigger>
      </Flex>
    </Flex>
  );
};

const VariablesItem = ({
  variable,
  index,
  value,
  usageCount,
}: {
  variable: DataSource;
  index: number;
  value: unknown;
  usageCount: number;
}) => {
  const label =
    value === undefined
      ? variable.name
      : `${variable.name}: ${formatValuePreview(value)}`;
  const [inspectDialogOpen, setInspectDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <VariablePopoverTrigger key={variable.id} variable={variable}>
      <CssValueListItem
        id={variable.id}
        index={index}
        label={<Label truncate>{label}</Label>}
        data-state={isMenuOpen ? "open" : undefined}
        buttons={
          <>
            <ValuePreviewDialog
              open={inspectDialogOpen}
              onOpenChange={setInspectDialogOpen}
              title={`查看 "${variable.name}" 数据`}
              value={value}
            >
              {undefined}
            </ValuePreviewDialog>
            <DropdownMenu modal onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                {/* a11y is completely broken here
                  focus is not restored to button invoker
                  @todo fix it eventually and consider restoring from closed value preview dialog
              */}
                <SmallIconButton
                  tabIndex={-1}
                  aria-label="Open variable menu"
                  icon={<EllipsesIcon />}
                  onClick={() => {}}
                />
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent
                  css={{ width: theme.spacing[28] }}
                  onCloseAutoFocus={(event) => event.preventDefault()}
                >
                  <DropdownMenuItem onSelect={() => setInspectDialogOpen(true)}>
                    查看数据
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    // allow to delete only unused variables
                    disabled={variable.type === "parameter" || usageCount > 0}
                    onSelect={() => deleteVariable(variable.id)}
                  >
                    删除 {usageCount > 0 && `(${usageCount}绑定项)`}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </>
        }
      />
    </VariablePopoverTrigger>
  );
};

const VariablesList = () => {
  const t = useStore($tInspector);
  const availableVariables = useStore($instanceVariables);
  const variableValues = useStore($instanceVariableValues);
  const usedVariables = useStore($usedVariables);

  if (availableVariables.length === 0) {
    return (
      <EmptyVariables
        emptyText1={t.emptyVariable1}
        emptyText2={t.emptyVariable2}
        createText={t.createVariable}
      />
    );
  }

  return (
    <CssValueListArrowFocus>
      {availableVariables.map((variable, index) => {
        const value = variableValues.get(variable.id);
        return (
          <VariablesItem
            key={variable.id}
            value={value}
            variable={variable}
            index={index}
            usageCount={usedVariables.get(variable.id) ?? 0}
          />
        );
      })}
    </CssValueListArrowFocus>
  );
};

export const VariablesSection = ({ label }: { label: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useOpenState({
    label: "variables",
    isOpenDefault: true,
  });
  return (
    <VariablePopoverProvider value={{ containerRef }}>
      <CollapsibleSectionRoot
        label={label}
        fullWidth={true}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={
          <SectionTitle
            suffix={
              <VariablePopoverTrigger>
                <SectionTitleButton
                  prefix={<PlusIcon />}
                  // open panel when add new varable
                  onClick={() => {
                    if (isOpen === false) {
                      setIsOpen(true);
                    }
                  }}
                />
              </VariablePopoverTrigger>
            }
          >
            <SectionTitleLabel>{label}</SectionTitleLabel>
          </SectionTitle>
        }
      >
        {/* prevent applyig gap to list items */}
        <div ref={containerRef}>
          <VariablesList />
        </div>
      </CollapsibleSectionRoot>
    </VariablePopoverProvider>
  );
};
