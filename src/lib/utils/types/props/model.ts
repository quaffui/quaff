export interface RequiredModel<T> {
  /**
   * The bound value of the component.
   */
  value: T;
}

export interface OptionalModel<T> {
  /**
   * The bound value of the component.
   */
  value?: T;
}
