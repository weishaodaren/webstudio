import { type WsComponentMeta } from "@webstudio-is/react-sdk";

export type MetaByCategory = Map<
  WsComponentMeta["category"],
  Array<WsComponentMeta>
>;

export type ComponentNamesByMeta = Map<WsComponentMeta, string>;

export type ComponentsInfo = Record<
  NonNullable<WsComponentMeta["label"]>,
  Pick<WsComponentMeta, "label" | "description">
>;

/**
 * 获取组件国际化映射
 */
const getComponentsi18n = (
  name: string,
  mapping: ComponentsInfo
): Pick<WsComponentMeta, "label" | "description"> | undefined => {
  return mapping[name];
};

export const getMetaMaps = (
  metaByComponentName: Map<string, WsComponentMeta>,
  mapping: ComponentsInfo
) => {
  const metaByCategory: MetaByCategory = new Map();
  const componentNamesByMeta: ComponentNamesByMeta = new Map();

  for (const [name, meta] of metaByComponentName) {
    if (meta.category === undefined || meta.category === "hidden") {
      continue;
    }

    // 国际化
    const t = getComponentsi18n(name, mapping);
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
