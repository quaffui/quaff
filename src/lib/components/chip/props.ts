import type { Disableable, Labelable, QSizeable } from "$utils";
import type { MaterialSymbol } from "material-symbols";
import type { HTMLAttributes, MouseEventHandler } from "svelte/elements";

export type QChipKindOptions = "assist" | "filter" | "input" | "suggestion";
export type QChipFillOptions =
  "primary" | "secondary" | "tertiary" | "neutral" | "neutral-variant" | "error";

export interface QChipProps
  extends QSizeable<"none" | "xs" | "xl">, Labelable, Disableable, HTMLAttributes<HTMLDivElement> {
  /**
   * The chip's kind. It will control the chip's style and behavior.
   */
  kind?: QChipKindOptions;

  /**
   * Name of the leading icon to use for the chip. If starts with "img:", will be used as an image src instead.
   */
  icon?: MaterialSymbol | `img:${string}`;

  /**
   * Only for filter and input chips. Name of the trailing icon to use for the chip.
   * Provide onTrailingIconClick to make the icon actionable.
   */
  trailingIcon?: MaterialSymbol | `img:${string}`;

  /**
   * Accessible name for the trailing action. Defaults to "Remove" followed by the chip label for
   * input chips, or "Options for" followed by the label for filter chips.
   * Remove-only chips also honor an existing aria-label or aria-labelledby before using this default.
   */
  trailingIconLabel?: string;

  /**
   * Editable text for input chips. This property is bindable and independent of the displayed label.
   * If no label is provided, the input chip will display the current value instead.
   */
  value?: string;

  /**
   * Only for filter chips. Controls whether the chip is selected or not.
   */
  selected?: boolean;

  /**
   * Elevates an assist, filter, or suggestion chip, giving it box-shadow and a background color.
   */
  elevated?: boolean;

  /**
   * Disable the ripple effect for the chip.
   */
  noRipple?: boolean;

  /**
   * Click event handler for the trailing action. For input chips with a trailing icon, also called
   * on Backspace or Delete.
   * An input chip without a value or onclick handler uses the entire chip as its removal action.
   */
  onTrailingIconClick?: MouseEventHandler<HTMLElement>;
}
