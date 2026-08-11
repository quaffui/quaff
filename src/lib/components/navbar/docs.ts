import type { QComponentDocs } from "$docs";
import {
  QNavbarDocsProps,
  QNavbarDocsSnippets,
  QNavbarDocsDomAttributesConstraint,
  QNavbarDocsGenerics,
  QNavbarDocsTypeDependencies,
  QNavItemDocsProps,
  QNavItemDocsSnippets,
  QNavItemDocsDomAttributesConstraint,
  QNavItemDocsGenerics,
  QNavItemDocsTypeDependencies,
} from "./docs.props";

export const QNavbarDocs: QComponentDocs = {
  name: "QNavbar",
  description:
    "Navigation bars provide access to three to five primary destinations from the bottom of a layout.",
  docs: {
    generics: QNavbarDocsGenerics,
    domAttributesConstraint: QNavbarDocsDomAttributesConstraint,
    props: QNavbarDocsProps,
    snippets: QNavbarDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QNavbarDocsTypeDependencies,
  },
};

export const QNavItemDocs: QComponentDocs = {
  name: "QNavItem",
  description:
    "Navigation items represent destinations inside navigation bars and railbars, with optional badges.",
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
