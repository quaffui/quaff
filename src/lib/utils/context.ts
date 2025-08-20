import { getContext, hasContext, setContext } from "svelte";

/**
 * This function allows to manipulate contexts more easily.
 * It avoids having to pass a Svelte store down the components but rather use runes to keep the context reactive.
 */
export function QContext<T>(name: string) {
  const sym = Symbol(name);

  return {
    /**
     * The inner symbol used to identify the context.
     */
    get symbol() {
      return sym;
    },

    /**
     * Get the context value.
     * @returns The context value or undefined if not found.
     */
    get() {
      return getContext<T | undefined>(sym);
    },

    /**
     * Get the context value or throw an error if not found.
     *
     * @param errorMsg Optional error message to throw if context is not found.
     * @returns The context value.
     * @throws Error if context is not found.
     */
    assertGet(errorMsg?: string) {
      const ctx = getContext<T | undefined>(sym);

      if (!ctx) {
        throw new Error(errorMsg || `Context "${name}" not found`);
      }

      return ctx;
    },

    /**
     * Set the context value.
     * @param context The context value to set.
     */
    set(context: T) {
      setContext(sym, context);
    },

    /**
     * Reset the context value.
     */
    reset() {
      setContext(sym, undefined);
    },

    /**
     * Checks whether the context exists.
     * @returns True if the context exists, false otherwise.
     */
    exists() {
      return hasContext(sym);
    },

    /**
     * Update one entry of the context.
     *
     * @param key The key of the entry to update.
     * @param value The new value for the entry.
     */
    updateEntry(key: keyof T, value: NonNullable<T>[keyof T]) {
      const ctx = getContext<T | undefined>(sym);

      if (!ctx) {
        return;
      }

      ctx[key] = value;
    },

    /**
     * Update multiple entries of the context.
     *
     * @param updates The key/value pairs to update in the context.
     */
    updateEntries(updates: Partial<T>) {
      const ctx = getContext<T | undefined>(sym);

      if (!ctx) {
        return;
      }

      Object.assign(ctx, updates);
    },
  };
}
