import { getContext, setContext } from "svelte";

export function ref<T>(init: T) {
  let state = $state(init)

  return {
    get value() { return state },
    set value(newVal) { state = newVal }
  }
}

export class Context<T> {
  #state = $state<T>()

  constructor(init: T) {
    this.#state = init
  }

  static get<T>(contextName: string) {
    return getContext<Context<T>>(contextName)
  }

  set(contextName: string) {
    setContext(contextName, this)

    return this
  }

  update(newVal: T) {
    this.#state = newVal
  }

  get value() {
    return this.#state
  }
}