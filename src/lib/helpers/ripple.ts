import { on } from "svelte/events";
import { useColor } from "#composables/useColor.js";
import { isActivationKey } from "#utils";
import type { Attachment } from "svelte/attachments";

interface RippleOptions {
  /**
   * Whether the ripple should be centered on the element.
   */
  center?: boolean;
  /**
   * The color of the ripple: a theme color name such as `primary`, or any CSS color such as hex, rgb, hsl, or named colors.
   */
  color?: string;
  /**
   * The duration of the ripple in milliseconds.
   */
  duration?: number;
  /**
   * Whether the ripple should be disabled.
   */
  disabled?: boolean;
  /**
   * A selector for a descendant that should contain the ripple effect.
   */
  effectTarget?: string;
}

// Pointer events cover mouse, touch and pen; a separate touch listener would add a second ripple.
const TRIGGER_EVENTS = ["pointerdown", "keydown"] as const;
const POINTER_CANCEL_EVENTS = ["pointerup", "pointercancel", "pointerleave", "dragleave"];
// Focus can leave before the key is released, for example into a dialog the key opened.
const KEY_CANCEL_EVENTS = ["keyup", "focusout"];

const RIPPLE_CLASS = "q-ripple";
const CENTER_CLASS = `${RIPPLE_CLASS}--center`;
const EFFECT_CLASS = `${RIPPLE_CLASS}__effect`;

const COLOR_PROPERTY = "--ripple-color";
const DURATION_PROPERTY = "--ripple-duration";

export function ripple(options: RippleOptions = {}): Attachment<HTMLElement> {
  let rippleContainer: HTMLDivElement | undefined;
  const duration = options.duration && options.duration > 0 ? options.duration : undefined;

  function isDisabled(el: HTMLElement, opts: RippleOptions) {
    return opts.disabled || el.hasAttribute("aria-disabled");
  }

  function addClasses(container: HTMLDivElement, center = false) {
    const shouldBeCentered = center || options.center;

    container.classList.add(EFFECT_CLASS);

    if (shouldBeCentered) {
      container.classList.add(CENTER_CLASS);
    } else {
      container.classList.remove(CENTER_CLASS);
    }
  }

  function getRippleContainer(el: HTMLElement) {
    if (rippleContainer) {
      return rippleContainer;
    }

    rippleContainer = document.createElement("div");

    const effectTarget = options.effectTarget
      ? (el.querySelector<HTMLElement>(options.effectTarget) ?? el)
      : el;

    effectTarget.appendChild(rippleContainer);

    if (duration) {
      rippleContainer.style.setProperty(DURATION_PROPERTY, `${duration}ms`);
    }

    if (options.color) {
      rippleContainer.style.setProperty(COLOR_PROPERTY, useColor(options.color));
    }

    return rippleContainer;
  }

  function getPressOrigin(event: PointerEvent | KeyboardEvent, rect: DOMRect, isCentered: boolean) {
    if (event instanceof KeyboardEvent || (options.effectTarget && isCentered)) {
      return { x: rect.width / 2, y: rect.height / 2 };
    }

    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function createRipple(el: HTMLElement, event: PointerEvent | KeyboardEvent) {
    if (isDisabled(el, options)) {
      return;
    }

    const isKeyPress = event instanceof KeyboardEvent;

    // A held key repeats keydown while its first ripple is still showing.
    if (isKeyPress && (event.repeat || !isActivationKey(event))) {
      return;
    }

    const rippleContainer = getRippleContainer(el);
    addClasses(rippleContainer, isKeyPress);

    // Key presses have no pointer position: their ripple grows from the middle of its container.
    const rect =
      options.effectTarget || isKeyPress
        ? rippleContainer.getBoundingClientRect()
        : el.getBoundingClientRect();
    const { x: localX, y: localY } = getPressOrigin(event, rect, isKeyPress || !!options.center);
    const x = localX > rect.width / 2 ? 0 : rect.width;
    const y = localY > rect.height / 2 ? 0 : rect.height;
    const radius = Math.hypot(x - localX, y - localY);

    const ripple = document.createElement("div");
    ripple.classList.add(RIPPLE_CLASS);

    ripple.style.left = `${localX - radius}px`;
    ripple.style.top = `${localY - radius}px`;
    ripple.style.width = ripple.style.height = `${radius * 2}px`;

    rippleContainer.appendChild(ripple);

    const cancelEvents = isKeyPress ? KEY_CANCEL_EVENTS : POINTER_CANCEL_EVENTS;
    const removeCancelListeners = cancelEvents.map((cancelEvent) =>
      on(el, cancelEvent, removeRipple, { passive: true })
    );

    function removeRipple() {
      if (ripple === null) {
        return;
      }

      ripple.style.opacity = "0";

      setTimeout(() => {
        ripple.remove();
      }, duration || 1000);

      removeCancelListeners.forEach((removeCancelListener) => removeCancelListener());
    }
  }

  return (element: HTMLElement) => {
    if (options.disabled) {
      return;
    }

    const removeTriggerListeners = TRIGGER_EVENTS.map((event) =>
      on(element, event, (e) => createRipple(element, e))
    );

    return () => {
      rippleContainer?.remove();
      removeTriggerListeners.forEach((unlisten) => unlisten());
    };
  };
}
