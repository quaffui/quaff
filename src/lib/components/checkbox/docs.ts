import { QCheckboxDocsProps } from "./docs.props";
import type { QComponentDocs } from "$lib/utils";

export let QCheckboxDocs: QComponentDocs = {
  name: "QCheckbox",
  description: "Checkboxes allow the user to select one or more items from a set.",
  docs: {
    props: QCheckboxDocsProps,
    slots: [],
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
