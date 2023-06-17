import { writable, derived } from "svelte/store";
import { page } from "$app/stores";
import { browser } from "$app/environment";

const getCookieValue = (cookie: string, name: string): string | null =>
  cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || null;

function quaff() {
  const { subscribe, set, update } = writable({
    version: __QUAFF_VERSION__,
    dark: false,
    //TODO lang: {},
    //TODO? iconSet: {},
  });

  const toggleDarkMode = () => {
    return update((q) => {
      q.dark = !q.dark;

      let body = document.querySelector("body");

      if (q.dark === true) {
        body && body.classList.replace("light", "dark");
      } else {
        body && body.classList.replace("dark", "light");
      }

      let mode = q.dark === true ? "dark" : "light";
      document.cookie = `current_mode=${mode};max-age=31536000;path="/"`;

      return q;
    });
  };

  const setDarkMode = (newVal: boolean) => {
    return update((q) => {
      q.dark = newVal;

      return q;
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
