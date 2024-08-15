import type { Instance } from "@webstudio-is/sdk";
import { idAttribute, selectorIdAttribute } from "@webstudio-is/react-sdk";
import type { InstanceSelector } from "./tree-utils";
import { getIsVisuallyHidden } from "./visually-hidden";

export const getInstanceIdFromElement = (
  element: Element
): Instance["id"] | undefined => {
  return element.getAttribute(idAttribute) ?? undefined;
};

// traverse dom to the root and find all instances
export const getInstanceSelectorFromElement = (element: Element) => {
  // Change logic to support Portals
  const matched: undefined | Element =
    element.closest(`[${idAttribute}]`) ?? undefined;

  const instanceSelector: InstanceSelector =
    matched?.getAttribute(selectorIdAttribute)?.split(",") ?? [];

  if (instanceSelector.length === 0) {
    return;
  }
  return instanceSelector;
};

export const getElementByInstanceSelector = (
  instanceSelector: InstanceSelector | Readonly<InstanceSelector>
) => {
  return (
    document.querySelector<HTMLElement>(
      `[${selectorIdAttribute}="${instanceSelector.join(",")}"]`
    ) ?? undefined
  );
};

// Determine if the element is detached, or lacks visual layout.
// We want to exclude elements that are display: none, option tags, or are not in the DOM
const hasLayout = (element: HTMLElement) => {
  // Detached element
  if (false === document.documentElement.contains(element)) {
    return false;
  }

  if (element.tagName.toLowerCase() === "option") {
    return false;
  }

  // Display none
  if (getComputedStyle(element)?.display?.toLowerCase() === "none") {
    return false;
  }

  return true;
};

export const getVisibleElementsByInstanceSelector = (
  instanceSelector: InstanceSelector | Readonly<InstanceSelector>
) => {
  return getElementsByInstanceSelector(instanceSelector, true);
};

export const getAllElementsByInstanceSelector = (
  instanceSelector: InstanceSelector | Readonly<InstanceSelector>
) => {
  return getElementsByInstanceSelector(instanceSelector, false);
};

/**
 * Get root visible elements, even if instance
 **/
const getElementsByInstanceSelector = (
  instanceSelector: InstanceSelector | Readonly<InstanceSelector>,
  skipHidden: boolean
) => {
  const descendantsOrSelf = [
    ...document.querySelectorAll<HTMLElement>(
      `[${selectorIdAttribute}$="${instanceSelector.join(",")}"]`
    ),
  ].filter((element) =>
    skipHidden ? getIsVisuallyHidden(element) === false : true
  );

  const visibleIdSelectors = descendantsOrSelf.map(
    (element) => element.getAttribute(selectorIdAttribute) ?? ""
  );

  // Find root selectors (i.e. selectors that are not descendants of other selectors)
  let rootSelectors = [...visibleIdSelectors];
  const isDescendant = (testSelector: string, selector: string) =>
    testSelector.endsWith(`,${selector}`);

  for (const selector of visibleIdSelectors) {
    rootSelectors = rootSelectors.filter(
      (rootSelector) => isDescendant(rootSelector, selector) === false
    );
  }

  const rootSelectorSet = new Set(rootSelectors);

  const rootElements = descendantsOrSelf.filter((element) =>
    rootSelectorSet.has(element.getAttribute(selectorIdAttribute) ?? "")
  );

  return rootElements.map((element) => {
    let elementResult: HTMLElement = element;

    while (
      skipHidden &&
      false === hasLayout(elementResult) &&
      elementResult.parentElement !== null
    ) {
      elementResult = elementResult.parentElement;
    }

    return elementResult;
  });
};

type Rect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const sumRects = (first: Rect, second: Rect) => {
  return {
    top: Math.min(first.top, second.top),
    right: Math.max(first.right, second.right),
    bottom: Math.max(first.bottom, second.bottom),
    left: Math.min(first.left, second.left),
  };
};

export const getAllElementsBoundingBox = (elements: Element[]): DOMRect => {
  const rects: Rect[] = [];

  if (elements.length === 0) {
    return DOMRect.fromRect({ width: 0, height: 0, x: 0, y: 0 });
  }

  for (const element of elements) {
    const rect = element.getBoundingClientRect();

    // possible display: contents
    if (rect.width !== 0 || rect.height !== 0) {
      rects.push(rect);
      continue;
    }

    if (element.children.length === 0) {
      const textNode = element.firstChild;
      if (textNode?.nodeType !== Node.TEXT_NODE) {
        continue;
      }

      // Create a range object
      const range = document.createRange();
      // Set the range to encompass the text node
      range.selectNodeContents(textNode);
      // Get the bounding rectangle
      const rect = range.getBoundingClientRect();

      if (rect.width !== 0 || rect.height !== 0) {
        rects.push(rect);
      }

      range.detach();

      continue;
    }

    const childRect = getAllElementsBoundingBox([...element.children]);
    if (childRect.width !== 0 || childRect.height !== 0) {
      const { top, right, bottom, left } = childRect;
      rects.push({ top, right, bottom, left });
    }
  }

  if (rects.length === 0) {
    // To preserve position even if width/height is 0
    return elements[0].getBoundingClientRect();
  }

  const { top, right, bottom, left } = rects.reduce(sumRects);

  return DOMRect.fromRect({
    x: left,
    y: top,
    height: bottom - top,
    width: right - left,
  });
};

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/shared/isAttributeNameSafe.js
 */
const attributeNameStartChar =
  ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
const attributeNameChar =
  attributeNameStartChar + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";

const validAttributeNameRegex = new RegExp(
  // eslint-disable-next-line no-misleading-character-class
  "^[" + attributeNameStartChar + "][" + attributeNameChar + "]*$"
);

const illegalAttributeNameCache = new Map<string, boolean>();
const validatedAttributeNameCache = new Map<string, boolean>();

export const isAttributeNameSafe = (attributeName: string) => {
  if (validatedAttributeNameCache.has(attributeName)) {
    return true;
  }
  if (illegalAttributeNameCache.has(attributeName)) {
    return false;
  }
  if (validAttributeNameRegex.test(attributeName)) {
    validatedAttributeNameCache.set(attributeName, true);
    return true;
  }
  illegalAttributeNameCache.set(attributeName, true);
  return false;
};
