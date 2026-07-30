import type QTimeState from "./timeState.svelte";

interface QTimeFocusSource {
  open: () => boolean;
  overlayId: () => string;
  inputId: () => string;
  inputMode: () => boolean;
  triggerId: string;
  state: QTimeState;
}

export default function createTimeFocus(source: QTimeFocusSource) {
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

    const restoreFocus = () => {
      if (overlay instanceof HTMLDialogElement && overlay.open) {
        frame = requestAnimationFrame(restoreFocus);
        return;
      }

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
    };

    frame = requestAnimationFrame(restoreFocus);
  }

  function scheduleCurrent(expectedOverlay: string) {
    afterRender((overlay) => {
      if (overlay.id === expectedOverlay) {
        focusCurrent(overlay);
        source.state.animatePickerChanges = true;
      }
    });
  }

  function dial() {
    afterRender(focusDial);
  }

  function input(part = source.state.activePart) {
    afterRender((overlay) => focusInput(overlay, part));
  }

  function isDialFocused() {
    const active = document.activeElement;
    return (
      active instanceof HTMLElement &&
      !!getOverlay()?.contains(active) &&
      active.classList.contains("q-time__dial-option")
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
    if (source.inputMode()) {
      focusInput(overlay, source.state.activePart);
    } else {
      focusDial(overlay);
    }
  }

  function focusInput(overlay: HTMLElement, part: "hour" | "minute") {
    overlay.querySelector<HTMLInputElement>(`[data-time-input="${part}"]`)?.focus();
  }

  function focusDial(overlay: HTMLElement) {
    const { activePart, draftTime } = source.state;
    const value =
      activePart === "hour" ? draftTime.hour : (Math.round(draftTime.minute / 5) * 5) % 60;
    const option = overlay.querySelector<HTMLButtonElement>(
      `.q-time__dial-option[data-${activePart}="${value}"]`
    );

    (
      option ?? overlay.querySelector<HTMLButtonElement>(".q-time__time-selector--selected")
    )?.focus();
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
    dial,
    input,
    isDialFocused,
    direction,
    destroy,
  };
}

export type QTimeFocus = ReturnType<typeof createTimeFocus>;
