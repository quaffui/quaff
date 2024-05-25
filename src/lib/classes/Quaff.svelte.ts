import { get } from "svelte/store";
import version from "$lib/helpers/version";
import { page } from "$app/stores";

type Mode = "light" | "dark";

class Quaff {
  public version = version;

  protected dark = $state(false);
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

  public get router() {
    return get(page);
  }
}

export default new Quaff();
