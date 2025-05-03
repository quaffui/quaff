import { onMount } from "svelte";
import version from "$lib/helpers/version";
import { page } from "$app/state";

type Mode = "light" | "dark";

class Quaff {
  public version = version;
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
