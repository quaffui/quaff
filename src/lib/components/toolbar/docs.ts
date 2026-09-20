import type { QComponentDocs } from "$docs";
import {
  QToolbarDocsProps,
  QToolbarDocsSnippets,
  QToolbarDocsDomAttributesConstraint,
  QToolbarDocsGenerics,
  QToolbarDocsTypeDependencies,
} from "./docs.props";

export const QToolbarDocs: QComponentDocs = {
  name: "QToolbar",
  description:
    "Keep frequently used actions close to your content with docked or floating toolbars.",
  docs: {
    generics: QToolbarDocsGenerics,
    domAttributesConstraint: QToolbarDocsDomAttributesConstraint,
    props: QToolbarDocsProps,
    snippets: QToolbarDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QToolbarDocsTypeDependencies,
  },
};
