import { type WsComponentMeta } from "@webstudio-is/react-sdk";

export type ComponentsInfo = Record<
  NonNullable<WsComponentMeta["label"]>,
  Pick<WsComponentMeta, "label" | "description">
>;

/**
 * 获取组件国际化映射
 */
const getComponentsi18n = (
  meta: WsComponentMeta,
  mapping: ComponentsInfo
): Pick<WsComponentMeta, "label" | "description"> | undefined => {
  if (!meta.label) {
    return;
  }

  return mapping[meta.label] ? mapping[meta.label] : undefined;
};

export const getMetaMaps = (
  metaByComponentName: Map<string, WsComponentMeta>,
  mapping: ComponentsInfo
) => {
  const metaByCategory: Map<
    WsComponentMeta["category"],
    Array<WsComponentMeta>
  > = new Map();
  const componentNamesByMeta: Map<WsComponentMeta, string> = new Map();

  for (const [name, meta] of metaByComponentName) {
    if (meta.category === undefined || meta.category === "hidden") {
      continue;
    }

    // 国际化
    const t = getComponentsi18n(meta, mapping);
    meta.label = t?.label ?? meta.label;
    meta.description = t?.description ?? meta.description;

    let categoryMetas = metaByCategory.get(meta.category);
    if (categoryMetas === undefined) {
      categoryMetas = [];
      metaByCategory.set(meta.category, categoryMetas);
    }
    categoryMetas.push(meta);
    metaByComponentName.set(name, meta);
    componentNamesByMeta.set(meta, name);
  }

  for (const meta of metaByCategory.values()) {
    meta.sort((metaA, metaB) => {
      return (
        (metaA.order ?? Number.MAX_SAFE_INTEGER) -
        (metaB.order ?? Number.MAX_SAFE_INTEGER)
      );
    });
  }

  return { metaByCategory, componentNamesByMeta };
};
