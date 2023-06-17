import type { QComponentDocs } from "$lib/utils/types";

export let QCheckboxDocs: QComponentDocs = {
  name: "QCheckbox",
  description: "Checkboxes allow the user to select one or more items from a set.",
  docs: {
    props: [
      {
        name: "value",
        type: "boolean",
        default: false,
        description: "Controls the checked state of the checkbox.",
      },
      {
        name: "label",
        type: "string",
        description: "Sets the label for the checkbox.",
      },
      {
        name: "disable",
        type: "boolean",
        description: "Puts the checkbox in a disabled state, making it unclickable.",
      },
    ],
    slots: [],
    methods: [],
    events: [
      {
        name: "change",
        type: "(e: Event) => void",
        description: "Emitted when the checkbox is checked or unchecked.",
      },
    ],
    types: [],
  },
};
