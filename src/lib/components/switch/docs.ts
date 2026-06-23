import type { QComponentDocs } from "$docs";
import {
  QSwitchDocsProps,
  QSwitchDocsSnippets,
  QSwitchDocsDomAttributesConstraint,
  QSwitchDocsGenerics,
} from "./docs.props";

export const QSwitchDocs: QComponentDocs = {
  name: "QSwitch",
  description:
    "QSwitch is a switch-like checkbox which offers binary choices. It supports labels, icons and different positioning of the labels.",
  docs: {
    generics: QSwitchDocsGenerics,
    domAttributesConstraint: QSwitchDocsDomAttributesConstraint,
    props: QSwitchDocsProps,
    snippets: QSwitchDocsSnippets,
    methods: [],
    events: [
      {
        name: "input",
        type: "(value: boolean) => void",
        description: "Emitted when the user changes the value of the toggle.",
      },
    ],
  },
};
