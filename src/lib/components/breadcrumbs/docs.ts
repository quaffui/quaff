import type { QComponentDocs } from "$docs";
import {
  QBreadcrumbsDocsProps,
  QBreadcrumbsDocsSnippets,
  QBreadcrumbsDocsGenerics,
  QBreadcrumbsDocsDomAttributesConstraint,
  QBreadcrumbsDocsTypeDependencies,
  QBreadcrumbsElDocsProps,
  QBreadcrumbsElDocsSnippets,
  QBreadcrumbsElDocsGenerics,
  QBreadcrumbsElDocsDomAttributesConstraint,
  QBreadcrumbsElDocsTypeDependencies,
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
    typeDependencies: QBreadcrumbsDocsTypeDependencies,
  },
};

export const QBreadcrumbsElDocs: QComponentDocs = {
  name: "QBreadcrumbsEl",
  description: "A single breadcrumb element to be used within a QBreadcrumbs container.",
  docs: {
    generics: QBreadcrumbsElDocsGenerics,
    domAttributesConstraint: QBreadcrumbsElDocsDomAttributesConstraint,
    props: QBreadcrumbsElDocsProps,
    snippets: QBreadcrumbsElDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QBreadcrumbsElDocsTypeDependencies,
  },
};
