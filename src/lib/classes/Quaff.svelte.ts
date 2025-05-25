import { onMount } from "svelte";
import { innerWidth } from "svelte/reactivity/window";
import { version } from "$helpers";
import { page } from "$app/state";

type Mode = "light" | "dark";

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

  public init() {
    onMount(() => {
      const currentMode: Mode =
        (localStorage.getItem("current_mode") as Mode) ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

      if (currentMode === "dark") {
        this.dark = true;
      } else {
        this.dark = false;
      }
    });
  }

  protected toggleDarkMode() {
    this.dark = !this.dark;

    const mode: { from: Mode; to: Mode } = {
      from: this.dark ? "light" : "dark",
      to: this.dark ? "dark" : "light",
    };

    const body = document.querySelector("body");
    body?.classList.replace(`body--${mode.from}`, `body--${mode.to}`);
    localStorage.setItem("current_mode", mode.to);
  }

  protected setDarkMode(newVal: boolean) {
    this.dark = newVal;
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
