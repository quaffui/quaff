import type { QComponentDocs } from "$lib/utils";
import { QCheckboxDocsProps, QCheckboxDocsSnippets } from "./docs.props";

export const QCheckboxDocs: QComponentDocs = {
  name: "QCheckbox",
  description: "Checkboxes allow the user to select one or more items from a set.",
  docs: {
    props: QCheckboxDocsProps,
    snippets: QCheckboxDocsSnippets,
    methods: [],
    events: [
      {
        name: "change",
        type: "(e: Event) => void",
        description: "Emitted when the checkbox is checked or unchecked.",
      },
    ],
  },
};
