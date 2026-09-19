import { on } from "svelte/events";
import { shouldReduceMotion } from "$utils/dom";

type ButtonWidth = { element: HTMLElement; width: number };
type PressEvent = PointerEvent | KeyboardEvent;

export function buttonGroupPress(group: HTMLElement) {
  let buttons: ButtonWidth[] = [];
  let activeButton: HTMLElement | undefined;
  let pressedInput: number | string | undefined;
  let pressStartedAt = 0;
  let transitionDuration = 0;
  let timer: number | undefined;

  function reset() {
    clearTimeout(timer);

    for (const { element } of buttons) {
      element.removeAttribute("data-q-btn-group-resizing");
      element.style.removeProperty("--q-btn-group-width");
    }

    buttons = [];
    activeButton = undefined;
    pressedInput = undefined;
  }

  function press(event: PressEvent) {
    const button = getPressTarget(group, event);

    if (!button || activeButton || shouldReduceMotion()) {
      return;
    }

    reset();
    const measuredButtons = Array.from(group.querySelectorAll<HTMLElement>(":scope > .q-btn"))
      .map((element) => ({ element, width: element.getBoundingClientRect().width }))
      .filter(({ width }) => width > 0);
    const buttonIndex = measuredButtons.findIndex(({ element }) => element === button);
    const pressedButton = measuredButtons[buttonIndex];
    const neighbors = [measuredButtons[buttonIndex - 1], measuredButtons[buttonIndex + 1]].filter(
      Boolean
    );

    if (!pressedButton || !neighbors.length) {
      return;
    }

    const widthReduction = Math.min(
      (pressedButton.width * 0.15) / neighbors.length,
      ...neighbors.map(getAvailablePadding)
    );

    if (widthReduction <= 0) {
      return;
    }

    buttons = measuredButtons;
    resizeButtons(pressedButton, neighbors, widthReduction);
    activeButton = button;
    pressedInput = "key" in event ? event.key : event.pointerId;
    pressStartedAt = performance.now();
    transitionDuration = getTransitionDuration(button);
  }

  function resizeButtons(
    pressedButton: ButtonWidth,
    neighbors: ButtonWidth[],
    widthReduction: number
  ) {
    for (const { element, width } of buttons) {
      setButtonWidth(element, width);
      element.setAttribute("data-q-btn-group-resizing", "");
    }

    // Commit the measured widths before starting the CSS transition.
    void group.offsetWidth;

    for (const { element, width } of neighbors) {
      setButtonWidth(element, width - widthReduction);
    }

    setButtonWidth(pressedButton.element, pressedButton.width + widthReduction * neighbors.length);
  }

  function release(event?: PressEvent) {
    if (
      !activeButton ||
      (event && pressedInput !== ("key" in event ? event.key : event.pointerId))
    ) {
      return;
    }

    activeButton = undefined;
    pressedInput = undefined;

    if (shouldReduceMotion()) {
      reset();
      return;
    }

    // Let quick clicks show the press before returning to their resting widths.
    timer = window.setTimeout(
      () => {
        for (const { element, width } of buttons) {
          setButtonWidth(element, width);
        }

        timer = window.setTimeout(reset, transitionDuration);
      },
      Math.max(0, transitionDuration / 4 - (performance.now() - pressStartedAt))
    );
  }

  const removeListeners = [
    on(group, "pointerdown", press),
    on(group, "keydown", press),
    on(window, "pointerup", release),
    on(window, "keyup", release),
    on(window, "pointercancel", (event) => {
      if (event.pointerId === pressedInput) {
        reset();
      }
    }),
    on(group, "focusout", (event) => {
      if (event.target === activeButton) {
        release();
      }
    }),
    on(window, "blur", reset),
    on(window, "resize", reset),
  ];

  return () => {
    reset();
    removeListeners.forEach((remove) => remove());
  };
}

function getPressTarget(group: HTMLElement, event: PressEvent) {
  const isActivation =
    "key" in event ? !event.repeat && [" ", "Enter"].includes(event.key) : event.button === 0;

  if (!isActivation || event.defaultPrevented || !(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest<HTMLElement>(".q-btn");

  if (button?.parentElement === group && !button.matches(':disabled, [aria-disabled="true"]')) {
    return button;
  }
}

function getAvailablePadding({ element, width }: ButtonWidth) {
  const endPadding = parseFloat(getComputedStyle(element).paddingInlineEnd) || 0;

  if (endPadding) {
    return endPadding;
  }

  const icon = element.querySelector(".q-btn__icon, .q-btn__loader");
  return icon ? Math.max(0, (width - icon.getBoundingClientRect().width) / 2) : 0;
}

function setButtonWidth(element: HTMLElement, width: number) {
  element.style.setProperty("--q-btn-group-width", `${width}px`);
}

function getTransitionDuration(element: HTMLElement) {
  const style = getComputedStyle(element);
  const durations = style.transitionDuration.split(",").map(toMilliseconds);
  const delays = style.transitionDelay.split(",").map(toMilliseconds);
  return Math.max(
    0,
    ...durations.map((duration, index) => duration + delays[index % delays.length])
  );
}

function toMilliseconds(value: string) {
  return parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000);
}
