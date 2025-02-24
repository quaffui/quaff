import type { QComponentDocs } from "$lib/utils";
import { QSelectDocsProps, QSelectDocsSnippets } from "./docs.props";

export const QSelectDocs: QComponentDocs = {
  name: "QSelect",
  description:
    "QSelect is a form component that allows users to choose from multiple options in a dropdown list. It supports single and multiple selection, as well as different visual styles such as filled, outlined, and rounded.",
  docs: {
    props: QSelectDocsProps,
    snippets: QSelectDocsSnippets,
    methods: [],
    events: [
      {
        name: "change",
        type: "(value: string | string[]) => void",
        description: "Emitted when the value of the select component changes.",
      },
    ],
  },
};
