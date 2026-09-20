import type { QDateLabels, QDateProps } from "$components/date/props.js";
import type { QSearchLabels } from "$components/search/props.js";
import type { QTimeLabels, QTimeProps } from "$components/time/props.js";

export interface QuaffTranslations {
  table: {
    label: string;
    recordsPerPage: string;
    previousPage: string;
    nextPage: string;
    pagination: (from: number, to: number, total: number) => string;
    sortBy: (label: string) => string;
    sortedBy: (label: string, isDescending: boolean) => string;
    unsorted: string;
  };
  date: QDateLabels &
    Required<
      Pick<QDateProps, "title" | "inputTitle" | "confirmLabel" | "cancelLabel" | "saveLabel">
    >;
  time: QTimeLabels &
    Required<Pick<QTimeProps, "title" | "inputTitle" | "confirmLabel" | "cancelLabel">>;
  select: { noOptionText: string };
  search: QSearchLabels & { placeholder: string };
}

export interface QuaffLanguage {
  locale: string;
  translations: QuaffTranslations;
}
