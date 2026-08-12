import type { QComponentDocs } from "$docs";
import {
  QMenuDocsProps,
  QMenuDocsSnippets,
  QMenuDocsMethods,
  QMenuDocsDomAttributesConstraint,
  QMenuDocsGenerics,
  QMenuDocsTypeDependencies,
} from "./docs.props";

export const QMenuDocs: QComponentDocs = {
  name: "QMenu",
  description:
    "QMenu displays anchored popup content. It handles positioning, outside-click dismissal, Escape dismissal, and native dialog layering.",
  docs: {
    generics: QMenuDocsGenerics,
    domAttributesConstraint: QMenuDocsDomAttributesConstraint,
    props: QMenuDocsProps,
    snippets: QMenuDocsSnippets,
    methods: QMenuDocsMethods,
    events: [],
    typeDependencies: QMenuDocsTypeDependencies,
  },
};
