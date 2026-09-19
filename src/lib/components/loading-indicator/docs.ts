import type { QComponentDocs } from "$docs";
import {
  QLoadingIndicatorDocsProps,
  QLoadingIndicatorDocsSnippets,
  QLoadingIndicatorDocsDomAttributesConstraint,
  QLoadingIndicatorDocsGenerics,
  QLoadingIndicatorDocsTypeDependencies,
} from "./docs.props";

export const QLoadingIndicatorDocs: QComponentDocs = {
  name: "QLoadingIndicator",
  description: "Show that content is loading during short waits with animated shapes.",
  docs: {
    generics: QLoadingIndicatorDocsGenerics,
    domAttributesConstraint: QLoadingIndicatorDocsDomAttributesConstraint,
    props: QLoadingIndicatorDocsProps,
    snippets: QLoadingIndicatorDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QLoadingIndicatorDocsTypeDependencies,
  },
};
