/**
 * @description 国际化
 * @link https://github.com/nanostores/i18n
 */

import { createI18n, localeFrom, browser, formatter } from "@nanostores/i18n";
import { persistentAtom } from "@nanostores/persistent";

export const setting = persistentAtom<string | undefined>("locale", undefined);

// 本地语言
export const locale = localeFrom(
  setting,
  browser({
    available: ["en", "zh-CN"],
    fallback: "en",
  })
);

// 格式化
export const fomat = formatter(locale);

// 通过`en zh ru`获取对应国际化json
export const i18n = createI18n(locale, {
  async get(code) {
    try {
      const resp = await (await fetch(`/translations/${code}.json`)).json();
      return resp;
    } catch (error) {
      console.error(`Error fetching translations: ${error}`);
      throw error;
    }
  },
});

/**
 * @default `en``
 * 国际化配置信息
 * $translate xxx
 */
export const $tInspector = i18n("inspector", {
  style: "Style",
  settings: "Settings",
  settingPanelTooltip:
    "The Settings panel allows for customizing component properties and HTML attributes.",
  stylePanelTooltip: "The Style panel allows manipulation of CSS visually.",
});

export const $tStylePanel = i18n("stylePanel", {
  styleSources: "Style Sources",
  convertToToken: "Convert to token",
  edit: "Edit Name",
  duplicate: "Duplicate",
  clear: "Clear Style",
  remove: "Remove",
  delete: "Delete",
  local: "Local",
  localStyleHint:
    "Style instances without creating a token or override a token locally.",
  tokenStyleHint: "Reuse styles across multiple instances by creating a token.",
  newToken: "New Token",
  create: "Create",
  globalTokens: "Global Tokens",
  componentTokens: "Component Tokens",
});

export const $tLayout = i18n("stylePanel/layout", {
  layout: "Layout",
});

export const $tSpace = i18n("stylePanel/space", {
  space: "Space",
});

export const $tSize = i18n("stylePanel/size", {
  size: "Size",
});

export const $tPosition = i18n("stylePanel/position", {
  position: "Position",
});

export const $tTypography = i18n("stylePanel/typography", {
  typography: "Typography",
});

export const $tBackground = i18n("stylePanel/backgrounds", {
  backgrounds: "Backgrounds",
  description:
    "Add one or more backgrounds to the instance such as a color, image, or gradient.",
});

export const $tBorder = i18n("stylePanel/borders", {
  borders: "Borders",
});

export const $tBoxShadows = i18n("stylePanel/boxShadows", {
  boxShadows: "Box Shadows",
  description: "Adds shadow effects around an element's frame.",
});

export const $tTextShadows = i18n("stylePanel/textShadows", {
  textShadows: "Text Shadows",
  description: "Adds shadow effects around a text.",
});

export const $tFilters = i18n("stylePanel/filters", {
  filters: "Filters",
  description:
    "Filter effects allow you to apply graphical effects like blurring, color shifting, and more to elements.",
});

export const $tBackdropFilters = i18n("stylePanel/backdropFilters", {
  backdropFilters: "BackdropFilters",
  description:
    "Backdrop filters are similar to filters, but are applied to the area behind an element. This can be useful for creating frosted glass effects.",
});

export const $tTransitions = i18n("stylePanel/transitions", {
  transitions: "Transitions",
  description: "Animate the transition between states on this instance.",
});

export const $tTransforms = i18n("stylePanel/transforms", {
  transforms: "Transforms",
});

export const $tOutline = i18n("stylePanel/outline", {
  outline: "Outline",
});

export const $tAdvanced = i18n("stylePanel/advanced", {
  advanced: "Advanced",
});
