import type { QComponentDocs } from "$docs";
import {
  QExpansionItemDocsProps,
  QExpansionItemDocsSnippets,
  QExpansionItemDocsDomAttributesConstraint,
  QExpansionItemDocsGenerics,
  QExpansionItemDocsTypeDependencies,
} from "./docs.props";

export const QExpansionItemDocs: QComponentDocs = {
  name: "QExpansionItem",
  description:
    "The QExpansionItem component allows users to create expandable/collapsible sections within a list or a card.",
  docs: {
    generics: QExpansionItemDocsGenerics,
    domAttributesConstraint: QExpansionItemDocsDomAttributesConstraint,
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
    typeDependencies: QExpansionItemDocsTypeDependencies,
  },
};
