import { onMount } from "svelte";
import { innerWidth } from "svelte/reactivity/window";
import { version } from "$helpers";
import { quaffConfig, type QuaffConfig } from "$internal/quaffConfig";
import { page } from "$app/state";

type DisplayMode = "light" | "dark";

const DISPLAY_MODE_STORAGE_KEY = "displayMode";

class Quaff {
  public version = version;

  private static readonly breakpointList = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  };

  public readonly breakpoints = $derived.by(() => {
    type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";
    const currentWidth = innerWidth.current;

    let current: Breakpoint;

    if (!currentWidth || currentWidth < 600) {
      current = "xs";
    } else if (currentWidth < 960) {
      current = "sm";
    } else if (currentWidth < 1280) {
      current = "md";
    } else if (currentWidth < 1920) {
      current = "lg";
    } else {
      current = "xl";
    }

    return {
      ...Quaff.breakpointList,
      currentWidth: currentWidth || 0,
      current,
      isMoreThan(breakpoint: Breakpoint, included = false) {
        if (!currentWidth) {
          return false;
        }

        const breakpointWidth = this[breakpoint];
        return included ? currentWidth >= breakpointWidth : currentWidth > breakpointWidth;
      },
      isLessThan(breakpoint: Breakpoint, included = false) {
        if (!currentWidth) {
          return false;
        }

        const breakpointWidth = this[breakpoint];
        return included ? currentWidth <= breakpointWidth : currentWidth < breakpointWidth;
      },
    };
  });
  public router = $derived(page);

  protected dark = $state(false);

  public init(config: Partial<QuaffConfig> = {}) {
    quaffConfig.expressive = config.expressive ?? false;

    onMount(() => {
      this.applyDisplayMode(this.getCurrentDisplayMode(), false);
    });
  }

  protected getCurrentDisplayMode(): DisplayMode {
    const savedDisplayMode = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);

    if (savedDisplayMode === "dark" || savedDisplayMode === "light") {
      return savedDisplayMode;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  protected applyDisplayMode(displayMode: DisplayMode, persist = true) {
    this.dark = displayMode === "dark";

    if (typeof document !== "undefined") {
      document.documentElement.style.colorScheme = displayMode;
      document.body.classList.remove("body--light", "body--dark");
      document.body.classList.add(`body--${displayMode}`);
    }

    if (persist && typeof localStorage !== "undefined") {
      localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, displayMode);
    }
  }

  protected toggleDarkMode() {
    this.applyDisplayMode(this.dark ? "light" : "dark");
  }

  protected setDarkMode(newVal: boolean) {
    this.applyDisplayMode(newVal ? "dark" : "light");
  }

  public get darkMode() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      get isActive() {
        return self.dark;
      },
      toggle: () => this.toggleDarkMode(),
      set: (newVal: boolean) => this.setDarkMode(newVal),
    };
  }
}

export default new Quaff();
