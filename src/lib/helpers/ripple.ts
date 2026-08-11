import { Attachment } from "svelte/attachments";
import { on } from "svelte/events";
import { isActivationKey } from "$utils";

interface RippleOptions {
  /**
   * Whether the ripple should be centered on the element.
   */
  center?: boolean;
  /**
   * The color of the ripple. This should be in a format that can be used in CSS, such as hex, rgb, hsl, or named colors.
   *
   * For variables, no need to wrap in `var(--xx)` e.g. pass `primary` not `var(--primary)`.
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

const TRIGGER_EVENTS = ["pointerdown", "touchstart", "keydown"] as const;
const CANCEL_EVENTS = ["mouseleave", "dragleave", "touchmove", "touchcancel", "pointerup", "keyup"];

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
      rippleContainer.style.setProperty(
        COLOR_PROPERTY,
        `var(--${options.color}, ${options.color})`
      );
    }

    return rippleContainer;
  }

  function createRipple(
    el: HTMLElement,
    event: PointerEvent | KeyboardEvent | TouchEvent,
    center = false
  ) {
    if (isDisabled(el, options)) {
      return;
    }

    if (event instanceof KeyboardEvent) {
      if (!isActivationKey(event)) {
        return;
      }

      const click = new PointerEvent("pointerdown");
      createRipple(el, click, true);

      return;
    }

    const rippleContainer = getRippleContainer(el);
    addClasses(rippleContainer, center);

    const rect = options.effectTarget
      ? rippleContainer.getBoundingClientRect()
      : el.getBoundingClientRect();

    const { clientX, clientY } =
      window.TouchEvent && event instanceof TouchEvent ? event.touches[0] : (event as PointerEvent);

    const localX =
      options.effectTarget && (center || options.center) ? rect.width / 2 : clientX - rect.left;
    const localY =
      options.effectTarget && (center || options.center) ? rect.height / 2 : clientY - rect.top;
    const x = localX > rect.width / 2 ? 0 : rect.width;
    const y = localY > rect.height / 2 ? 0 : rect.height;
    const radius = Math.hypot(x - localX, y - localY);

    const ripple = document.createElement("div");
    ripple.classList.add(RIPPLE_CLASS);

    ripple.style.left = `${localX - radius}px`;
    ripple.style.top = `${localY - radius}px`;
    ripple.style.width = ripple.style.height = `${radius * 2}px`;

    rippleContainer.appendChild(ripple);

    const removeCancelListeners = CANCEL_EVENTS.map((event) =>
      on(el, event, removeRipple, { passive: true })
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
      on(element, event, (e) => createRipple(element, e), { passive: event === "touchstart" })
    );

    return () => {
      rippleContainer?.remove();
      removeTriggerListeners.forEach((unlisten) => unlisten());
    };
  };
}
