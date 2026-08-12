import type { QComponentDocs } from "$docs";
import {
  QDateDocsDomAttributesConstraint,
  QDateDocsGenerics,
  QDateDocsProps,
  QDateDocsSnippets,
  QDateDocsMethods,
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
    methods: QDateDocsMethods,
    events: [],
    typeDependencies: QDateDocsTypeDependencies,
  },
};
