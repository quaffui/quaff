import type { HTMLAttributes } from "svelte/elements";

export function createMenuTrigger(
  menuId: string,
  isOpen: () => boolean,
  setExpanded: (isExpanded: boolean) => void,
  getDirection: () => HTMLAttributes<HTMLElement>["dir"] = () => undefined,
  isDisabled: () => boolean = () => false
) {
  let triggerEl = $state<HTMLElement>();
  let resolvedDirection = $state<"ltr" | "rtl">();
  let isLastItemRequested = false;
  const isExpanded = $derived(isOpen() && !isDisabled());
  const direction = $derived(resolvedDirection ?? getDirection());

  $effect(() => {
    if (isDisabled() && isOpen()) {
      setExpanded(false);
    }

    if (isExpanded && triggerEl) {
      const declaredDirection = getDirection();
      const direction =
        declaredDirection === "ltr" || declaredDirection === "rtl"
          ? declaredDirection
          : getComputedStyle(triggerEl).direction;
      resolvedDirection = direction === "rtl" ? "rtl" : "ltr";
    }
  });

  $effect.pre(() => {
    if (isExpanded || isDisabled()) {
      return;
    }

    const menu = document.getElementById(menuId);

    if (menu?.contains(document.activeElement)) {
      triggerEl?.focus();
    }
  });

  function captureTrigger(element: HTMLElement) {
    triggerEl = element;
  }

  function toggleMenu() {
    isLastItemRequested = false;
    setExpanded(!isExpanded);
  }

  function handleTriggerKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) {
      return;
    }

    event.preventDefault();
    isLastItemRequested = event.key === "ArrowUp";
    setExpanded(true);
  }

  function focusMenu(element: HTMLElement) {
    const frameId = requestAnimationFrame(() => {
      (getMenuItems(element).at(isLastItemRequested ? -1 : 0) ?? element).focus();
    });

    return () => {
      cancelAnimationFrame(frameId);
      isLastItemRequested = false;
    };
  }

  function handleMenuKeydown(event: KeyboardEvent) {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }

      triggerEl?.focus();
      setExpanded(false);
      return;
    }

    const target = event.target as HTMLElement;

    if (target.matches("input, textarea, select") || target.isContentEditable) {
      return;
    }

    const items = getMenuItems(event.currentTarget as HTMLElement);
    const nextItem = getNavigationItem(event, items);

    if (nextItem) {
      event.preventDefault();
      nextItem.focus();
    }
  }

  return {
    id: menuId,
    get triggerEl() {
      return triggerEl;
    },
    get isExpanded() {
      return isExpanded;
    },
    get direction() {
      return direction;
    },
    get isRtl() {
      return direction === "rtl";
    },
    setExpanded,
    captureTrigger,
    toggleMenu,
    handleTriggerKeydown,
    handleMenuKeydown,
    focusMenu,
  };
}

function getMenuItems(element: HTMLElement) {
  return Array.from(
    element.querySelectorAll<HTMLElement>(
      '[role^="menuitem"]:not([aria-disabled="true"], :disabled)'
    )
  ).filter((item) => item.checkVisibility({ visibilityProperty: true }));
}

function getNavigationItem(event: KeyboardEvent, items: HTMLElement[]) {
  if (!items.length) {
    return;
  }

  const index = items.findIndex((item) => item.contains(event.target as Node));

  switch (event.key) {
    case "Home":
      return items[0];
    case "End":
      return items.at(-1);
    case "ArrowDown":
      return items[(index + 1) % items.length];
    case "ArrowUp":
      return items[(Math.max(index, 0) + items.length - 1) % items.length];
  }

  if (
    event.key.length !== 1 ||
    event.key === " " ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey
  ) {
    return;
  }

  const query = event.key.toLocaleLowerCase();
  const nextItems = [...items.slice(index + 1), ...items.slice(0, index + 1)];
  return nextItems.find((item) => getItemLabel(item).trim().toLocaleLowerCase().startsWith(query));
}

function getItemLabel(item: HTMLElement) {
  const accessibleLabel = item.getAttribute("aria-label");

  if (accessibleLabel !== null) {
    return accessibleLabel;
  }

  const label = item.querySelector(".q-item__section--headline, .q-btn__label") ?? item;
  const content = label.cloneNode(true) as HTMLElement;

  for (const decoration of content.querySelectorAll('[aria-hidden="true"], [hidden]')) {
    decoration.remove();
  }

  return content.textContent ?? "";
}
