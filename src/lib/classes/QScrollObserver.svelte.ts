import { onMount } from "svelte";
import { on } from "svelte/events";
import { scrollX, scrollY } from "svelte/reactivity/window";
import { elFromSelector } from "$utils";

type Direction = "up" | "right" | "down" | "left";

type DocumentScrollType = "scrollLeft" | "scrollTop";

type ScrollType = {
  document: DocumentScrollType;
};

type Target = HTMLElement | typeof window | Document | string;

type ScrollObserverOptions = {
  debounce?: number;
  horizontal?: boolean;
};

const SCROLL_LISTENER_OPTIONS = { capture: true } as const;

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
    document: "scrollTop",
  };
  protected lastScroll: number;
  protected horizontal: boolean = false;
  protected clearTimer: (() => void) | null = null;
  protected removeScrollListener: (() => void) | null = null;
  protected target: Exclude<Target, string> | null = null;
  protected debounce: number = 0;
  protected handler: (e: Event) => void;

  direction = $state<Direction>("down");
  changedDirection = $state(false);
  delta = $state(0);
  inflectionPoint = $state(0);
  position = $state(0);

  constructor(
    target?: Target | null,
    { horizontal, debounce }: ScrollObserverOptions = { horizontal: false, debounce: 0 }
  ) {
    this.horizontal = horizontal ?? false;
    this.debounce = debounce ?? 0;
    this.handler = (e: Event) => this.baseHandler(e);

    this.scrollType = horizontal ? { document: "scrollLeft" } : { document: "scrollTop" };

    this.lastScroll = 0;
    this.position = 0;
    this.inflectionPoint = 0;
    this.direction = horizontal ? "right" : "down";

    onMount(() => {
      let parsedTarget = elFromSelector(target ?? null);

      if (parsedTarget === null) {
        console.warn(`The given target (${target}) is null, observing window instead`);
        parsedTarget = window;
      }

      this.target = parsedTarget;

      this.removeScrollListener = on(parsedTarget, "scroll", this.handler, SCROLL_LISTENER_OPTIONS);

      return this.destroy.bind(this);
    });
  }

  protected getScrollPosition(target: HTMLElement | typeof window | undefined = window) {
    return Math.max(
      0,
      target === window
        ? ((this.horizontal ? scrollX.current : scrollY.current) ?? 0)
        : (target as HTMLElement)[this.scrollType.document]
    );
  }

  protected isScrollEventForTarget(eventTarget: EventTarget | null): boolean {
    if (!this.target || !eventTarget) {
      return false;
    }

    if (this.target === window) {
      return (
        eventTarget === document ||
        eventTarget === document.documentElement ||
        eventTarget === window
      );
    }

    return eventTarget === this.target;
  }

  protected baseHandler(e: Event) {
    if (!this.isScrollEventForTarget(e.target)) {
      return;
    }

    const target = this.target as HTMLElement | typeof window;

    if (this.debounce) {
      this.handleDebounce(target, this.debounce);
    } else {
      this.updateDirection(target);
    }
  }

  protected updateDirection(target: HTMLElement | typeof window) {
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

  protected handleDebounce(target: HTMLElement | typeof window, debounce: number) {
    if (this.clearTimer) {
      return;
    }

    const timer = setTimeout(() => this.updateDirection(target), debounce);

    this.clearTimer = () => {
      clearTimeout(timer);
      this.clearTimer = null;
    };
  }

  destroy() {
    this.clearTimer?.();
    this.clearTimer = null;

    this.removeScrollListener?.();
    this.removeScrollListener = null;

    this.target = null;
    this.direction = "down";
    this.changedDirection = false;
    this.delta = 0;
    this.inflectionPoint = 0;
    this.position = 0;
  }
}
