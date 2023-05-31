import { writable } from "svelte/store";

function dark() {
  const { subscribe, set, update } = writable(false);

  return {
    subscribe,
    toggle: () => update((val) => !val),
  };
}

function quaff() {
  const { subscribe, set, update } = writable({
    version: __QUAFF_VERSION__,
    dark: false,
    //TODO lang: {},
    //TODO iconSet: {},
  });

  const toggleDarkMode = () =>
    update((q) => {
      q.dark = !q.dark;

      return q;
    });

  return {
    subscribe,
    toggleDarkMode,
  };
}

export const Quaff = quaff();
