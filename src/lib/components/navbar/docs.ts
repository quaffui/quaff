import type { QComponentDocs } from "$docs";
import {
  QNavbarDocsProps,
  QNavbarDocsSnippets,
  QNavbarDocsDomAttributesConstraint,
  QNavbarDocsGenerics,
  QNavbarDocsTypeDependencies,
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
