import { onMount } from "svelte";
import { innerHeight, innerWidth } from "svelte/reactivity/window";
import { version } from "$helpers";
import { initI18n } from "$internal/i18n.svelte";
import { captureAppContext } from "$internal/appContext";
import { initQuaffConfig, type QuaffConfig } from "$internal/quaffConfig.svelte";
import { resolveScreen } from "$internal/breakpoints";
import { page } from "$app/state";

type DisplayMode = "light" | "dark";

const DISPLAY_MODE_STORAGE_KEY = "displayMode";

class Quaff {
  public version = version;

  private mounted = $state(false);

  public readonly screen = $derived(
    this.mounted ? resolveScreen(innerWidth.current, innerHeight.current) : resolveScreen(undefined)
  );
  public router = $derived(page);

  protected dark = $state(false);

  /** Evaluate container dimensions. Wrap in $derived when the measurements change. */
  public getScreen(width: number | undefined, height?: number) {
    return resolveScreen(width, height);
  }

  public init(config: Partial<QuaffConfig> = {}) {
    initQuaffConfig(config);
    initI18n(config);
    captureAppContext();

    onMount(() => {
      this.mounted = true;
      this.applyDisplayMode(this.getCurrentDisplayMode(), false);
    });
  }

  protected getCurrentDisplayMode(): DisplayMode {
    try {
      const savedDisplayMode = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);

      if (savedDisplayMode === "dark" || savedDisplayMode === "light") {
        return savedDisplayMode;
      }
    } catch {
      // Use the system preference when storage is unavailable.
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

    if (persist && typeof window !== "undefined") {
      try {
        localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, displayMode);
      } catch {
        // Theme changes still apply when storage is blocked or full.
      }
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
