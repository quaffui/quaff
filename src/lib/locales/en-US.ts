import { defaultDateLabels } from "$components/date/props.js";
import { defaultTimeLabels } from "$components/time/props.js";

import type { QuaffLanguage } from "./types.js";

const en: QuaffLanguage = {
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
    select: {
      noOptionText: "No options",
    },
  },
};

export default en;
