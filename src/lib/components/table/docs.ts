import type { QComponentDocs } from "$utils";
import {
  QTableDocsProps,
  QTableDocsSnippets,
  QTableDocsDomAttributesConstraint,
  QTableDocsGenerics,
} from "./docs.props";

export const QTableDocs: QComponentDocs = {
  name: "QTable",
  description: "Tables allow for a clear presentation of data sets.",
  docs: {
    generics: QTableDocsGenerics,
    domAttributesConstraint: QTableDocsDomAttributesConstraint,
    props: QTableDocsProps,
    snippets: QTableDocsSnippets,
    methods: [],
    events: [],
  },
};
