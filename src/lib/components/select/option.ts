import type { QSelectOption, QSelectValue } from "./props";

export function getOptionValue(option: QSelectOption): string | number;
export function getOptionValue(
  option: QSelectOption | null | undefined
): string | number | null | undefined;
export function getOptionValue(option: QSelectOption | null | undefined) {
  return typeof option === "object" && option !== null ? option.value : option;
}

export function doValuesMatch(
  a: QSelectOption | null | undefined,
  b: QSelectOption | null | undefined
) {
  return getOptionValue(a) === getOptionValue(b);
}

export function getOptionLabel(option: QSelectOption | null | undefined, options: QSelectOption[]) {
  if (option === undefined || option === null || option === "") {
    return "";
  }

  if (typeof option !== "string" && typeof option !== "number") {
    return option.label;
  }

  if (options.includes(option)) {
    return option;
  }

  const matchedOption = options.find((opt) => doValuesMatch(opt, option));
  return typeof matchedOption === "object" && matchedOption !== null ? matchedOption.label : "";
}

export function getDisplayValue(
  value: QSelectValue | undefined,
  options: QSelectOption[],
  multiple: boolean,
  displayValue?: string
) {
  if (displayValue !== undefined) {
    return displayValue;
  }

  if (!Array.isArray(value)) {
    return getOptionLabel(value, options);
  }

  if (!multiple) {
    return "";
  }

  return value.map((entry) => getOptionLabel(entry, options)).join(", ");
}

export function getInitialOptionIndex(
  options: QSelectOption[],
  isSelected: (option: QSelectOption) => boolean,
  direction = 1
) {
  if (!options.length) {
    return -1;
  }

  const selectedIndex = options.findIndex(isSelected);
  if (selectedIndex !== -1) {
    return selectedIndex;
  }

  return direction < 0 ? options.length - 1 : 0;
}

export function normalizeOptionIndex(optionIndex: number, optionCount: number) {
  if (!optionCount || optionIndex < 0) {
    return optionCount ? optionCount - 1 : -1;
  }

  return optionIndex % optionCount;
}

export function getNextValue(
  currentValue: QSelectValue | undefined,
  option: QSelectOption,
  multiple: boolean,
  emitValue: boolean
) {
  const optionValue = getOptionValue(option);

  if (!multiple) {
    return emitValue ? optionValue : option;
  }

  const entries = Array.isArray(currentValue) ? currentValue : [];
  const index = entries.findIndex((entry) => doValuesMatch(entry, optionValue));

  if (index !== -1) {
    return entries.filter((_, entryIndex) => entryIndex !== index);
  }

  return [...entries, emitValue ? optionValue : option];
}
