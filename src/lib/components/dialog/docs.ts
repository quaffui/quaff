import type { QComponentDocs } from "$utils";
import {
  QDialogDocsProps,
  QDialogDocsSnippets,
  QDialogDocsDomAttributesConstraint,
  QDialogDocsGenerics,
} from "./docs.props";

export const QDialogDocs: QComponentDocs = {
  name: "QDialog",
  description: "Dialogs provide important prompts in a user flow.",
  docs: {
    generics: QDialogDocsGenerics,
    domAttributesConstraint: QDialogDocsDomAttributesConstraint,
    props: QDialogDocsProps,
    snippets: QDialogDocsSnippets,
    methods: [],
    events: [],
  },
};
