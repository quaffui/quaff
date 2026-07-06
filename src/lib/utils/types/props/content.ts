export interface Labelable {
  /**
   * The text to be displayed in the component.
   * When applicable, will overwrite the children snippet content.
   */
  label?: string;
}

/**
 * Props to handle `class` and `style` attributes for active components.
 *
 */
export interface WithActiveAttrs {
  /**
   * Class string to apply when the component (or its associated route) is active.
   *
   * `activeClass` on component groups (e.g. `QList`, `QTabs` etc.) will apply to active components they contain.
   * `activeClass` on individual components (e.g. `QItem`, `QTab` etc.) will overwrite `activeClass` from their containing group.
   */
  activeClass?: string;

  /**
   * Styles to add when the component (or its associated route) is active.
   *
   * `activeStyle` on component groups (e.g. `QList`, `QTabs` etc.) will apply to active components they contain.
   * `activeStyle` on individual components (e.g. `QItem`, `QTab` etc.) will overwrite `activeStyle` from their containing group.
   */
  activeStyle?: string;
}
