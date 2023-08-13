import type { Direction } from "./events";

export function getParentElement(el: HTMLElement) {
  let parent = el.parentNode;

  while (parent !== null && parent.nodeType !== 1) {
    parent = parent.parentNode;
  }

  return parent as HTMLElement;
}

export function getAllChildren(el: HTMLElement) {
  return Array.from(el.querySelectorAll("*")) as HTMLElement[];
}

// Focus utils
const focusableElements =
  ':is(a, button, input, [tabindex]:not([tabindex="-1"])):not([disabled], [aria-disabled="true"])';

export function isFocusable(el: HTMLElement) {
  return (
    el.offsetWidth > 0 &&
    el.offsetHeight > 0 &&
    (el.style.opacity === "" || +el.style.opacity > 0) &&
    el.style.display !== "none" &&
    el.tabIndex >= 0
  );
}

export function getFocusableChildren<T extends HTMLElement>(el: T) {
  return Array.from(el.querySelectorAll(focusableElements)) as T[];
}

export function getClosestFocusableChild(el: HTMLElement) {
  let children = Array.from(el.querySelectorAll(focusableElements)) as HTMLElement[];
  const focusableChildren: HTMLElement[] = children.filter(isFocusable);

  return focusableChildren[0] || null;
}

export function getClosestFocusableSibling<T extends HTMLElement>(el: T, direction: Direction) {
  const parent = getParentElement(el);
  const allSiblings = Array.from(parent.childNodes) as HTMLElement[];

  let filtered = allSiblings.filter(isFocusable);
  const indexOfEl = filtered.indexOf(el);

  if (direction === "next") {
    const i = indexOfEl + 1 === filtered.length ? 0 : indexOfEl + 1;

    if (filtered[i].hasAttribute("aria-current")) {
      // The target element is active, it shouldn't have focus
      return i + 1 === filtered.length ? filtered[0] : filtered[i + 1];
    } else {
      return filtered[i];
    }
  } else {
    const i = indexOfEl - 1 === -1 ? filtered.length - 1 : indexOfEl - 1;

    if (filtered[i].hasAttribute("aria-current")) {
      // The target element is active, it shouldn't have focus
      return i - 1 === -1 ? filtered.at(-1)! : filtered[i - 1];
    } else {
      return filtered[i];
    }
  }
}

export function getClosestFocusableBlock(el: HTMLElement, direction: Direction) {
  let parent = getParentElement(el);
  let parentFocusableChildren = getFocusableChildren(parent);

  function getNextFocusableBlock(parentBlock: HTMLElement) {
    const grandParent = getParentElement(parentBlock);
    const grandParentChildren = getAllChildren(grandParent);

    const indexOfEl = grandParentChildren.indexOf(el);

    const sliced =
      direction === "next"
        ? grandParentChildren.slice(indexOfEl)
        : grandParentChildren.slice(0, indexOfEl);

    console.log(sliced);
    const filtered = sliced.filter(
      (element) => isFocusable(element) && !parentFocusableChildren.includes(element)
    );

    if (filtered.length === 0) {
      return getNextFocusableBlock(grandParent);
    }

    return direction === "next" ? filtered[0] : filtered.at(-1)!;
  }

  let targetBlock = getNextFocusableBlock(parent);

  console.log(targetBlock);

  if (targetBlock.hasAttribute("aria-current")) {
    targetBlock = getClosestFocusableSibling(targetBlock, direction);
    console.log(targetBlock);
  }

  return targetBlock;
}
