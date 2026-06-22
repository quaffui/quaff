import type { QComponentDocs } from "$docs";
import {
  QChipDocsProps,
  QChipDocsSnippets,
  QChipDocsDomAttributesConstraint,
  QChipDocsGenerics,
} from "./docs.props";

export const QChipDocs: QComponentDocs = {
  name: "QChip",
  description:
    "Chips help people enter information, make selections, filter content, or trigger actions. They represent options in a specific context, unlike buttons, which are persistent.",
  docs: {
    generics: QChipDocsGenerics,
    domAttributesConstraint: QChipDocsDomAttributesConstraint,
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
