import type { QComponentDocs } from "$utils/types";

export let QToggleDocs: QComponentDocs = {
  name: "QToggle",
  description:
    "QToggle is a switch-like checkbox which offers binary choices. It supports labels, icons and different positioning of the labels.",
  docs: {
    props: [
      {
        name: "value",
        type: "boolean",
        default: false,
        description: "The current value of the toggle, true or false.",
      },
      {
        name: "label",
        type: "string",
        optional: true,
        description: "Label to be shown alongside the toggle.",
      },
      {
        name: "leftLabel",
        type: "boolean",
        default: false,
        description: "Whether the label should be displayed to the left of the toggle.",
      },
      {
        name: "icon",
        type: "string",
        optional: true,
        description: "Name of the icon to display on the toggle.",
      },
      {
        name: "disable",
        type: "boolean",
        default: false,
        description: "Whether the toggle should be disabled.",
      },
    ],
    slots: [],
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
