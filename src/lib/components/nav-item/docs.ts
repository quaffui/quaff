import type { QComponentDocs } from "$docs";
import {
  QNavItemDocsProps,
  QNavItemDocsSnippets,
  QNavItemDocsDomAttributesConstraint,
  QNavItemDocsGenerics,
  QNavItemDocsTypeDependencies,
  QNavGroupDocsProps,
  QNavGroupDocsSnippets,
  QNavGroupDocsDomAttributesConstraint,
  QNavGroupDocsGenerics,
  QNavGroupDocsTypeDependencies,
} from "./docs.props";

export const QNavItemDocs: QComponentDocs = {
  name: "QNavItem",
  description: "Navigation destinations for drawers, navigation bars, and railbars.",
  docs: {
    generics: QNavItemDocsGenerics,
    domAttributesConstraint: QNavItemDocsDomAttributesConstraint,
    props: QNavItemDocsProps,
    snippets: QNavItemDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QNavItemDocsTypeDependencies,
  },
};

export const QNavGroupDocs: QComponentDocs = {
  name: "QNavGroup",
  description: "Collapsible groups of navigation destinations inside a drawer.",
  docs: {
    generics: QNavGroupDocsGenerics,
    domAttributesConstraint: QNavGroupDocsDomAttributesConstraint,
    props: QNavGroupDocsProps,
    snippets: QNavGroupDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QNavGroupDocsTypeDependencies,
  },
};
