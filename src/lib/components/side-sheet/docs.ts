import type { QComponentDocs } from "$docs";
import {
  QSideSheetDocsProps,
  QSideSheetDocsSnippets,
  QSideSheetDocsMethods,
  QSideSheetDocsDomAttributesConstraint,
  QSideSheetDocsGenerics,
  QSideSheetDocsTypeDependencies,
} from "./docs.props";

export const QSideSheetDocs: QComponentDocs = {
  name: "QSideSheet",
  description: "Side sheets show supporting content beside the main page.",
  docs: {
    generics: QSideSheetDocsGenerics,
    domAttributesConstraint: QSideSheetDocsDomAttributesConstraint,
    props: QSideSheetDocsProps,
    snippets: QSideSheetDocsSnippets,
    methods: QSideSheetDocsMethods,
    events: [],
    typeDependencies: QSideSheetDocsTypeDependencies,
  },
};
