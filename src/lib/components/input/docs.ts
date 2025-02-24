import type { QComponentDocs } from "$lib/utils";
import { QInputDocsProps, QInputDocsSnippets } from "./docs.props";

export const QInputDocs: QComponentDocs = {
  name: "QInput",
  description:
    "QInput is a form component that allows users to input text. It supports different visual styles such as filled, outlined, and rounded, and it can also display hint text and custom error messages.",
  docs: {
    props: QInputDocsProps,
    snippets: QInputDocsSnippets,
    methods: [],
    events: [
      {
        name: "input",
        type: "(value: string) => void",
        description: "Emitted when the user types in the input component.",
      },
    ],
  },
};
