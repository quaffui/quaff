import { writable, derived } from "svelte/store";
import { page } from "$app/stores";

function quaff() {
  const { subscribe, set, update } = writable({
    version: __QUAFF_VERSION__,
    dark: false,
    //TODO lang: {},
    //TODO iconSet: {},
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
