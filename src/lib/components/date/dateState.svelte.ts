import { shouldReduceMotion } from "$utils";
import {
  addCalendarMonths,
  compareCalendarDates,
  formatDateValue,
  getDateInputMask,
  getLocaleFirstDayOfWeek,
  isSameCalendarDate,
  parseDateValue,
  startOfMonth,
  type QCalendarDate,
} from "./date";
import {
  buildCalendarPage,
  clampCalendarDate,
  createDateFormatters,
  fallbackCalendarDate,
  findSelectableDateInMonth,
  getAvailableMonthInYear,
  getDateConstraints,
  getDateRangeValidation,
  getFocusableDateInMonth,
  getInitialDate,
  getLocalToday,
  getMonthOptions,
  getSelectableYears,
  isMonthWithinRange,
  isSelectableDate,
  type QDateCalendarView,
  type QDateStateSource,
} from "./calendar";
import { defaultDateLabels, type QDateDisplayMode, type QDateValue } from "./props";

export type { QDateCalendarView, QDateStateSource } from "./calendar";

type DatePart = "start" | "end";
type DateValidationKey = "invalidDate" | "unavailableDate" | null;

export default class QDateState {
  private source!: QDateStateSource;
  private synchronizedValueKey = "";
  private inputValidationKey = $state<DateValidationKey>(null);
  private endInputValidationKey = $state<DateValidationKey>(null);
  private unavailableStartDate: QCalendarDate | null = null;
  private unavailableEndDate: QCalendarDate | null = null;
  private rejectedRange = $state(false);

  today = $state<QCalendarDate>(fallbackCalendarDate);
  displayMode = $state<QDateDisplayMode>("calendar");
  calendarView = $state<QDateCalendarView>("calendar");
  draftDate = $state<QCalendarDate | null>(null);
  draftEndDate = $state<QCalendarDate | null>(null);
  displayedMonth = $state(startOfMonth(fallbackCalendarDate));
  focusedDate = $state<QCalendarDate | null>(null);
  focusedYear = $state(fallbackCalendarDate.year);
  focusedMonth = $state(fallbackCalendarDate.month);
  draftInput = $state("");
  draftEndInput = $state("");
  monthMotionDirection = $state<1 | -1>(1);
  animatePickerChanges = $state(false);
  isRtl = $state(false);

