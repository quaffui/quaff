import type { QComponentDocs } from "$docs";
import {
  QSnackbarDocsProps,
  QSnackbarDocsSnippets,
  QSnackbarDocsMethods,
  QSnackbarDocsDomAttributesConstraint,
  QSnackbarDocsGenerics,
  QSnackbarDocsTypeDependencies,
} from "./docs.props";

export const QSnackbarDocs: QComponentDocs = {
  name: "QSnackbar",
  description: "Snackbars briefly show updates without interrupting the user.",
  docs: {
    generics: QSnackbarDocsGenerics,
    domAttributesConstraint: QSnackbarDocsDomAttributesConstraint,
    props: QSnackbarDocsProps,
    snippets: QSnackbarDocsSnippets,
    methods: QSnackbarDocsMethods,
    events: [],
    typeDependencies: QSnackbarDocsTypeDependencies,
  },
};
