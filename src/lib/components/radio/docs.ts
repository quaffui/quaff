import type { QComponentDocs } from "$utils/types";

export let QRadioDocs: QComponentDocs = {
  name: "QRadio",
  description: "Radio buttons allow the user to select one option from a set.",
  docs: {
    props: [
      {
        name: "value",
        type: "string",
        default: "",
        description: "The value of the radio button.",
      },
      {
        name: "label",
        type: "string",
        description: "The label of the radio button.",
      },
      {
        name: "selected",
        type: "any",
        description: "The currently selected value in the radio group.",
      },
      {
        name: "disable",
        type: "boolean",
        default: false,
        description: "Disable the radio button.",
      },
    ],
    slots: [],
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
