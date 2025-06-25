import type { QComponentDocs } from "$utils";
import { QExpansionItemDocsProps, QExpansionItemDocsSnippets } from "./docs.props";

export const QExpansionItemDocs: QComponentDocs = {
  name: "QExpansionItem",
  description:
    "The QExpansionItem component allows users to create expandable/collapsible sections within a list or a card.",
  docs: {
    props: QExpansionItemDocsProps,
    snippets: QExpansionItemDocsSnippets,
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the expansion item.",
      },
    ],
  },
};
