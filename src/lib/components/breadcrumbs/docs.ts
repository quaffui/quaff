import type { QComponentDocs } from "$docs";
import {
  QBreadcrumbsDocsProps,
  QBreadcrumbsDocsSnippets,
  QBreadcrumbsDocsGenerics,
  QBreadcrumbsDocsDomAttributesConstraint,
} from "./docs.props";

export const QBreadcrumbsDocs: QComponentDocs = {
  name: "QBreadcrumbs",
  description:
    "Breadcrumbs are mostly used as a navigation aid. They allow users to keep track of their location within the page.",
  docs: {
    generics: QBreadcrumbsDocsGenerics,
    domAttributesConstraint: QBreadcrumbsDocsDomAttributesConstraint,
    props: QBreadcrumbsDocsProps,
    snippets: QBreadcrumbsDocsSnippets,
    methods: [],
    events: [],
  },
};
