import type { QComponentDocs } from "$docs";
import {
  QSplitBtnDocsDomAttributesConstraint,
  QSplitBtnDocsGenerics,
  QSplitBtnDocsProps,
  QSplitBtnDocsSnippets,
  QSplitBtnDocsTypeDependencies,
} from "./docs.props";

export const QSplitBtnDocs: QComponentDocs = {
  name: "QSplitBtn",
  description:
    "Combine a primary action with a menu of related actions using a Material 3 Expressive split button.",
  docs: {
    generics: QSplitBtnDocsGenerics,
    domAttributesConstraint: QSplitBtnDocsDomAttributesConstraint,
    props: QSplitBtnDocsProps,
    snippets: QSplitBtnDocsSnippets,
    methods: [],
    events: [
      {
        name: "click",
        type: "(event: MouseEvent) => void",
        description: "Called when the primary action is activated.",
      },
    ],
    typeDependencies: QSplitBtnDocsTypeDependencies,
  },
};
