import type { QComponentDocs } from "$docs";
import {
  QSwitchDocsProps,
  QSwitchDocsSnippets,
  QSwitchDocsDomAttributesConstraint,
  QSwitchDocsGenerics,
  QSwitchDocsTypeDependencies,
} from "./docs.props";

export const QSwitchDocs: QComponentDocs = {
  name: "QSwitch",
  description:
    "QSwitch controls a standalone binary setting that takes effect immediately. It supports labels, optional state icons, and configurable label positioning.",
  docs: {
    generics: QSwitchDocsGenerics,
    domAttributesConstraint: QSwitchDocsDomAttributesConstraint,
    props: QSwitchDocsProps,
    snippets: QSwitchDocsSnippets,
    methods: [
      {
        name: "toggle",
        type: "() => void",
        description: "Toggles the switch value.",
      },
    ],
    events: [
      {
        name: "input",
        type: "InputEvent",
        description: "Emitted when the switch value is toggled.",
      },
      {
        name: "change",
        type: "Event",
        description: "Emitted after the switch value is toggled.",
      },
    ],
    typeDependencies: QSwitchDocsTypeDependencies,
  },
};
