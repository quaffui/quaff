interface RippleOptions {
  center?: boolean;
  color?: string; // CSS color
  duration?: number; // In ms
  disabled?: boolean; // Should the ripple be disabled
}

const triggerEvents = ["pointerdown", "touchstart", "keydown"] as const;
const cancelEvents = ["mouseleave", "dragleave", "touchmove", "touchcancel", "pointerup", "keyup"];

export function ripple(el: HTMLElement, options: RippleOptions = {}) {
  const rippleContainer = document.createElement("div");
  addClasses();

  setOptions(options);

  function addClasses(center?: boolean) {
    const shouldBeCentered = center || options.center;

    if (!rippleContainer.classList.contains("q-ripple--effect")) {
      rippleContainer.classList.add("q-ripple--effect");
    }

    if (!shouldBeCentered && rippleContainer.classList.contains("q-ripple--center")) {
      rippleContainer.classList.remove("q-ripple--center");
    }

    if (shouldBeCentered) {
      rippleContainer.classList.add("q-ripple--center");
    }
  }

  function setOptions(options: RippleOptions) {
    if (options.disabled || el.hasAttribute("aria-disabled")) {
      rippleContainer.remove();
    } else {
      el.appendChild(rippleContainer);
    }

    if (options.duration && options.duration < 0) {
      options.duration = undefined;
    }

    if (options.color) {
      rippleContainer.style.setProperty("--ripple-color", options.color);
    }

    if (options.duration) {
      rippleContainer.style.setProperty("--ripple-duration", `${options.duration}ms`);
    }
  }

  function createRipple(e: PointerEvent | KeyboardEvent | TouchEvent, center?: boolean) {
    if (options.disabled || el.hasAttribute("aria-disabled")) {
      return;
    }

    if (e instanceof KeyboardEvent) {
      if (!["Enter", "Space"].includes(e.code) || e.repeat) {
        return;
      }

      e.preventDefault();
      const click = new PointerEvent("pointerdown");
      createRipple(click, true);

      return;
    }

    addClasses(center);

    const rect = el.getBoundingClientRect();

    const clientX =
      window.TouchEvent && e instanceof TouchEvent
        ? e.touches[0].clientX
        : (e as PointerEvent).clientX;
    const clientY =
      window.TouchEvent && e instanceof TouchEvent
        ? e.touches[0].clientY
        : (e as PointerEvent).clientY;

    const x = clientX - rect.left > el.offsetWidth / 2 ? 0 : el.offsetWidth;
    const y = clientY - rect.top > el.offsetHeight / 2 ? 0 : el.offsetHeight;
    const radius = Math.hypot(x - (clientX - rect.left), y - (clientY - rect.top));

    const ripple = document.createElement("div");
    ripple.classList.add("q-ripple");

    ripple.style.left = `${clientX - rect.left - radius}px`;
    ripple.style.top = `${clientY - rect.top - radius}px`;
    ripple.style.width = ripple.style.height = `${radius * 2}px`;

    rippleContainer.appendChild(ripple);

    function removeRipple() {
      if (ripple === null) {
        return;
      }

      ripple.style.opacity = "0";

      setTimeout(() => {
        ripple.remove();
      }, options.duration || 1000);

      cancelEvents.forEach((event) => el.removeEventListener(event, removeRipple));
    }

    cancelEvents.forEach((event) => el.addEventListener(event, removeRipple));
  }

  triggerEvents.forEach((event) =>
    el.addEventListener(event, createRipple, { passive: event === "touchstart" })
  );

  return {
    destroy() {
      triggerEvents.forEach((event) => {
        el.removeEventListener(event, createRipple);
      });
    },
    update(newOptions: RippleOptions) {
      options = newOptions;

      setOptions(newOptions);
    },
  };
}
