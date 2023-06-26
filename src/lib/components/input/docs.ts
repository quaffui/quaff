import type { QComponentDocs } from "$utils/types";

export let QInputDocs: QComponentDocs = {
  name: "QInput",
  description:
    "QInput is a form component that allows users to input text. It supports different visual styles such as bordered, filled, outlined, and rounded, and it can also display hint text and custom error messages.",
  docs: {
    props: [
      {
        name: "bordered",
        type: "boolean",
        default: false,
        description: "Whether the input component has a border.",
      },
      {
        name: "disable",
        type: "boolean",
        default: false,
        description: "Whether the input component is disabled.",
      },
      {
        name: "error",
        type: "boolean",
        default: false,
        description: "Whether the input component is in an error state.",
      },
      {
        name: "errorMessage",
        type: "string",
        optional: true,
        description: "Custom error message to show when the input component is in an error state.",
      },
      {
        name: "filled",
        type: "boolean",
        default: false,
        description: "Whether the input component has a filled style.",
      },
      {
        name: "hint",
        type: "string",
        optional: true,
        description: "Hint text to show under the input component.",
      },
      {
        name: "label",
        type: "string",
        optional: true,
        description: "Label for the input component.",
      },
      {
        name: "outlined",
        type: "boolean",
        default: false,
        description: "Whether the input component has an outlined style.",
      },
      {
        name: "rounded",
        type: "boolean",
        default: false,
        description: "Whether the input component has rounded corners.",
      },
      {
        name: "dense",
        type: "boolean",
        optional: true,
        description: "Whether the input component has a smaller (dense) size.",
      },
      {
        name: "value",
        type: "string",
        default: "",
        description: "Current value of the input component.",
      },
    ],
    slots: [],
    methods: [],
    events: [
      {
        name: "input",
        type: "(value: string) => void",
        description: "Emitted when the user types in the input component.",
      },
    ],
  },
};
