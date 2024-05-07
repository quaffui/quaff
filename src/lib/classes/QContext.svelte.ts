import { getContext, setContext } from "svelte";

export class QContext<T> {
  #state = $state<T>();

  constructor(init: T) {
    this.#state = init;
  }

  static get<T>(contextName: string) {
    return getContext<QContext<T>>(contextName);
  }

  set(contextName: string) {
    setContext(contextName, this);

    return this;
  }

  update(newVal: T) {
    this.#state = newVal;
  }

  get value() {
    return this.#state;
  }
}
