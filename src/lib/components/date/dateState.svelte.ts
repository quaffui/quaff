import { shouldReduceMotion } from "$utils";
import {
  addCalendarMonths,
  compareCalendarDates,
  formatDateValue,
  getDateInputMask,
  getLocaleFirstDayOfWeek,
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

export default class QDateState {
  private source!: QDateStateSource;
  private synchronizedExternalValue: QDateValue = null;
  private synchronizedMask = "";

  today = $state<QCalendarDate>(fallbackCalendarDate);
  displayMode = $state<QDateDisplayMode>("calendar");
  calendarView = $state<QDateCalendarView>("calendar");
  draftDate = $state<QCalendarDate | null>(null);
  displayedMonth = $state(startOfMonth(fallbackCalendarDate));
  focusedDate = $state<QCalendarDate | null>(null);
  focusedYear = $state(fallbackCalendarDate.year);
  focusedMonth = $state(fallbackCalendarDate.month);
  draftInput = $state("");
  inputValidationMessage = $state("");
  monthMotionDirection = $state<1 | -1>(1);
  animatePickerChanges = $state(false);
  isRtl = $state(false);

  resolvedLabels = $derived({ ...defaultDateLabels, ...this.source.labels() });
  constraints = $derived(
    getDateConstraints(
      this.source.min(),
      this.source.max(),
      this.source.yearRange(),
      this.source.disabledDates()
    )
  );
  committedDate = $derived(parseDateValue(this.source.value(), this.source.mask()));
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
  fieldDisplayValue = $derived(this.formatters.display(this.committedDate));
  headline = $derived(
    this.draftDate
      ? this.formatters.headline(this.draftDate)
      : this.displayMode === "input"
        ? this.source.inputTitle()
        : this.resolvedLabels.selectedDate
  );
  monthYearLabel = $derived(this.formatters.monthYear(this.displayedMonth));
  monthLabel = $derived(this.formatters.month(this.displayedMonth, "short"));
  canNavigatePrevious = $derived(this.canNavigateMonth(-1));
  canNavigateNext = $derived(this.canNavigateMonth(1));
  canNavigatePreviousYear = $derived(this.canNavigateYear(-1));
  canNavigateNextYear = $derived(this.canNavigateYear(1));
  canConfirm = $derived(!!this.draftDate && this.isSelectable(this.draftDate));
  triggerLabel = $derived(
    this.committedDate
      ? `${this.resolvedLabels.changeDate}, ${this.formatters.spoken(this.committedDate)}`
      : this.resolvedLabels.chooseDate
  );
  showActions = $derived(!this.source.autoApply());
  valueValidationMessage = $derived.by(() => {
    const value = this.source.value();

    if (!value) {
      return "";
    }

    const date = parseDateValue(value, this.source.mask());

    return !date
      ? this.resolvedLabels.invalidDate
      : this.isSelectable(date)
        ? ""
        : this.resolvedLabels.unavailableDate;
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
    this.inputValidationMessage = "";
    this.synchronizedExternalValue = this.source.value();
    this.synchronizedMask = this.source.mask();

    const initialDate = this.initialDate;
    this.draftDate =
      this.committedDate && this.isSelectable(this.committedDate) ? this.committedDate : null;
    this.focusedDate = initialDate;
    this.displayedMonth = startOfMonth(
      initialDate ?? clampCalendarDate(this.committedDate ?? this.today, this.constraints)
    );
    this.focusedYear = this.displayedMonth.year;
    this.focusedMonth = this.displayedMonth.month;
    this.draftInput = formatDateValue(this.draftDate, this.dateInputMask);
  }

  synchronizeExternalValue(currentValue: QDateValue) {
    const currentMask = this.source.mask();

    if (currentValue === this.synchronizedExternalValue && currentMask === this.synchronizedMask) {
      return;
    }

    this.synchronizedExternalValue = currentValue;
    this.synchronizedMask = currentMask;
    const parsed = parseDateValue(currentValue, currentMask);

    if (!parsed || !this.isSelectable(parsed)) {
      this.draftDate = null;
      this.draftInput = parsed ? formatDateValue(parsed, this.dateInputMask) : (currentValue ?? "");
      this.inputValidationMessage = parsed
        ? this.resolvedLabels.unavailableDate
        : currentValue
          ? this.resolvedLabels.invalidDate
          : "";
      return;
    }

    this.setDraft(parsed);
  }

  reconcileOpenSession() {
    if (!this.constraints.valid) {
      this.draftDate = null;
      this.focusedDate = null;
      this.calendarView = "calendar";
      this.inputValidationMessage = this.source.value() ? this.resolvedLabels.unavailableDate : "";
      return;
    }

    if (this.draftDate && !this.isSelectable(this.draftDate)) {
      this.draftDate = null;
      this.inputValidationMessage = this.resolvedLabels.unavailableDate;
    } else if (this.draftDate) {
      this.draftInput = formatDateValue(this.draftDate, this.dateInputMask);
      this.inputValidationMessage = "";
    } else if (
      this.inputValidationMessage === this.resolvedLabels.unavailableDate &&
      this.committedDate &&
      this.isSelectable(this.committedDate)
    ) {
      this.setDraft(this.committedDate, false);
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
    this.setDraft(date, changedMonth);

    if (this.source.autoApply()) {
      this.commitSelection();
      return false;
    }

    return changedMonth;
  }

  commitSelection() {
    if (!this.draftDate || !this.isSelectable(this.draftDate)) {
      return;
    }

    const nextValue = formatDateValue(this.draftDate, this.source.mask());
    this.synchronizedExternalValue = nextValue;
    this.synchronizedMask = this.source.mask();
    this.source.commit(nextValue);
  }

  updateDraftInput(input: string) {
    this.draftInput = input;
    const parsed = parseDateValue(input, this.dateInputMask);

    if (!parsed) {
      this.draftDate = null;
      this.inputValidationMessage =
        input.replaceAll(/\D/g, "").length >= 8 ? this.resolvedLabels.invalidDate : "";
      return;
    }

    if (!this.isSelectable(parsed)) {
      this.draftDate = null;
      this.inputValidationMessage = this.resolvedLabels.unavailableDate;
      return;
    }

    this.setDraft(parsed);
  }

  validateDraftInput() {
    if (this.draftDate) {
      this.draftInput = formatDateValue(this.draftDate, this.dateInputMask);
    } else if (this.draftInput && !this.inputValidationMessage) {
      this.inputValidationMessage = this.resolvedLabels.invalidDate;
    }
  }

  submitDraftInput() {
    this.validateDraftInput();

    if (this.source.autoApply() && this.draftDate) {
      this.commitSelection();
    }
  }

  toggleDisplayMode() {
    this.calendarView = "calendar";

    if (this.displayMode === "calendar") {
      this.displayMode = "input";
      this.draftInput = formatDateValue(this.draftDate, this.dateInputMask);
      this.inputValidationMessage = "";
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

  private setDraft(date: QCalendarDate, updateMonth = true) {
    this.draftDate = date;
    this.focusedDate = date;
    this.draftInput = formatDateValue(date, this.dateInputMask);
    this.inputValidationMessage = "";

    if (updateMonth) {
      this.setDisplayedMonth(startOfMonth(date), date.day);
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
