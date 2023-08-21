import { writable, derived } from "svelte/store";
import { page } from "$app/stores";
import version from "$lib/helpers/version";

function quaff() {
  const { subscribe, set, update } = writable({
    version,
    dark: false,
    //TODO lang: {},
    //TODO? iconSet: {},
  });

  type Mode = "light" | "dark";

  const toggleDarkMode = () => {
    return update(($quaff) => {
      $quaff.dark = !$quaff.dark;
      const mode: { from: Mode; to: Mode } = $quaff.dark
        ? {
            from: "light",
            to: "dark",
          }
        : {
            from: "dark",
            to: "light",
          };

      let body = document.querySelector("body");
      if (body) {
        body.classList.replace(`body--${mode.from}`, `body--${mode.to}`);
      }

      document.cookie = `current_mode=${mode.to}; max-age=31536000; path="/"; SameSite=strict`;

      return $quaff;
    });
  };

  const setDarkMode = (newVal: boolean) => {
    return update(($quaff) => {
      $quaff.dark = newVal;

      return $quaff;
    });
  };

  return {
    subscribe,
    setDarkMode,
    toggleDarkMode,
  };
}

export const quaffStore = quaff();

export const Quaff = derived([quaffStore, page], ([$quaff, $page]) => {
  return {
    version: $quaff.version,
    router: $page,
    dark: {
      isActive: $quaff.dark,
      toggle: quaffStore.toggleDarkMode,
      set: quaffStore.setDarkMode,
    },
    subscribe: {
      quaff: quaffStore.subscribe,
      page: page.subscribe,
    },
  };
});
