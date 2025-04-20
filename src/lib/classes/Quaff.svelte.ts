import version from "$lib/helpers/version";
import { page } from "$app/state";
import { browser } from "$app/environment";

type Mode = "light" | "dark";

class Quaff {
  public version = version;
  public router = $derived(page);

  protected dark = $state(false);

  constructor() {
    if (browser) {
      let currentMode;

      if (document.cookie.includes("current_mode")) {
        currentMode = document.cookie
          .split("; ")
          .find((row) => row.startsWith("current_mode="))
          ?.split("=")[1];
      } else {
        currentMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      if (currentMode === "dark") {
        this.dark = true;
      } else {
        this.dark = false;
      }

      const body = document.querySelector("body");
      body?.classList.add(`body--${this.dark ? "dark" : "light"}`);
    }
  }

  private toggleDarkMode() {
    this.dark = !this.dark;

    const mode: { from: Mode; to: Mode } = {
      from: this.dark ? "light" : "dark",
      to: this.dark ? "dark" : "light",
    };

    const body = document.querySelector("body");
    body?.classList.replace(`body--${mode.from}`, `body--${mode.to}`);

    document.cookie = `current_mode=${mode.to}; max-age=31536000; path="/"; SameSite=strict`;
  }
  private setDarkMode(newVal: boolean) {
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
