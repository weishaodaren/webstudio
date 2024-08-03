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

export const $tStylePanle = i18n("stylePanle", {
  styleSources: "Style Sources",
});
