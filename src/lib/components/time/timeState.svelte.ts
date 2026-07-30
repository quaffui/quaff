import { shouldReduceMotion } from "$utils";
import {
  createTimeFormatters,
  fallbackTime,
  formatTimeHour,
  formatTimeMinute,
  formatTimeValue,
  getLocaleUses24Hour,
  getLocalTime,
  parseTimeHourInput,
  parseTimeInput,
  parseTimeMinuteInput,
  parseTimeValue,
  to12Hour,
  type QTime,
} from "./time";
import {
  defaultTimeLabels,
  type QTimeDisplayMode,
  type QTimeLabels,
  type QTimePeriod,
  type QTimeValue,
} from "./props";

export type QTimeActivePart = "hour" | "minute";

export interface QTimeStateSource {
  value: () => QTimeValue;
  locale: () => string;
  format24h: () => boolean | undefined;
  labels: () => Partial<QTimeLabels> | undefined;
  defaultMode: () => QTimeDisplayMode;
  docked: () => boolean;
  autoApply: () => boolean;
  commit: (value: string) => void;
}

export default class QTimeState {
  private source!: QTimeStateSource;
  private synchronizedExternalValue: QTimeValue = null;
  private synchronizedFormat24h = false;

  displayMode = $state<QTimeDisplayMode>("dial");
  activePart = $state<QTimeActivePart>("hour");
  draftTime = $state<QTime>(fallbackTime);
  draftHourInput = $state("");
  draftMinuteInput = $state("");
  period = $state<QTimePeriod>("am");
  inputValidationMessage = $state("");
  hourInputTouched = $state(false);
  minuteInputTouched = $state(false);
  animatePickerChanges = $state(false);
  isRtl = $state(false);

  resolvedLabels = $derived({ ...defaultTimeLabels, ...this.source.labels() });
  format24h = $derived(this.source.format24h() ?? getLocaleUses24Hour(this.source.locale()));
  committedTime = $derived(parseTimeValue(this.source.value()));
  formatters = $derived(createTimeFormatters(this.source.locale(), this.format24h));
  inputTime = $derived(
    parseTimeInput(this.draftHourInput, this.draftMinuteInput, this.period, this.format24h)
  );
  hourInputValid = $derived(
    parseTimeHourInput(this.draftHourInput, this.format24h, this.period) !== null
  );
  minuteInputValid = $derived(parseTimeMinuteInput(this.draftMinuteInput) !== null);
  hourInputInvalid = $derived(
    !this.hourInputValid && (this.hourInputTouched || !!this.inputValidationMessage)
  );
  minuteInputInvalid = $derived(
    !this.minuteInputValid && (this.minuteInputTouched || !!this.inputValidationMessage)
  );
  fieldDisplayValue = $derived(this.formatters.display(this.committedTime));
  spokenTime = $derived(this.formatters.spoken(this.draftTime));
  displayHour = $derived(formatTimeHour(this.draftTime.hour, this.format24h));
  displayMinute = $derived(formatTimeMinute(this.draftTime.minute));
  canConfirm = $derived(this.displayMode === "dial" || this.inputTime !== null);
  showActions = $derived(!this.source.autoApply());
  triggerLabel = $derived(
    this.committedTime
      ? `${this.resolvedLabels.changeTime}, ${this.formatters.spoken(this.committedTime)}`
      : this.resolvedLabels.chooseTime
  );
  valueValidationMessage = $derived.by(() => {
    const value = this.source.value();
    return value && !parseTimeValue(value) ? this.resolvedLabels.invalidTime : "";
  });

  constructor(source: QTimeStateSource) {
    this.source = source;
  }

  beginSession(isRtl = false) {
    this.animatePickerChanges = false;
    this.isRtl = isRtl;
    this.displayMode = this.source.docked() ? "dial" : this.source.defaultMode();
    this.activePart = "hour";
    this.inputValidationMessage = "";
    this.hourInputTouched = false;
    this.minuteInputTouched = false;
    const sourceValue = this.source.value();
    this.synchronizedExternalValue = sourceValue;
    this.synchronizedFormat24h = this.format24h;

    const committedTime = this.committedTime;
    this.draftTime = committedTime ?? getLocalTime();

    if (committedTime || !sourceValue) {
      this.setDraftInputs(this.draftTime);
    } else {
      this.setInvalidExternalInput(sourceValue);
    }
  }

  synchronizeExternalValue(currentValue: QTimeValue) {
    if (
      currentValue === this.synchronizedExternalValue &&
      this.format24h === this.synchronizedFormat24h
    ) {
      return;
    }

    this.synchronizedExternalValue = currentValue;
    this.synchronizedFormat24h = this.format24h;
    const parsed = parseTimeValue(currentValue);

    if (parsed) {
      this.setDraft(parsed);
      return;
    }

    if (!currentValue) {
      this.draftTime = getLocalTime();
      this.setDraftInputs(this.draftTime);
      this.inputValidationMessage = "";
      return;
    }

    this.setInvalidExternalInput(currentValue);
  }

