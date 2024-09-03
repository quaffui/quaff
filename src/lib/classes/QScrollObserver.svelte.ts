type Direction = "up" | "right" | "down" | "left";

type WindowScrollType = "scrollX" | "scrollY";
type DocumentScrollType = "scrollLeft" | "scrollTop";

type ScrollType = {
  window: WindowScrollType;
  document: DocumentScrollType;
};

/**
 * A scroll observer utility.
 * @example
 * ```js
 * // Inside the <script> tag
 * const scroll = new QScrollObserver();
 *
 * $inspect(scroll.direction)
 * ```
 *
 * @param horizontal - If set to `true`, observe horizontal scrolling rather than vertical
 * @param debounce - Time in milliseconds between each observation update
 */
export default class QScrollObserver {
  private scrollType: ScrollType = {
    window: "scrollY",
    document: "scrollTop",
  };
  private lastScroll: number;
  private horizontal: boolean = false;
  private clearTimer: (() => void) | null = null;

  direction = $state<Direction>("down");
  changedDirection = $state(false);
  delta = $state(0);
  inflectionPoint = $state(0);
  position = $state(0);

  constructor(horizontal = false, debounce = 250) {
    this.horizontal = horizontal;

    this.scrollType = horizontal
      ? { window: "scrollX", document: "scrollLeft" }
      : { window: "scrollY", document: "scrollTop" };

    this.lastScroll = 0;
    this.position = 0;
    this.inflectionPoint = 0;
    this.direction = horizontal ? "right" : "down";

    const handler = (e: Event) => {
      const target = e.target as HTMLDivElement | null;
      if (!target || target.parentElement?.classList.contains("q-layout")) {
        return;
      }

      if (!debounce) {
        this.updateDirection(target);
      } else if (this.clearTimer === null) {
        const timer = setTimeout(this.updateDirection.bind(this, target), debounce);

        this.clearTimer = () => {
          clearTimeout(timer);
          this.clearTimer = null;
        };
      }
    };

    $effect(() => {
      window.addEventListener("scroll", handler, { capture: true });

      return () => {
        this.clearTimer?.();

        window.removeEventListener("scroll", handler, true);
      };
    });
  }

  private getScrollPosition(target: HTMLElement | typeof window | undefined = window) {
    return Math.max(
      0,
      target === window
        ? target[this.scrollType.window]
        : (target as HTMLElement)[this.scrollType.document]
    );
  }

  private updateDirection(target: HTMLDivElement) {
    this.clearTimer?.();

    const newScrollPosition = this.getScrollPosition(target);

    this.position = newScrollPosition;
    this.delta = newScrollPosition - this.lastScroll;

    const newDirection: Direction =
      this.delta > 0 ? (this.horizontal ? "right" : "down") : this.horizontal ? "left" : "up";

    this.changedDirection = newDirection !== this.direction;

    if (this.changedDirection) {
      this.direction = newDirection;
      this.inflectionPoint = newScrollPosition;
    }

    this.lastScroll = newScrollPosition <= 0 ? 0 : newScrollPosition;
  }
}
