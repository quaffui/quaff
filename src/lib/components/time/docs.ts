import type { QComponentDocs } from "$docs";
import {
  QTimeDocsDomAttributesConstraint,
  QTimeDocsGenerics,
  QTimeDocsProps,
  QTimeDocsSnippets,
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
    methods: [
      {
        name: "show",
        type: "() => void",
        description: "Opens the time picker when the field is interactive.",
      },
      {
        name: "hide",
        type: "() => void",
        description: "Closes the time picker without committing its draft selection.",
      },
      {
        name: "toggle",
        type: "() => void",
        description: "Toggles the time picker overlay.",
      },
    ],
    events: [],
    typeDependencies: QTimeDocsTypeDependencies,
  },
};
