import type { QComponentDocs } from "$docs";
import {
  QDrawerDocsProps,
  QDrawerDocsMethods,
  QDrawerDocsSnippets,
  QDrawerDocsDomAttributesConstraint,
  QDrawerDocsGenerics,
  QDrawerDocsTypeDependencies,
} from "./docs.props";

export const QDrawerDocs: QComponentDocs = {
  name: "QDrawer",
  description: "Navigation drawers provide ergonomic access to destinations in an app",
  docs: {
    generics: QDrawerDocsGenerics,
    domAttributesConstraint: QDrawerDocsDomAttributesConstraint,
    props: QDrawerDocsProps,
    snippets: QDrawerDocsSnippets,
    methods: QDrawerDocsMethods,
    events: [],
    typeDependencies: QDrawerDocsTypeDependencies,
  },
};
