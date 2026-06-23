import type { QComponentDocs } from "$docs";
import {
  QRadioDocsProps,
  QRadioDocsSnippets,
  QRadioDocsDomAttributesConstraint,
  QRadioDocsGenerics,
} from "./docs.props";

export const QRadioDocs: QComponentDocs = {
  name: "QRadio",
  description: "Radio buttons allow the user to select one option from a set.",
  docs: {
    generics: QRadioDocsGenerics,
    domAttributesConstraint: QRadioDocsDomAttributesConstraint,
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
