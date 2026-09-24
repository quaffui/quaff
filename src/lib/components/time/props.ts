import type { QInputProps } from "$components/input/props";
import { Disableable, OptionalModel } from "$utils";

export type QTimeValue = string | null;
export type QTimeDisplayMode = "dial" | "input";
export type QTimeVariant = "modal" | "docked" | "adaptive";
export type QTimePeriod = "am" | "pm";

export const defaultTimeLabels = {
  chooseTime: "Choose time",
  changeTime: "Change time",
  selectHour: "Select hour",
  selectMinute: "Select minute",
  hour: "Hour",
  minute: "Minute",
  of: "of",
  am: "AM",
  pm: "PM",
  switchToInput: "Toggle input picker",
  switchToDial: "Toggle dial picker",
  clock: "Time picker",
  timeInput: "Time",
  invalidTime: "Enter a valid time",
};
export type QTimeLabels = typeof defaultTimeLabels & {
  /** Formats a clock dial hour announcement. */
  hourOption?: (value: number, total: number) => string;
  /** Formats a clock dial minute announcement. */
  minuteOption?: (value: number, total: number) => string;
};

export type QTimeInputProps = Pick<
  QInputProps,
  | "aria-describedby"
  | "aria-label"
  | "class"
  | "dense"
  | "error"
  | "errorMessage"
  | "filled"
  | "hint"
  | "id"
  | "label"
  | "outlined"
  | "rounded"
  | "style"
  | "tabindex"
>;

export interface QTimeProps extends OptionalModel<QTimeValue>, Disableable, QTimeInputProps {
  /**
   * Picker presentation. Adaptive uses docked at the shared sm breakpoint and a modal below it.
   */
  variant?: QTimeVariant;

  /** Whether the picker overlay is open. This property is bindable. */
  open?: boolean;

  /** Validation message for the bound value. This property is bindable. */
  validationMessage?: string;

  /** BCP 47 locale for time formatting and the hour cycle. Defaults to Quaff.init() locale. */
  locale?: string;

  /** Uses a 24-hour clock. By default, the hour cycle is derived from the locale. */
  format24h?: boolean;

  /** Preferred opening mode. The dial falls back to input when it cannot fit. */
  defaultMode?: QTimeDisplayMode;

  /** Shows the modal dial/text-input toggle when the dial fits. */
  showModeToggle?: boolean;

  /** Prevents the picker from opening. */
  readonly?: boolean;

  /** Supporting title above the modal picker. */
  title?: string;

  /** Supporting title above the modal text-input picker. */
  inputTitle?: string;

  /** Confirmation action label. */
  confirmLabel?: string;

  /** Cancellation action label. */
  cancelLabel?: string;

  /** Commits and closes after minute selection is completed. */
  autoApply?: boolean;

  /** Overrides the shared translations for accessible labels and validation messages. */
  labels?: Partial<QTimeLabels>;
}
