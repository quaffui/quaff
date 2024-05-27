import { getContext, setContext } from "svelte";

/**
 * This class allows to manipulate reactive contexts more easily.
 * It avoids having to pass a Svelte store down the components but rather use runes to keep the context reactive.
 *
 * This class should be used when the context has to be modified from a child component. Otherwise, using svelte's context API should be enough.
 */
export default class QContext<T> {
  #state = $state<T>();

  constructor(contextName: string, init: T) {
    this.#state = init;

    setContext(contextName, this);
  }

  /**
   * Gets the value of context with id `contextName`
   * @param contextName - Name of the context to get
   * @returns The context's value
   */
  static get<T>(contextName: string) {
    return getContext<QContext<T> | undefined>(contextName);
  }

  /**
   * Prevents the propagation of the context further down
   * @param contextName - Name of the context to get
   * @returns The context result
   */
  static reset(contextName: string) {
    setContext(contextName, undefined);
  }

  /**
   * Updates the context's inner value with `newVal`
   * @param newVal - New value to update the context with
   */
  update(newVal: T) {
    this.#state = newVal;
  }

  /**
   * Updates the property of id `key` with `newVal` in the context's inner value
   * @param newVal - New value to update the context's property with
   */
  updateEntry(key: keyof T, newVal: NonNullable<T>[keyof T]) {
    if (!this.#state || typeof this.#state !== "object" || !Object.hasOwn(this.#state, key)) {
      throw new Error(`${key.toString()} doesn't exist on ${this.#state}`);
    }

    this.#state![key] = newVal;
  }

  /**
   * Inner value of the context
   */
  get value() {
    return this.#state as T;
  }
}