  reconcileOpenSession() {
    if (this.source.docked() && this.displayMode !== "dial") {
      this.displayMode = "dial";
    }

    if (this.format24h !== this.synchronizedFormat24h) {
      this.synchronizedFormat24h = this.format24h;
      this.setDraftInputs(this.draftTime);
    }
  }

  selectHour(hour24: number, advance = true) {
    if (!isHour(hour24)) {
      return false;
    }

    this.draftTime = { ...this.draftTime, hour: hour24 };
    this.period = to12Hour(hour24).period;
    this.draftHourInput = formatTimeHour(hour24, this.format24h);
    this.hourInputTouched = false;
    this.clearValidInputError();

    if (advance) {
      this.activePart = "minute";
    }

    return true;
  }

  selectMinute(minute: number, complete = true) {
    if (!isMinute(minute)) {
      return false;
    }

    this.draftTime = { ...this.draftTime, minute };
    this.draftMinuteInput = formatTimeMinute(minute);
    this.minuteInputTouched = false;
    this.activePart = "minute";
    this.clearValidInputError();

    if (complete && this.source.autoApply()) {
      this.commitSelection();
    }

    return true;
  }

  selectPeriod(period: QTimePeriod) {
    if (period === this.period) {
      return;
    }

    const hour = to12Hour(this.draftTime.hour).hour;
    this.period = period;
    this.selectHour((hour % 12) + (period === "pm" ? 12 : 0), false);
  }

  updateHourInput(input: string) {
    this.draftHourInput = input;
    this.hourInputTouched = true;
    const hour = parseTimeHourInput(input, this.format24h, this.period);

    if (hour !== null) {
      this.draftTime = { ...this.draftTime, hour };
      this.clearValidInputError();
    } else if (input.length === 2) {
      this.inputValidationMessage = this.resolvedLabels.invalidTime;
    }
  }

  updateMinuteInput(input: string) {
    this.draftMinuteInput = input;
    this.minuteInputTouched = true;
    const minute = parseTimeMinuteInput(input);

    if (minute !== null) {
      this.draftTime = { ...this.draftTime, minute };
      this.clearValidInputError();
    } else if (input.length === 2) {
      this.inputValidationMessage = this.resolvedLabels.invalidTime;
    }
  }

  validateDraftInput() {
    this.hourInputTouched = true;
    this.minuteInputTouched = true;

    if (!this.inputTime) {
      this.inputValidationMessage = this.resolvedLabels.invalidTime;
      return false;
    }

    this.setDraft(this.inputTime);
    return true;
  }

  submitDraftInput() {
    if (!this.validateDraftInput()) {
      return false;
    }

    if (this.source.autoApply()) {
      this.commitSelection();
    }

    return true;
  }

  toggleDisplayMode() {
    this.displayMode = this.displayMode === "dial" ? "input" : "dial";
    this.activePart = "hour";
    return this.displayMode;
  }

  commitSelection() {
    if (this.displayMode === "input" && !this.validateDraftInput()) {
      return false;
    }

    const nextValue = formatTimeValue(this.draftTime);
    this.synchronizedExternalValue = nextValue;
    this.source.commit(nextValue);
    return true;
  }

  pickerMotionDuration(duration: number) {
    return this.animatePickerChanges && typeof window !== "undefined" && !shouldReduceMotion()
      ? duration
      : 0;
  }

  private setDraft(time: QTime) {
    this.draftTime = time;
    this.setDraftInputs(time);
    this.inputValidationMessage = "";
    this.hourInputTouched = false;
    this.minuteInputTouched = false;
  }

  private setDraftInputs(time: QTime) {
    this.period = to12Hour(time.hour).period;
    this.draftHourInput = formatTimeHour(time.hour, this.format24h);
    this.draftMinuteInput = formatTimeMinute(time.minute);
  }

  private setInvalidExternalInput(value: string) {
    const separatorIndex = value.indexOf(":");
    this.draftHourInput = separatorIndex < 0 ? value : value.slice(0, separatorIndex);
    this.draftMinuteInput = separatorIndex < 0 ? "" : value.slice(separatorIndex + 1);
    this.inputValidationMessage = this.resolvedLabels.invalidTime;
    this.hourInputTouched = true;
    this.minuteInputTouched = true;
  }

  private clearValidInputError() {
    if (this.inputTime) {
      this.inputValidationMessage = "";
    }
  }
}

function isHour(hour: number) {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

function isMinute(minute: number) {
  return Number.isInteger(minute) && minute >= 0 && minute <= 59;
}
