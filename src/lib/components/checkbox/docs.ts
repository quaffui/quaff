import type { QComponentDocs } from "$docs";
import {
  QCheckboxDocsProps,
  QCheckboxDocsSnippets,
  QCheckboxDocsDomAttributesConstraint,
  QCheckboxDocsGenerics,
} from "./docs.props";

export const QCheckboxDocs: QComponentDocs = {
  name: "QCheckbox",
  description: "Checkboxes allow the user to select one or more items from a set.",
  docs: {
    generics: QCheckboxDocsGenerics,
    domAttributesConstraint: QCheckboxDocsDomAttributesConstraint,
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
