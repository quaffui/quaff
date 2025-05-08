import type { QComponentDocs } from "$utils";
import {
  QSeparatorVerticalDocsSnippets,
  QSeparatorVerticalDocsProps,
  QSeparatorHorizontalDocsProps,
  QSeparatorHorizontalDocsSnippets,
} from "./docs.props";

export const QSeparatorVerticalDocs: QComponentDocs = {
  name: "QSeparator (Vertical)",
  description:
    "Separators can be used to create a dividing line or space between elements within a layout, offering visual separation and organization.",
  docs: {
    props: QSeparatorVerticalDocsProps,
    snippets: QSeparatorVerticalDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QSeparatorHorizontalDocs: QComponentDocs = {
  name: "QSeparator",
  description:
    "Separators can be used to create a dividing line or space between elements within a layout, offering visual separation and organization.",
  docs: {
    props: QSeparatorHorizontalDocsProps,
    snippets: QSeparatorHorizontalDocsSnippets,
    methods: [],
    events: [],
  },
};
