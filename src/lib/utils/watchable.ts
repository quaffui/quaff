import { Readable, Updater, Writable, derived, writable } from "svelte/store";

export function watchable<T>(value: T): readonly [Writable<T>, Readable<T | null>] {
  let values = writable<[T, T | null]>([value, null]);

  const subscribe = derived(values, ($values) => $values[0]).subscribe;

  const update = (fn: Updater<T>, isEqual: (a: T, b: T) => boolean = (a, b) => a === b) => {
    values.update(($values) => {
      const newValue = fn($values[0]);

      if (isEqual(newValue, $values[0])) {
        return $values;
      }

      return [newValue, $values[0]];
    });
  };

  const set = (newValue: T) => update(() => newValue);

  const current = {
    subscribe,
    update,
    set,
  };

  const previous = derived(values, ($values) => $values[1]);

  return [current, previous];
}
