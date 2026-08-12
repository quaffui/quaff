import type { QComponentDocs } from "$docs";
import {
  QTableDocsProps,
  QTableDocsSnippets,
  QTableDocsMethods,
  QTableDocsDomAttributesConstraint,
  QTableDocsGenerics,
  QTableDocsTypeDependencies,
} from "./docs.props";

export const QTableDocs: QComponentDocs = {
  name: "QTable",
  description: "Tables allow for a clear presentation of data sets.",
  docs: {
    generics: QTableDocsGenerics,
    domAttributesConstraint: QTableDocsDomAttributesConstraint,
    props: QTableDocsProps,
    snippets: QTableDocsSnippets,
    methods: QTableDocsMethods,
    events: [],
    typeDependencies: QTableDocsTypeDependencies,
  },
};
