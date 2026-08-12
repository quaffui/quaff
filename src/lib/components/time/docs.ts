import type { QComponentDocs } from "$docs";
import {
  QTimeDocsDomAttributesConstraint,
  QTimeDocsGenerics,
  QTimeDocsProps,
  QTimeDocsSnippets,
  QTimeDocsMethods,
  QTimeDocsTypeDependencies,
} from "./docs.props";

export const QTimeDocs: QComponentDocs = {
  name: "QTime",
  description:
    "QTime is a Material 3 component for selecting or entering a time. It supports dial and text-input modes, modal, docked, and adaptive presentations, 12- and 24-hour clocks, localization, validation, and composition with QInput.",
  docs: {
    generics: QTimeDocsGenerics,
    domAttributesConstraint: QTimeDocsDomAttributesConstraint,
    props: QTimeDocsProps,
    snippets: QTimeDocsSnippets,
    methods: QTimeDocsMethods,
    events: [],
    typeDependencies: QTimeDocsTypeDependencies,
  },
};
