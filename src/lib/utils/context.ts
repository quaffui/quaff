import { getContext, hasContext, setContext } from "svelte";

/**
 * Typed helpers for Svelte contexts.
 * Capture contexts during component initialization and pass them to updates in effects and callbacks.
 * The context preprocessor creates reactive getters and setters from typed interfaces.
 */
export function QContext<T>(name: string) {
  const symbol = Symbol(name);

  return {
    /**
     * The inner symbol used to identify the context.
     */
    get symbol() {
      return symbol;
    },

    /**
     * Get the context value.
     * @returns The context value or undefined if not found.
     */
    get() {
      return getContext<T | undefined>(symbol);
    },

    /**
     * Get the context value or throw an error if not found.
     *
     * @param errorMessage Optional error message to throw if context is not found.
     * @returns The context value.
     * @throws Error if context is not found.
     */
    assertGet(errorMessage?: string) {
      const context = getContext<T | undefined>(symbol);

      if (!context) {
        throw new Error(errorMessage || `Context "${name}" not found`);
      }

      return context;
    },

    /**
     * Set the context value.
     * @param context The context value to set.
     */
    set(context: T) {
      setContext(symbol, context);
    },

    /**
     * Reset the context value.
     */
    reset() {
      setContext(symbol, undefined);
    },

    /**
     * Checks whether the context exists.
     * @returns True if the context exists, false otherwise.
     */
    exists() {
      return hasContext(symbol);
    },

    /**
     * Update one entry of a captured context, if present.
     */
    updateEntry(ctx: T | undefined, key: keyof T, value: NonNullable<T>[keyof T]) {
      if (!ctx) {
        return;
      }

      ctx[key] = value;
    },

    /**
     * Update multiple entries of a captured context, if present.
     */
    updateEntries(ctx: T | undefined, updates: Partial<T>) {
      if (!ctx) {
        return;
      }

      Object.assign(ctx, updates);
    },
  };
}
