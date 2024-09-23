import { onMount } from "svelte";
import { elFromSelector } from "$utils";

type Direction = "up" | "right" | "down" | "left";

type WindowScrollType = "scrollX" | "scrollY";
type DocumentScrollType = "scrollLeft" | "scrollTop";

type ScrollType = {
  window: WindowScrollType;
  document: DocumentScrollType;
};

type Target = HTMLDivElement | typeof window | Document;

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
 * @param target - Element or selector of the element to add the scroll listener on
 * @param options - Options of the observer
 * @param options.horizontal - If set to `true`, observe horizontal scrolling rather than vertical
 * @param options.debounce - Time in milliseconds between each observation update
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

  direction = $state<Direction>("down");
  changedDirection = $state(false);
  delta = $state(0);
  inflectionPoint = $state(0);
  position = $state(0);

  constructor(
    target?: Target | null,
    { horizontal, debounce }: ScrollObserverOptions = { horizontal: false, debounce: 250 }
  ) {
    this.horizontal = horizontal ?? false;

    this.scrollType = horizontal
      ? { window: "scrollX", document: "scrollLeft" }
      : { window: "scrollY", document: "scrollTop" };

    this.lastScroll = 0;
    this.position = 0;
    this.inflectionPoint = 0;
    this.direction = horizontal ? "right" : "down";

    const handler = (e: Event) => {
      const eventTarget = e.target as HTMLElement | null;

      if (!eventTarget || !this.target || eventTarget !== this.target) {
        return;
      }

      if (debounce) {
        this.handleDebounce(this.target, debounce);
      } else {
        this.updateDirection(this.target);
      }
    };

    onMount(() => {
      let parsedTarget = elFromSelector(target ?? null);

      if (parsedTarget === null) {
        console.warn(`The given target (${target}) is null, observing window instead`);
        parsedTarget = window;
      }

      this.target = parsedTarget;

      parsedTarget.addEventListener("scroll", handler, { capture: true });

      return () => {
        this.clearTimer?.();

        parsedTarget.removeEventListener("scroll", handler, true);
      };
    });
  }

  protected getScrollPosition(target: HTMLElement | typeof window | undefined = window) {
    return Math.max(
      0,
      target === window
        ? target[this.scrollType.window]
        : (target as HTMLElement)[this.scrollType.document]
    );
  }

  protected updateDirection(target: HTMLElement) {
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

  protected handleDebounce(target: HTMLElement, debounce: number) {
    if (this.clearTimer) {
      return;
    }

    const timer = setTimeout(this.updateDirection.bind(this, target), debounce);

    this.clearTimer = () => {
      clearTimeout(timer);
      this.clearTimer = null;
    };
  }
}
