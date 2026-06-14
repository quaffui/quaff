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
}

const TRIGGER_EVENTS = ["pointerdown", "touchstart", "keydown"] as const;
const CANCEL_EVENTS = ["mouseleave", "dragleave", "touchmove", "touchcancel", "pointerup", "keyup"];

const RIPPLE_CLASS = "q-ripple";
const CENTER_CLASS = `${RIPPLE_CLASS}--center`;
const EFFECT_CLASS = `${RIPPLE_CLASS}__effect`;

const COLOR_PROPERTY = "--ripple-color";
const DURATION_PROPERTY = "--ripple-duration";

export function ripple(options: RippleOptions = {}): Attachment<HTMLElement> {
  const rippleContainer = document.createElement("div");

  function isDisabled(el: HTMLElement, opts: RippleOptions) {
    return opts.disabled || el.hasAttribute("aria-disabled");
  }

  function addClasses(center = false) {
    const shouldBeCentered = center || options.center;

    rippleContainer.classList.add(EFFECT_CLASS);

    if (shouldBeCentered) {
      rippleContainer.classList.add(CENTER_CLASS);
    } else {
      rippleContainer.classList.remove(CENTER_CLASS);
    }
  }

  function setOptions(el: HTMLElement, opts: RippleOptions) {
    if (isDisabled(el, opts)) {
      rippleContainer.remove();
      return;
    }

    el.appendChild(rippleContainer);

    if (opts.duration && opts.duration < 0) {
      opts.duration = undefined;
    }

    if (opts.duration) {
      rippleContainer.style.setProperty(DURATION_PROPERTY, `${opts.duration}ms`);
    }

    if (opts.color) {
      rippleContainer.style.setProperty(COLOR_PROPERTY, `var(--${opts.color}, ${opts.color})`);
    }
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

      event.preventDefault();
      const click = new PointerEvent("pointerdown");
      createRipple(el, click, true);

      return;
    }

    addClasses(center);

    const rect = el.getBoundingClientRect();

    const { clientX, clientY } =
      window.TouchEvent && event instanceof TouchEvent ? event.touches[0] : (event as PointerEvent);

    const x = clientX - rect.left > el.offsetWidth / 2 ? 0 : el.offsetWidth;
    const y = clientY - rect.top > el.offsetHeight / 2 ? 0 : el.offsetHeight;
    const radius = Math.hypot(x - (clientX - rect.left), y - (clientY - rect.top));

    const ripple = document.createElement("div");
    ripple.classList.add(RIPPLE_CLASS);

    ripple.style.left = `${clientX - rect.left - radius}px`;
    ripple.style.top = `${clientY - rect.top - radius}px`;
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
      }, options.duration || 1000);

      removeCancelListeners.forEach((removeCancelListener) => removeCancelListener());
    }
  }

  return (element: HTMLElement) => {
    addClasses();
    setOptions(element, options);

    const removeTriggerListeners = TRIGGER_EVENTS.map((event) =>
      on(element, event, (e) => createRipple(element, e), { passive: event === "touchstart" })
    );

    return () => {
      rippleContainer.remove();
      removeTriggerListeners.forEach((unlisten) => unlisten());
    };
  };
}
