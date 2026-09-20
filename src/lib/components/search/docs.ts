import type { QComponentDocs } from "$docs";
import {
  QSearchDocsProps,
  QSearchDocsSnippets,
  QSearchDocsMethods,
  QSearchDocsDomAttributesConstraint,
  QSearchDocsGenerics,
  QSearchDocsTypeDependencies,
} from "./docs.props";

export const QSearchDocs: QComponentDocs = {
  name: "QSearch",
  description: "Search bars expand into a focused space for suggestions, filters, and results.",
  docs: {
    generics: QSearchDocsGenerics,
    domAttributesConstraint: QSearchDocsDomAttributesConstraint,
    props: QSearchDocsProps,
    snippets: QSearchDocsSnippets,
    methods: QSearchDocsMethods,
    events: [],
    typeDependencies: QSearchDocsTypeDependencies,
  },
};