  range = $derived(this.source.range());
  resolvedLabels = $derived({ ...defaultDateLabels, ...this.source.labels() });
  inputValidationMessage = $derived(
    this.inputValidationKey ? this.resolvedLabels[this.inputValidationKey] : ""
  );
  endInputValidationMessage = $derived(
    this.endInputValidationKey ? this.resolvedLabels[this.endInputValidationKey] : ""
  );
  constraints = $derived(
    getDateConstraints(
      this.source.min(),
      this.source.max(),
      this.source.yearRange(),
      this.source.disabledDates()
    )
  );
  private modelParts = $derived(this.getModelParts(this.source.value()));
  committedDate = $derived(parseDateValue(this.modelParts.start, this.source.mask()));
  committedEndDate = $derived(parseDateValue(this.modelParts.end, this.source.mask()));
  private rangeValidationKey = $derived(
    this.range && this.draftDate && this.draftEndDate
      ? getDateRangeValidation(this.draftDate, this.draftEndDate, this.constraints)
      : null
  );
  rangeValidationMessage = $derived.by(() => {
    if (!this.range) {
      return "";
    }

    if (this.rejectedRange) {
      return this.resolvedLabels.unavailableRange;
    }

    return this.rangeValidationKey ? this.resolvedLabels[this.rangeValidationKey] : "";
  });
  initialDate = $derived(getInitialDate(this.committedDate, this.today, this.constraints));
  resolvedFirstDayOfWeek = $derived(
    this.source.firstDayOfWeek() ?? getLocaleFirstDayOfWeek(this.source.locale())
  );
  dateInputMask = $derived(getDateInputMask(this.source.locale()));
  dateFieldMask = $derived(this.dateInputMask.replace("YYYY", "####").replace(/MM|DD/g, "##"));
  formatters = $derived(createDateFormatters(this.source.locale()));
  weekdayLabels = $derived(this.formatters.weekdays(this.resolvedFirstDayOfWeek));
  calendarPage = $derived(
    buildCalendarPage(
      this.displayedMonth,
      this.resolvedFirstDayOfWeek,
      this.source.docked(),
      this.today,
      this.constraints,
      this.formatters
    )
  );
  selectableYears = $derived(getSelectableYears(this.constraints));
  monthOptions = $derived(
    getMonthOptions(this.displayedMonth.year, this.constraints, this.formatters)
  );
  fieldDisplayValue = $derived(
    this.range && this.committedDate && this.committedEndDate
      ? `${this.formatters.display(this.committedDate)} – ${this.formatters.display(this.committedEndDate)}`
      : this.formatters.display(this.committedDate)
  );
  headline = $derived.by(() => {
    if (!this.draftDate) {
      if (this.displayMode === "input") {
        return this.source.inputTitle();
      }

      return this.range ? this.resolvedLabels.selectedRange : this.resolvedLabels.selectedDate;
    }

    if (!this.range) {
      return this.formatters.headline(this.draftDate);
    }

    const start = this.formatters.rangeHeadline(this.draftDate);
    const end = this.draftEndDate
      ? this.formatters.rangeHeadline(this.draftEndDate)
      : this.resolvedLabels.endDate;
    return `${start} – ${end}`;
  });
  monthYearLabel = $derived(this.formatters.monthYear(this.displayedMonth));
  monthLabel = $derived(this.formatters.month(this.displayedMonth, "short"));
  canNavigatePrevious = $derived(this.canNavigateMonth(-1));
  canNavigateNext = $derived(this.canNavigateMonth(1));
  canNavigatePreviousYear = $derived(this.canNavigateYear(-1));
  canNavigateNextYear = $derived(this.canNavigateYear(1));
  canConfirm = $derived(
    !!this.draftDate &&
      this.isSelectable(this.draftDate) &&
      (!this.range || (!!this.draftEndDate && !this.rangeValidationKey))
  );
  triggerLabel = $derived.by(() => {
    if (this.range) {
      if (!this.committedDate || !this.committedEndDate) {
        return this.resolvedLabels.chooseRange;
      }

      return `${this.resolvedLabels.changeRange}, ${this.formatters.spoken(this.committedDate)} – ${this.formatters.spoken(this.committedEndDate)}`;
    }

    return this.committedDate
      ? `${this.resolvedLabels.changeDate}, ${this.formatters.spoken(this.committedDate)}`
      : this.resolvedLabels.chooseDate;
  });
  showActions = $derived(!this.source.autoApply());
  valueValidationMessage = $derived.by(() => {
    const value = this.source.value();

    if (!value) {
      return "";
    }

    const date = this.committedDate;

    if (this.range && date && this.committedEndDate) {
      const error = getDateRangeValidation(date, this.committedEndDate, this.constraints);
      return error ? this.resolvedLabels[error] : "";
    }

    if (!date || this.range) {
      return this.resolvedLabels.invalidDate;
    }

    return this.isSelectable(date) ? "" : this.resolvedLabels.unavailableDate;
  });

  constructor(source: QDateStateSource) {
    this.source = source;
  }

  beginSession(isRtl: boolean) {
    this.animatePickerChanges = false;
    this.today = getLocalToday();
    this.isRtl = isRtl;
    this.displayMode = this.source.docked() ? "calendar" : this.source.defaultMode();
    this.calendarView = "calendar";
    this.loadExternalValue(this.source.value());

    const initialDate = this.initialDate;
    this.focusedDate = initialDate;
    this.displayedMonth = startOfMonth(
      initialDate ?? clampCalendarDate(this.committedDate ?? this.today, this.constraints)
    );
    this.focusedYear = this.displayedMonth.year;
    this.focusedMonth = this.displayedMonth.month;
  }

  synchronizeExternalValue(currentValue: QDateValue<boolean> | undefined) {
    const currentKey = this.valueKey(currentValue);

    if (currentKey === this.synchronizedValueKey) {
      return;
    }

    this.loadExternalValue(currentValue);

    if (this.draftDate) {
      this.setDisplayedMonth(startOfMonth(this.draftDate), this.draftDate.day);
    }
  }

  reconcileOpenSession() {
    this.rejectedRange = false;
    this.reconcileDraftPart("start");

    if (this.range) {
      this.reconcileDraftPart("end");
    }

    if (!this.constraints.valid) {
      this.focusedDate = null;
      this.calendarView = "calendar";
      return;
    }

    if (!isMonthWithinRange(this.displayedMonth, this.constraints)) {
      const fallback = this.draftDate ?? this.initialDate ?? this.constraints.min;
      this.setDisplayedMonth(startOfMonth(fallback));
    }

    if (!this.focusedDate || !this.isSelectable(this.focusedDate)) {
      this.focusedDate = getFocusableDateInMonth(
        this.displayedMonth,
        this.draftDate?.day ?? this.committedDate?.day ?? this.today.day,
        this.constraints
      );
    }

    this.focusedYear = Math.max(
      this.constraints.min.year,
      Math.min(this.constraints.max.year, this.displayedMonth.year)
    );
    this.focusedMonth = this.displayedMonth.month;
  }

  isSelectable(date: QCalendarDate) {
    return isSelectableDate(date, this.constraints);
  }

