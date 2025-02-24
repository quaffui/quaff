import type { QComponentDocs } from "$lib/utils";
import { QRadioDocsProps, QRadioDocsSnippets } from "./docs.props";

export const QRadioDocs: QComponentDocs = {
  name: "QRadio",
  description: "Radio buttons allow the user to select one option from a set.",
  docs: {
    props: QRadioDocsProps,
    snippets: QRadioDocsSnippets,
    methods: [],
    events: [
      {
        name: "change",
        type: "(e: Event) => void",
        description: "Emitted when the radio button is selected.",
      },
    ],
  },
};
