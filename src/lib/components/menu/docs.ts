import type { QComponentDocs } from "$utils";
import {
  QMenuDocsProps,
  QMenuDocsSnippets,
  QMenuDocsDomAttributesConstraint,
  QMenuDocsGenerics,
} from "./docs.props";

export const QMenuDocs: QComponentDocs = {
  name: "QMenu",
  description:
    "QMenu displays anchored popup content. It handles positioning, outside-click dismissal, Escape dismissal, and native dialog layering.",
  docs: {
    generics: QMenuDocsGenerics,
    domAttributesConstraint: QMenuDocsDomAttributesConstraint,
    props: QMenuDocsProps,
    snippets: QMenuDocsSnippets,
    methods: [
      {
        name: "show",
        type: "() => void",
        description: "Opens the menu.",
      },
      {
        name: "hide",
        type: "() => void",
        description: "Closes the menu.",
      },
      {
        name: "toggle",
        type: "() => void",
        description: "Toggles the menu open state.",
      },
    ],
    events: [],
  },
};
