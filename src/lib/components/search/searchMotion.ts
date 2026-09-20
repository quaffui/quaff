type SearchElements = {
  bar: HTMLElement;
  dialog: HTMLDialogElement;
  header: HTMLElement;
  panel: HTMLElement;
  divider: HTMLElement;
};

type SearchLayout = { expressive: boolean; fullscreen: boolean };
type SpatialAnimations = Record<"dialog" | "header" | "panel", Animation>;

export type SearchMotion = {
  wait: () => Promise<unknown>;
  stopObserving: () => void;
  cancel: () => void;
};

function getViewFrame(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  const styles = getComputedStyle(element);

  return {
    top: `${bounds.top}px`,
    left: `${bounds.left}px`,
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    borderRadius: styles.borderRadius,
    padding: styles.padding,
    right: "auto",
    bottom: "auto",
  };
}

function getHeaderFrame(element: HTMLElement) {
  const styles = getComputedStyle(element);

  return {
    height: styles.height,
    margin: styles.margin,
    borderRadius: styles.borderRadius,
    boxShadow: styles.boxShadow,
    overflow: "hidden",
  };
}

function getExpandedFrames({ dialog, header, panel }: SearchElements, minHeight: string) {
  return {
    dialog: { ...getViewFrame(dialog), minHeight },
    header: getHeaderFrame(header),
    panel: { height: `${panel.getBoundingClientRect().height}px`, flex: "0 0 auto" },
  };
}

function getCollapsedFrames({ bar }: SearchElements, { expressive, fullscreen }: SearchLayout) {
  const anchor = { ...getViewFrame(bar), padding: "0px" };

  return {
    dialog: { ...anchor, minHeight: anchor.height },
    header: {
      height: anchor.height,
      margin: "0px",
      borderRadius: anchor.borderRadius,
      boxShadow: fullscreen || expressive ? getComputedStyle(bar).boxShadow : "none",
      overflow: "hidden",
    },
    panel: { height: "0px", flex: "0 0 auto" },
  };
}

function clampMotionEasing(easing: string) {
  const points = easing.match(/-?\d*\.?\d+/g)?.map(Number);

  if (!easing.startsWith("cubic-bezier(") || points?.length !== 4) {
    return easing;
  }

  const [x1, y1, x2, y2] = points;
  const bezier = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  // Clamp expressive docked expansion so its spring cannot overshoot the final size.
  const stops = Array.from({ length: 61 }, (_, index) => {
    const t = index / 60;
    const progress = Math.max(0, Math.min(1, bezier(t, y1, y2)));
    return `${progress.toFixed(5)} ${(bezier(t, x1, x2) * 100).toFixed(5)}%`;
  });

  return `linear(${stops.join(", ")})`;
}

function getMotionOptions(dialog: HTMLDialogElement, { expressive, fullscreen }: SearchLayout) {
  const styles = getComputedStyle(dialog);
  const duration = styles.getPropertyValue("--q-search-motion-duration").trim();
  const easing = styles.getPropertyValue("--q-search-motion-easing").trim() || "ease";
  const durationMs = Number.parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);

  return {
    duration: Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : 350,
    easing: expressive && !fullscreen ? clampMotionEasing(easing) : easing,
    fill: "both",
  } satisfies KeyframeAnimationOptions;
}

function captureFades({ dialog, header, panel, divider }: SearchElements, opening: boolean) {
  const content = [panel, divider, ...header.querySelectorAll<HTMLElement>(".q-search__clear")].map(
    (element) => ({
      element,
      from: dialog.open ? getComputedStyle(element).opacity : "0",
      to: opening ? "1" : "0",
    })
  );
  const glyphs = Array.from(
    header.querySelectorAll<HTMLElement>(".q-search__back-glyph, .q-search__search-glyph"),
    (element) => {
      const isBack = element.classList.contains("q-search__back-glyph");
      const initialOpacity = isBack ? "0" : "1";

      return {
        element,
        from: dialog.open ? getComputedStyle(element).opacity : initialOpacity,
        to: opening === isBack ? "1" : "0",
      };
    }
  );

  return [...content, ...glyphs];
}

function observeContentResize(
  resultsContent: HTMLElement,
  elements: SearchElements,
  spatial: SpatialAnimations,
  readFrames: () => ReturnType<typeof getExpandedFrames>,
  targetHeight: string,
  isCurrent: () => boolean
) {
  const parts = (["dialog", "header", "panel"] as const).map((name) => ({
    name,
    element: elements[name],
    animation: spatial[name],
    effect: spatial[name].effect as KeyframeEffect,
  }));
  const observer = new ResizeObserver(() => {
    if (!isCurrent() || parts.some(({ animation }) => animation.playState !== "running")) {
      return;
    }

    const from = readFrames();
    // Detach and restore effects synchronously to measure the final CSS layout.
    parts.forEach(({ effect }) => (effect.target = null));
    const to = readFrames();
    parts.forEach(({ effect, element }) => (effect.target = element));
    const nextHeight = to.dialog.height;

    if (Math.abs(Number.parseFloat(nextHeight) - Number.parseFloat(targetHeight)) < 0.5) {
      return;
    }

    targetHeight = nextHeight;
    const remaining = Math.max(
      150,
      Number(spatial.dialog.effect!.getTiming().duration) - Number(spatial.dialog.currentTime)
    );

    parts.forEach(({ name, animation, effect }) => {
      // Reset time before shortening duration to keep the finished promise pending.
      animation.currentTime = 0;
      effect.setKeyframes([from[name], to[name]]);
      effect.updateTiming({ duration: remaining });
    });
  });
  observer.observe(resultsContent);

  return observer;
}

/** Capture the visible state before canceling an interrupted search animation. */
export function prepareSearchMotion(
  elements: SearchElements,
  { opening, ...layout }: SearchLayout & { opening: boolean }
) {
  const { dialog, header, panel } = elements;
  const collapsed = getCollapsedFrames(elements, layout);
  const readFrames = () => getExpandedFrames(elements, collapsed.dialog.height);
  const from = dialog.open ? readFrames() : collapsed;
  const fades = captureFades(elements, opening);

  return {
    start({
      resultsContent,
      isCurrent,
      ...currentLayout
    }: SearchLayout & { resultsContent?: HTMLElement; isCurrent: () => boolean }): SearchMotion {
      const to = opening ? readFrames() : collapsed;
      const options = getMotionOptions(dialog, currentLayout);
      const fadeOptions = {
        ...options,
        duration: Math.min(150, options.duration),
        easing: "linear",
      };
      const spatial = {
        dialog: dialog.animate([from.dialog, to.dialog], options),
        header: header.animate([from.header, to.header], options),
        panel: panel.animate([from.panel, to.panel], options),
      };
      const animations = [
        ...Object.values(spatial),
        ...fades.map(({ element, from, to }) =>
          element.animate([{ opacity: from }, { opacity: to }], fadeOptions)
        ),
      ];
      const shouldObserve = opening && !currentLayout.fullscreen && resultsContent;
      const observer = shouldObserve
        ? observeContentResize(
            resultsContent,
            elements,
            spatial,
            readFrames,
            to.dialog.height,
            isCurrent
          )
        : undefined;

      const stopObserving = () => observer?.disconnect();

      return {
        wait: () => Promise.allSettled(animations.map((animation) => animation.finished)),
        stopObserving,
        cancel() {
          stopObserving();
          animations.forEach((animation) => animation.cancel());
        },
      };
    },
  };
}
