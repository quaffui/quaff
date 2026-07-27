import { formatDateValue } from "./date";
import type QDateState from "./dateState.svelte";

interface QDateFocusSource {
  open: () => boolean;
  docked: () => boolean;
  overlayId: () => string;
  inputId: () => string;
  triggerId: string;
  state: QDateState;
}

export default function createDateFocus(source: QDateFocusSource) {
  let frame: number | undefined;
  let previous: HTMLElement | null = null;
  let requested: HTMLElement | null = null;

  function remember(target: HTMLElement) {
    requested = target;
  }

  function capture() {
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const activeTarget =
      active === document.body || active === document.documentElement ? null : active;

    previous = available(requested) ?? available(activeTarget) ?? trigger();
    requested = null;
  }

  function restore(force = false) {
    cancel();
    const overlay = getOverlay();

    frame = requestAnimationFrame(() => {
      frame = undefined;

      if (!source.open()) {
        const active = document.activeElement;
        const outsideFocus = active instanceof HTMLElement && active !== document.body;

        if (force || !outsideFocus) {
          (available(previous, overlay) ?? trigger())?.focus();
        }
      }

      previous = null;
      requested = null;
    });
  }

  function scheduleCurrent(expectedOverlay: string) {
    afterRender((overlay) => {
      if (overlay.id === expectedOverlay) {
        focusCurrent(overlay);
        source.state.animatePickerChanges = true;
      }
    });
  }

  function calendar() {
    afterRender(focusDay);
  }

  function inputMode() {
    afterRender(focusInput);
  }

  function navigation() {
    afterRender(focusNavigation);
  }

  function year(value: number, block: ScrollLogicalPosition = "nearest") {
    afterRender(function focusYear(overlay) {
      focusOption(overlay, "year", value, block);
    });
  }

  function month(value: number, block: ScrollLogicalPosition = "nearest") {
    afterRender(function focusMonth(overlay) {
      focusOption(overlay, "month", value, block);
    });
  }

  function isDayFocused() {
    const active = document.activeElement;
    return (
      active instanceof HTMLElement &&
      !!getOverlay()?.contains(active) &&
      active.classList.contains("q-date__day")
    );
  }

  function direction() {
    const reference = trigger();
    return !!reference && getComputedStyle(reference).direction === "rtl";
  }

  function afterRender(action: (overlay: HTMLElement) => void) {
    cancel();
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = undefined;
        const overlay = getOverlay();

        if (source.open() && overlay) {
          action(overlay);
        }
      });
    });
  }

  function cancel() {
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
  }

  function focusCurrent(overlay: HTMLElement) {
    if (!source.docked() && source.state.displayMode === "input") {
      focusInput(overlay);
    } else if (source.state.calendarView === "years") {
      focusOption(overlay, "year", source.state.focusedYear, "center");
    } else if (source.state.calendarView === "months") {
      focusOption(overlay, "month", source.state.focusedMonth, "center");
    } else {
      focusDay(overlay);
    }
  }

  function focusInput(overlay: HTMLElement) {
    overlay.querySelector<HTMLInputElement>(".q-date__input-mode input")?.focus();
  }

  function focusNavigation(overlay: HTMLElement) {
    navigationButton(overlay)?.focus();
  }

  function focusDay(overlay: HTMLElement) {
    const value = formatDateValue(source.state.focusedDate);
    const day = value ? overlay.querySelector<HTMLButtonElement>(`[data-date="${value}"]`) : null;

    (day ?? navigationButton(overlay))?.focus();
  }

  function navigationButton(overlay: HTMLElement) {
    return overlay.querySelector<HTMLButtonElement>(
      source.docked() ? ".q-date__month-select" : ".q-date__month-year"
    );
  }

  function focusOption(
    overlay: HTMLElement,
    kind: "year" | "month",
    value: number,
    block: ScrollLogicalPosition
  ) {
    const option = overlay.querySelector<HTMLButtonElement>(`[data-${kind}="${value}"]`);
    option?.focus({ preventScroll: true });
    option?.scrollIntoView({ block });
  }

  function trigger() {
    return document.getElementById(source.triggerId) ?? document.getElementById(source.inputId());
  }

  function getOverlay() {
    return document.getElementById(source.overlayId());
  }

  function available(target: HTMLElement | null, overlay?: HTMLElement | null) {
    return target?.isConnected &&
      !overlay?.contains(target) &&
      !target.matches(":disabled") &&
      !target.closest("[inert], [aria-hidden='true']")
      ? target
      : null;
  }

  function destroy() {
    cancel();
    previous = null;
    requested = null;
  }

  return {
    remember,
    capture,
    restore,
    scheduleCurrent,
    cancel,
    calendar,
    inputMode,
    navigation,
    year,
    month,
    isDayFocused,
    direction,
    destroy,
  };
}

export type QDateFocus = ReturnType<typeof createDateFocus>;
