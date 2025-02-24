import type { QComponentDocs } from "$lib/utils";
import { QChipDocsProps, QChipDocsSnippets } from "./docs.props";

export const QChipDocs: QComponentDocs = {
  name: "QChip",
  description:
    "Chips help people enter information, make selections, filter content, or trigger actions. They represent options in a specific context, unlike buttons, which are persistent.",
  docs: {
    props: QChipDocsProps,
    snippets: QChipDocsSnippets,
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the chip.",
      },
    ],
  },
};
