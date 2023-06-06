import { writable, derived } from "svelte/store";
import { page } from "$app/stores";
import { browser } from "$app/environment";

function quaff() {
  const { subscribe, set, update } = writable({
    version: __QUAFF_VERSION__,
    dark: true,
    //TODO lang: {},
    //TODO iconSet: {},
  });

  subscribe(($quaff) => {
    if (browser) {
      $quaff.dark = localStorage.current_mode === "light" ? false : true;

      let body = document.querySelector("body");
      if ($quaff.dark === true) {
        body && body.classList.add("dark");
      } else {
        body && body.classList.remove("dark");
      }
    }
  });

  const toggleDarkMode = () => {
    return update((q) => {
      q.dark = !q.dark;

      let body = document.querySelector("body");

      if (q.dark === true) {
        body && body.classList.add("dark");
      } else {
        body && body.classList.remove("dark");
      }

      localStorage.current_mode = q.dark === true ? "dark" : "light";

      return q;
    });
  };

  return {
    subscribe,
    toggleDarkMode,
  };
}

const quaffStore = quaff();

export const Quaff = derived([quaffStore, page], ([$quaff, $page]) => {
  return {
    version: $quaff.version,
    router: $page,
    dark: {
      isActive: $quaff.dark,
      toggle: quaffStore.toggleDarkMode,
    },
    subscribe: {
      quaff: quaffStore.subscribe,
      page: page.subscribe,
    },
  };
});
