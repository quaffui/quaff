import type { QComponentDocs } from "$utils/types";

export let QSelectDocs: QComponentDocs = {
  name: "QSelect",
  description:
    "QSelect is a form component that allows users to choose from multiple options in a dropdown list. It supports single and multiple selection, as well as different visual styles such as bordered, filled, outlined, and rounded.",
  docs: {
    props: [
      {
        name: "value",
        type: "string | string[]",
        default: "",
        description: "Current value(s) of the select component.",
      },
      {
        name: "multiple",
        type: "boolean",
        default: false,
        description: "Whether the select component supports multiple selection.",
      },
      {
        name: "options",
        type: "QSelectOption[]",
        description: "Options available for selection.",
        clickableType: true,
      },
      {
        name: "bordered",
        type: "boolean",
        default: false,
        description: "Whether the select component has a border.",
      },
      {
        name: "disable",
        type: "boolean",
        default: false,
        description: "Whether the select component is disabled.",
      },
      {
        name: "error",
        type: "boolean",
        default: false,
        description: "Whether the select component is in an error state.",
      },
      {
        name: "errorMessage",
        type: "string",
        optional: true,
        description: "Custom error message to show when the select component is in an error state.",
      },
      {
        name: "filled",
        type: "boolean",
        default: false,
        description: "Whether the select component has a filled style.",
      },
      {
        name: "hint",
        type: "string",
        optional: true,
        description: "Hint text to show under the select component.",
      },
      {
        name: "label",
        type: "string",
        optional: true,
        description: "Label for the select component.",
      },
      {
        name: "outlined",
        type: "boolean",
        default: false,
        description: "Whether the select component has an outlined style.",
      },
      {
        name: "rounded",
        type: "boolean",
        default: false,
        description: "Whether the select component has rounded corners.",
      },
      {
        name: "dense",
        type: "boolean",
        optional: true,
        description: "Whether the select component has a smaller (dense) size.",
      },
    ],
    slots: [],
    methods: [],
    events: [
      {
        name: "change",
        type: "(value: string | string[]) => void",
        description: "Emitted when the value of the select component changes.",
      },
    ],
  },
};
