export function toolbarKeyboard(isVertical: () => boolean) {
  let toolbar: HTMLDivElement | undefined;
  let current: HTMLElement | undefined;
  const tabIndices = new Map<HTMLElement, string | null>();

  function restoreTabIndex(control: HTMLElement, tabindex: string | null) {
    if (tabindex === null) {
      control.removeAttribute("tabindex");
    } else {
      control.setAttribute("tabindex", tabindex);
    }
  }

  function controls() {
    return Array.from(
      toolbar?.querySelectorAll<HTMLElement>('button, a[href], [role="button"]') ?? []
    ).filter((control) => control.closest('[role="toolbar"]') === toolbar);
  }

  function isEnabled(control: HTMLElement) {
    return !control.matches(':disabled, [disabled], [aria-disabled="true"]');
  }

  function isVisible(control: HTMLElement) {
    return (
      !control.closest('[hidden], [inert], [aria-hidden="true"]') &&
      control.getClientRects().length > 0 &&
      getComputedStyle(control).visibility === "visible"
    );
  }

  function sync() {
    const all = controls();

    for (const [control, tabindex] of tabIndices) {
      if (!all.includes(control)) {
        restoreTabIndex(control, tabindex);
        tabIndices.delete(control);
      }
    }

    const enabled = all.filter(isEnabled);
    const visible = enabled.filter(isVisible);
    // Hidden containers are skipped by the browser; retain an entry point for when they reopen.
    const available = visible.length ? visible : enabled;
    current = current && available.includes(current) ? current : available[0];

    for (const control of all) {
      if (!tabIndices.has(control)) {
        tabIndices.set(control, control.getAttribute("tabindex"));
      }

      const tabindex = control === current ? 0 : -1;

      if (control.tabIndex !== tabindex) {
        control.tabIndex = tabindex;
      }
    }
  }

  function attach(element: HTMLDivElement) {
    toolbar = element;
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "disabled",
        "aria-disabled",
        "hidden",
        "inert",
        "aria-hidden",
        "href",
        "role",
      ],
    });

    return () => {
      observer.disconnect();

      for (const [control, tabindex] of tabIndices) {
        restoreTabIndex(control, tabindex);
      }

      tabIndices.clear();
      toolbar = undefined;
      current = undefined;
    };
  }

  function onfocusin(event: FocusEvent) {
    if (event.target instanceof HTMLElement && tabIndices.has(event.target)) {
      if (current) {
        current.tabIndex = -1;
      }

      current = event.target;
      current.tabIndex = 0;
    }
  }

  function onkeydown(event: KeyboardEvent) {
    if (
      !toolbar ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.isComposing
    ) {
      return;
    }

    const vertical = isVertical();
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";

    if (![previous, next, "Home", "End"].includes(event.key)) {
      return;
    }

    const available = controls().filter(isEnabled).filter(isVisible);
    const index = available.indexOf(event.target as HTMLElement);

    if (index === -1 || (event.target as HTMLElement).isContentEditable) {
      return;
    }

    let target: number;

    if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = available.length - 1;
    } else {
      const rtl = !vertical && getComputedStyle(toolbar).direction === "rtl";
      const offset = (event.key === previous ? -1 : 1) * (rtl ? -1 : 1);
      target = (index + offset + available.length) % available.length;
    }

    event.preventDefault();
    available[target].focus();
  }

  return { attach, onfocusin, onkeydown };
}