  isSelected(date: QCalendarDate) {
    if (isSameCalendarDate(date, this.draftDate)) {
      return true;
    }

    return (
      this.range &&
      !!this.draftDate &&
      !!this.draftEndDate &&
      !this.rangeValidationKey &&
      compareCalendarDates(date, this.draftDate) >= 0 &&
      compareCalendarDates(date, this.draftEndDate) <= 0
    );
  }

  isRangeStart(date: QCalendarDate) {
    return this.range && isSameCalendarDate(date, this.draftDate);
  }

  isRangeEnd(date: QCalendarDate) {
    return this.range && this.canConfirm && isSameCalendarDate(date, this.draftEndDate);
  }

  dayLabel(date: QCalendarDate, fallbackLabel: string) {
    const labels = [fallbackLabel];

    if (this.isRangeStart(date)) {
      labels.push(this.resolvedLabels.startDate);
    }

    if (this.isRangeEnd(date)) {
      labels.push(this.resolvedLabels.endDate);
    }

    return labels.join(", ");
  }

  canNavigateMonth(offset: number) {
    return isMonthWithinRange(
      startOfMonth(addCalendarMonths(this.displayedMonth, offset)),
      this.constraints
    );
  }

  canNavigateYear(offset: number) {
    const year = this.displayedMonth.year + offset;
    return year >= this.constraints.min.year && year <= this.constraints.max.year;
  }

  changeMonth(offset: number) {
    if (this.canNavigateMonth(offset)) {
      this.setDisplayedMonth(startOfMonth(addCalendarMonths(this.displayedMonth, offset)));
    }
  }

  changeYear(offset: number) {
    if (this.canNavigateYear(offset)) {
      this.setDisplayedMonth(
        getAvailableMonthInYear(
          this.displayedMonth.year + offset,
          this.displayedMonth.month,
          this.constraints
        )
      );
    }
  }

  chooseYear(year: number) {
    this.setDisplayedMonth(
      getAvailableMonthInYear(year, this.displayedMonth.month, this.constraints)
    );
    this.calendarView = "calendar";
  }

  chooseMonth(month: QCalendarDate) {
    if (!isMonthWithinRange(month, this.constraints)) {
      return false;
    }

    this.setDisplayedMonth(month);
    this.calendarView = "calendar";
    return true;
  }

  toggleCalendarView(view: Exclude<QDateCalendarView, "calendar">) {
    this.calendarView = this.calendarView === view ? "calendar" : view;
    this.focusedYear = this.displayedMonth.year;
    this.focusedMonth = this.displayedMonth.month;
    return this.calendarView;
  }

  selectDate(date: QCalendarDate) {
    if (!this.isSelectable(date)) {
      return false;
    }

    const changedMonth =
      this.source.docked() &&
      (date.month !== this.displayedMonth.month || date.year !== this.displayedMonth.year);
    this.rejectedRange = false;

    if (
      this.range &&
      this.draftDate &&
      !this.draftEndDate &&
      compareCalendarDates(date, this.draftDate) >= 0
    ) {
      if (getDateRangeValidation(this.draftDate, date, this.constraints)) {
        this.rejectedRange = true;
        this.focusedDate = date;

        if (changedMonth) {
          this.setDisplayedMonth(startOfMonth(date), date.day);
        }

        return changedMonth;
      }

      this.setDraft(date, changedMonth, "end");
    } else {
      this.setDraft(date, changedMonth);
      this.setDraftPart("end", null, "", null);
    }

    if (this.source.autoApply() && this.canConfirm) {
      this.commitSelection();
      return false;
    }

    return changedMonth;
  }

  commitSelection() {
    if (!this.canConfirm) {
      return;
    }

    const start = formatDateValue(this.draftDate, this.source.mask());
    const nextValue = this.range
      ? { start, end: formatDateValue(this.draftEndDate, this.source.mask()) }
      : start;
    this.synchronizedValueKey = this.valueKey(nextValue);
    this.source.commit(nextValue);
  }

  updateDraftInput(input: string, part: DatePart = "start") {
    this.rejectedRange = false;
    const parsed = parseDateValue(input, this.dateInputMask);

    if (!parsed) {
      const error = input.replaceAll(/\D/g, "").length >= 8 ? "invalidDate" : null;
      this.setDraftPart(part, null, input, error);
      return;
    }

    if (!this.isSelectable(parsed)) {
      this.setDraftPart(part, parsed, input, "unavailableDate");
      return;
    }

    this.setDraft(parsed, true, part);
  }

  validateDraftInput(part: DatePart = "start") {
    const { date, input, error } = this.getDraftPart(part);

    if (date) {
      this.setDraftPart(part, date, formatDateValue(date, this.dateInputMask), null);
    } else if (input && !error) {
      this.setDraftPart(part, null, input, "invalidDate");
    }
  }

