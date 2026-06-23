import type { QComponentDocs } from "$docs";
import {
  QSeparatorVerticalDocsSnippets,
  QSeparatorVerticalDocsProps,
  QSeparatorVerticalDocsDomAttributesConstraint,
  QSeparatorVerticalDocsGenerics,
  QSeparatorHorizontalDocsProps,
  QSeparatorHorizontalDocsSnippets,
  QSeparatorHorizontalDocsDomAttributesConstraint,
  QSeparatorHorizontalDocsGenerics,
} from "./docs.props";

export const QSeparatorVerticalDocs: QComponentDocs = {
  name: "QSeparator (Vertical)",
  description:
    "Separators can be used to create a dividing line or space between elements within a layout, offering visual separation and organization.",
  docs: {
    generics: QSeparatorVerticalDocsGenerics,
    domAttributesConstraint: QSeparatorVerticalDocsDomAttributesConstraint,
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
    generics: QSeparatorHorizontalDocsGenerics,
    domAttributesConstraint: QSeparatorHorizontalDocsDomAttributesConstraint,
    props: QSeparatorHorizontalDocsProps,
    snippets: QSeparatorHorizontalDocsSnippets,
    methods: [],
    events: [],
  },
};
