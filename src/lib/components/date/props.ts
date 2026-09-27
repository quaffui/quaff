import { Disableable, OptionalModel } from "$utils";
import type { QInputProps } from "$components/input/props";

export interface QDateRangeValue {
  start: string;
  end: string;
}

export type QDateValue<Range extends boolean = false> =
  (Range extends true ? QDateRangeValue : string) | null;
export type QDateWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type QDateDisplayMode = "calendar" | "input";
export type QDateVariant = "modal" | "docked" | "adaptive";
export type QDateDisabledDates = readonly string[] | ((date: string) => boolean);

export const defaultDateLabels = {
  chooseDate: "Choose date",
  changeDate: "Change date",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  previousYear: "Previous year",
  nextYear: "Next year",
  selectMonth: "Select month",
  selectYear: "Select year",
  switchToInput: "Switch to text input",
  switchToCalendar: "Switch to calendar input",
  calendar: "Calendar",
  yearSelection: "Choose a year",
  monthSelection: "Choose a month",
  closePicker: "Close date picker",
  selectedDate: "Selected date",
  dateInput: "Date",
  expectedFormat: "Expected format",
  invalidDate: "Enter a valid date",
  unavailableDate: "This date is unavailable",
  startDate: "Start date",
  endDate: "End date",
  selectedRange: "Selected range",
  invalidRange: "End date must be on or after start date",
  unavailableRange: "This range includes an unavailable date",
  chooseRange: "Choose date range",
  changeRange: "Change date range",
};
export type QDateLabels = { [Key in keyof typeof defaultDateLabels]: string };

export type QDateInputProps = Pick<
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

export interface QDateProps<Range extends boolean = false>
  extends OptionalModel<QDateValue<Range>>, Disableable, QDateInputProps {
  /**
   * Selects an inclusive date range. The bound value is { start, end }, with both dates using
   * the model mask. A range cannot include disabled dates.
   *
   * @default false
   */
  range?: Range;

  /**
   * Picker presentation. Adaptive uses docked at the shared sm breakpoint and a full-screen modal
   * below it.
   */
  variant?: QDateVariant;

  /** Whether the picker overlay is open. This property is bindable. */
  open?: boolean;

  /** Validation message for the bound value. This property is bindable. */
  validationMessage?: string;

  /**
   * Model format containing one each of YYYY, MM, and DD.
   *
   * @default "YYYY-MM-DD"
   */
  mask?: string;

  /** Earliest selectable date, inclusive, in YYYY-MM-DD format. */
  min?: string;

  /** Latest selectable date, inclusive, in YYYY-MM-DD format. */
  max?: string;

  /** Inclusive range of selectable years. */
  yearRange?: readonly [number, number];

  /** Dates to disable as YYYY-MM-DD values or a predicate. */
  disabledDates?: QDateDisabledDates;

  /** BCP 47 locale for date formatting and the first weekday. Defaults to Quaff.init() locale. */
  locale?: string;

  /** Overrides the locale's first weekday. Zero is Sunday. */
  firstDayOfWeek?: QDateWeekday;

  /** Mode shown when a modal picker opens. */
  defaultMode?: QDateDisplayMode;

  /** Shows the modal calendar/text-input toggle. */
  showModeToggle?: boolean;

  /** Prevents the picker from opening. */
  readonly?: boolean;

  /** Supporting title above the modal calendar. */
  title?: string;

  /** Empty headline in modal text-input mode. */
  inputTitle?: string;

  /** Modal confirmation action label. */
  confirmLabel?: string;

  /** Modal cancellation action label. */
  cancelLabel?: string;

  /** Full-screen save action label. */
  saveLabel?: string;

  /** Commits and closes after a date or a complete valid range is selected. */
  autoApply?: boolean;

  /** Overrides the shared translations for accessible labels and validation messages. */
  labels?: Partial<QDateLabels>;
}