  submitDraftInput(part: DatePart = "start") {
    this.validateDraftInput(part);

    if (this.source.autoApply() && this.canConfirm) {
      this.commitSelection();
    }
  }

  toggleDisplayMode() {
    this.calendarView = "calendar";

    if (this.displayMode === "calendar") {
      this.displayMode = "input";
      this.draftInput = formatDateValue(this.draftDate, this.dateInputMask);
      this.draftEndInput = formatDateValue(this.draftEndDate, this.dateInputMask);
      this.inputValidationKey = null;
      this.endInputValidationKey = null;
      this.rejectedRange = false;
    } else {
      this.displayMode = "calendar";
      this.displayedMonth = startOfMonth(this.draftDate ?? this.focusedDate ?? this.today);
      this.focusedDate = this.draftDate ?? this.focusedDate ?? this.initialDate;
    }

    return this.displayMode;
  }

  moveFocusedDate(target: QCalendarDate, direction: 1 | -1) {
    const nextDate = findSelectableDateInMonth(target, direction, this.constraints);

    if (!nextDate) {
      return null;
    }

    this.setDisplayedMonth(startOfMonth(nextDate), nextDate.day);
    return nextDate;
  }

  pickerMotionDuration(duration: number) {
    return this.animatePickerChanges && typeof window !== "undefined" && !shouldReduceMotion()
      ? duration
      : 0;
  }

  private setDraft(date: QCalendarDate, updateMonth = true, part: DatePart = "start") {
    this.setDraftPart(part, date, formatDateValue(date, this.dateInputMask), null);
    this.focusedDate = date;

    if (updateMonth) {
      this.setDisplayedMonth(startOfMonth(date), date.day);
    }
  }

  private getDraftPart(part: DatePart) {
    return part === "start"
      ? {
          date: this.draftDate,
          input: this.draftInput,
          error: this.inputValidationKey,
          unavailable: this.unavailableStartDate,
        }
      : {
          date: this.draftEndDate,
          input: this.draftEndInput,
          error: this.endInputValidationKey,
          unavailable: this.unavailableEndDate,
        };
  }

  private setDraftPart(
    part: DatePart,
    date: QCalendarDate | null,
    input: string,
    error: DateValidationKey
  ) {
    const unavailable = error === "unavailableDate";

    if (part === "start") {
      this.draftDate = unavailable ? null : date;
      this.draftInput = input;
      this.inputValidationKey = error;
      this.unavailableStartDate = unavailable ? date : null;
    } else {
      this.draftEndDate = unavailable ? null : date;
      this.draftEndInput = input;
      this.endInputValidationKey = error;
      this.unavailableEndDate = unavailable ? date : null;
    }
  }

  private reconcileDraftPart(part: DatePart) {
    const { date, unavailable } = this.getDraftPart(part);
    const parsed = date ?? unavailable;

    if (parsed) {
      const selectable = this.isSelectable(parsed);
      this.setDraftPart(
        part,
        parsed,
        formatDateValue(parsed, this.dateInputMask),
        selectable ? null : "unavailableDate"
      );
    }
  }

  private getModelParts(value: QDateValue<boolean> | undefined) {
    if (this.range) {
      return value && typeof value === "object"
        ? { start: value.start, end: value.end }
        : { start: "", end: "" };
    }

    return { start: typeof value === "string" ? value : "", end: "" };
  }

  private valueKey(value: QDateValue<boolean> | undefined) {
    const { start, end } = this.getModelParts(value);
    return JSON.stringify([this.range, this.source.mask(), start, end]);
  }

  private loadExternalValue(value: QDateValue<boolean> | undefined) {
    this.synchronizedValueKey = this.valueKey(value);
    this.rejectedRange = false;
    const parts = this.getModelParts(value);

    for (const part of ["start", "end"] as const) {
      const raw = parts[part];
      const parsed = parseDateValue(raw, this.source.mask());
      const selectable = parsed && this.isSelectable(parsed);
      let error: DateValidationKey = null;

      if (raw && !parsed) {
        error = "invalidDate";
      } else if (parsed && !selectable) {
        error = "unavailableDate";
      }

      this.setDraftPart(
        part,
        parsed,
        parsed ? formatDateValue(parsed, this.dateInputMask) : raw,
        error
      );
    }
  }

  private setDisplayedMonth(month: QCalendarDate, preferredDay?: number) {
    this.monthMotionDirection = compareCalendarDates(month, this.displayedMonth) >= 0 ? 1 : -1;
    this.displayedMonth = startOfMonth(month);
    this.focusedMonth = month.month;
    this.focusedYear = month.year;
    this.focusedDate = getFocusableDateInMonth(
      month,
      preferredDay ?? this.focusedDate?.day ?? this.draftDate?.day ?? 1,
      this.constraints
    );
  }
}
