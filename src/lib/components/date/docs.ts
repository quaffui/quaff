import type { QComponentDocs } from "$docs";
import {
  QDateDocsDomAttributesConstraint,
  QDateDocsGenerics,
  QDateDocsProps,
  QDateDocsSnippets,
  QDateDocsTypeDependencies,
} from "./docs.props";

export const QDateDocs: QComponentDocs = {
  name: "QDate",
  description:
    "QDate is a Material 3 component for selecting or entering dates. It supports modal, docked, and adaptive presentations, custom masks, localization, date constraints, and composition with QInput.",
  docs: {
    generics: QDateDocsGenerics,
    domAttributesConstraint: QDateDocsDomAttributesConstraint,
    props: QDateDocsProps,
    snippets: QDateDocsSnippets,
    methods: [
      {
        name: "show",
        type: "() => void",
        description: "Opens the date picker when the field is interactive.",
      },
      {
        name: "hide",
        type: "() => void",
        description: "Closes the date picker without committing its draft selection.",
      },
      {
        name: "toggle",
        type: "() => void",
        description: "Toggles the date picker overlay.",
      },
    ],
    events: [],
    typeDependencies: QDateDocsTypeDependencies,
  },
};
