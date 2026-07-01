import type { QComponentDocs } from "$docs";
import {
  QInputDocsProps,
  QInputDocsSnippets,
  QInputDocsDomAttributesConstraint,
  QInputDocsGenerics,
  QInputDocsTypeDependencies,
} from "./docs.props";

export const QInputDocs: QComponentDocs = {
  name: "QInput",
  description:
    "QInput is a form component that allows users to input text. It supports different visual styles such as filled, outlined, and rounded, and it can also display hint text and custom error messages.",
  docs: {
    generics: QInputDocsGenerics,
    domAttributesConstraint: QInputDocsDomAttributesConstraint,
    props: QInputDocsProps,
    snippets: QInputDocsSnippets,
    methods: [],
    events: [
      {
        name: "input",
        type: "InputEvent",
        description: "Native input event from the inner input element.",
      },
    ],
    typeDependencies: QInputDocsTypeDependencies,
  },
};
