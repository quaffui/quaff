import { HTMLAnchorAttributes } from "svelte/elements";

export interface Disableable {
  /**
   * Puts the component into a disabled state, which prevents user interaction.
   *
   * @default false
   */
  disabled?: boolean;
}

export interface Clickable extends Disableable {
  /**
   * Disables the ripple effect on click.
   *
   * @default false
   */
  noRipple?: boolean;

  /**
   * Sets the ripple effect's color for the component.
   * If omitted, the ripple will inherit the component's text color.
   */
  rippleColor?: string;
}

export interface Linkable {
  /**
   * Makes the component navigational, typically used for links to set the URL or route it should navigate to.
   */
  href?: string;

  /**
   * Makes the component navigational, typically used for links to set the URL or route it should navigate to.
   *
   * As it is the same as href, it is recommended to use href instead.
   */
  to?: string;

  /**
   * Replaces the current entry in the browser's history rather than adding a new one.
   *
   * This is the same as setting the `data-sveltekit-reload` attribute to "true".
   *
   * @default false
   */
  replace?: boolean;

  /**
   * For navigational components only, sets or retrieves the window or frame at which to target content.
   */
  target?: HTMLAnchorAttributes["target"];
}
