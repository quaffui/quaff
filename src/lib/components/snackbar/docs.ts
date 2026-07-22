import type { QComponentDocs } from "$docs";
import {
  QSnackbarDocsProps,
  QSnackbarDocsSnippets,
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
    methods: [
      {
        name: "show",
        description: "Shows the snackbar.",
        type: "() => void",
      },
      {
        name: "hide",
        description: "Hides the snackbar.",
        type: "(reason?: QSnackbarDismissReason) => void",
      },
      {
        name: "toggle",
        description: "Toggles the snackbar visibility.",
        type: "() => void",
      },
    ],
    events: [],
    typeDependencies: QSnackbarDocsTypeDependencies,
  },
};
