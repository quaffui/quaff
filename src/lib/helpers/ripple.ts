interface RippleOptions {
  center?: boolean;
  color?: string; // CSS color
  duration?: number; // In ms
}

const triggerEvents: any[] = ["pointerdown", "touchstart", "keydown"];
const cancelEvents = ["mouseleave", "dragleave", "touchmove", "touchcancel", "pointerup", "keyup"];

export function ripple(el: HTMLElement, options: RippleOptions = {}) {
  function addClasses(center?: boolean) {
    let shouldBeCentered = center || options.center;

    !el.classList.contains("q-ripple--effect") && el.classList.add("q-ripple--effect");

    !shouldBeCentered &&
      el.classList.contains("q-ripple--center") &&
      el.classList.remove("q-ripple--center");

    shouldBeCentered && el.classList.add("q-ripple--center");
  }

  function setOptions(options: RippleOptions) {
    if (options.duration && options.duration <= 0) {
      options.duration = undefined;
    }

    options.color && el.style.setProperty("--ripple-color", options.color);

    options.duration && el.style.setProperty("--ripple-duration", `${options.duration}ms`);
  }

  addClasses();
  setOptions(options);

  function createRipple(e: PointerEvent | KeyboardEvent, center?: boolean) {
    if (el.hasAttribute("aria-disabled")) return;

    if (e instanceof KeyboardEvent) {
      if ((e.code !== "Enter" && e.code !== "Space") || e.repeat) {
        return;
      }

      e.preventDefault();
      let click = new PointerEvent("pointerdown");
      createRipple(click, true);

      return;
    }

    addClasses(center);

    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left > el.offsetWidth / 2 ? 0 : el.offsetWidth;
    const y = e.clientY - rect.top > el.offsetHeight / 2 ? 0 : el.offsetHeight;
    const radius = Math.hypot(x - (e.clientX - rect.left), y - (e.clientY - rect.top));

    const ripple = document.createElement("div");
    ripple.classList.add("q-ripple");

    ripple.style.left = `${e.clientX - rect.left - radius}px`;
    ripple.style.top = `${e.clientY - rect.top - radius}px`;
    ripple.style.width = ripple.style.height = `${radius * 2}px`;

    el.appendChild(ripple);

    function removeRipple() {
      if (ripple === null) return;

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
