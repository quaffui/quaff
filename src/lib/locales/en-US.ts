import { defaultDateLabels } from "$components/date/props.js";
import { defaultTimeLabels } from "$components/time/props.js";

import type { QuaffLanguage } from "./types.js";

const en = {
  locale: "en-US",
  translations: {
    table: {
      label: "Table",
      recordsPerPage: "Records per page",
      previousPage: "Previous page",
      nextPage: "Next page",
      pagination: (from: number, to: number, total: number) => `${from}-${to} of ${total}`,
      sortBy: (label: string) => `Sort by ${label}`,
      sortedBy: (label: string, isDescending: boolean) =>
        `Sorted by ${label}, ${isDescending ? "descending" : "ascending"}`,
      unsorted: "Unsorted",
    },
    date: {
      ...defaultDateLabels,
      title: "Select date",
      inputTitle: "Enter date",
      confirmLabel: "OK",
      cancelLabel: "Cancel",
      saveLabel: "Save",
    },
    time: {
      ...defaultTimeLabels,
      title: "Select time",
      inputTitle: "Enter time",
      confirmLabel: "OK",
      cancelLabel: "Cancel",
    },
    colorPicker: {
      chooseColor: "Choose color",
      colorField: "Color field",
      saturation: "Saturation",
      brightness: "Brightness",
      hue: "Hue",
      opacity: "Opacity",
      red: "Red",
      green: "Green",
      blue: "Blue",
      format: "Color format",
      apply: "Apply",
      cancel: "Cancel",
      invalidColor: "Enter a valid HEX or RGB color",
    },
    select: {
      noOptionText: "No options",
    },
    search: {
      placeholder: "Search",
      back: "Back",
      clear: "Clear search",
      results: "Search results",
      searching: "Searching",
    },
  },
} satisfies QuaffLanguage;

export default en;
