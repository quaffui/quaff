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
    "QExpansionItem adds an accessible expand/collapse disclosure to a list item while preserving QList density and expressive styling.",
  docs: {
    generics: QExpansionItemDocsGenerics,
    domAttributesConstraint: QExpansionItemDocsDomAttributesConstraint,
    props: QExpansionItemDocsProps,
    snippets: QExpansionItemDocsSnippets,
    methods: [
      {
        name: "show",
        type: "() => void",
        description: "Expands the item.",
      },
      {
        name: "hide",
        type: "() => void",
        description: "Collapses the item.",
      },
      {
        name: "toggle",
        type: "() => void",
        description: "Toggles the expanded state.",
      },
    ],
    events: [
      {
        name: "toggle",
        type: "ToggleEvent",
        description: "Emitted when the expanded state changes.",
      },
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks the main header action.",
      },
    ],
    typeDependencies: QExpansionItemDocsTypeDependencies,
  },
};
