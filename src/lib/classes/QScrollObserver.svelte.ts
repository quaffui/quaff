import { onMount } from "svelte";

type Direction = "up" | "right" | "down" | "left";

type WindowScrollType = "scrollX" | "scrollY";
type DocumentScrollType = "scrollLeft" | "scrollTop";

type ScrollType = {
  window: WindowScrollType;
  document: DocumentScrollType;
};

type Target = typeof window | Document | HTMLDivElement | string;

type ScrollObserverOptions = {
  debounce?: number;
  horizontal?: boolean;
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
  protected scrollType: ScrollType = {
    window: "scrollY",
    document: "scrollTop",
  };
  protected lastScroll: number;
  protected horizontal: boolean = false;
  protected clearTimer: (() => void) | null = null;
  protected target: Exclude<Target, string> | null = null;

  public direction = $state<Direction>("down");
  public changedDirection = $state(false);
  public delta = $state(0);
  public inflectionPoint = $state(0);
  public position = $state(0);

  constructor(
    target?: Target | null,
    { horizontal, debounce }: ScrollObserverOptions = { horizontal: false, debounce: 250 }
  ) {
    this.horizontal = horizontal ?? false;
    debounce = debounce ?? 250;

    this.scrollType = horizontal
      ? { window: "scrollX", document: "scrollLeft" }
      : { window: "scrollY", document: "scrollTop" };

    this.lastScroll = 0;
    this.position = 0;
    this.inflectionPoint = 0;
    this.direction = horizontal ? "right" : "down";

    const handler = (e: Event) => {
      const target = e.target as HTMLDivElement | null;

      if (!this.target || target !== this.target) {
        return;
      }

      if (!debounce) {
        this.updateDirection(this.target);
      } else if (this.clearTimer === null) {
        const timer = setTimeout(this.updateDirection.bind(this, this.target), debounce);

        this.clearTimer = () => {
          clearTimeout(timer);
          this.clearTimer = null;
        };
      }
    };

    onMount(() => {
      let parsedTarget =
        typeof target === "string"
          ? document.querySelector<HTMLDivElement>(target)
          : target ?? null;

      if (parsedTarget === null) {
        console.warn(`The given target (${target}) is null, observing window`);
        parsedTarget = window;
      }

      this.target = parsedTarget;

      parsedTarget.addEventListener("scroll", handler, { capture: true });

      return () => {
        this.clearTimer?.();

        parsedTarget.removeEventListener("scroll", handler, { capture: true });
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
