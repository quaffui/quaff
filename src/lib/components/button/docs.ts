import type { QComponentDocs } from "$utils/types";

export let QBtnDocs: QComponentDocs = {
  name: "QBtn",
  description:
    "Buttons help users take action, such as sending an email, sharing a document, or liking a comment.",
  docs: {
    props: [
      {
        name: "disable",
        type: "boolean",
        default: false,
        description: "Puts the button in a disabled state, making it unclickable.",
      },
      {
        name: "flat",
        type: "boolean",
        default: false,
        description: "Use flat design for the button, removing its elevation and background-color.",
      },
      {
        name: "icon",
        optional: true,
        type: "string",
        description: "Name of the leading icon to use for the button.",
      },
      {
        name: "label",
        type: "string",
        optional: true,
        description: "Text to use for the button.",
      },
      {
        name: "loading",
        type: "boolean",
        default: false,
        description: "Puts the button in a loading state, adding a loader as the leading icon.",
      },
      {
        name: "outline",
        type: "boolean",
        default: false,
        description: "Use outline design for the button, adding a border around it.",
      },
      {
        name: "round",
        type: "boolean",
        default: true,
        description: "Use round design for the button, adding a border-radius to it.",
      },
      {
        name: "to",
        type: "string",
        optional: true,
        description:
          'Makes the button a navigation button. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id")',
      },
      {
        name: "unelevated",
        type: "boolean",
        default: false,
        description: "Removes the button's elevation.",
      },
    ],
    slots: [
      {
        name: "default",
        description:
          "The default slot can be used to display the button's text. This slot doesn't overwrite the label prop but appends to it.",
      },
    ],
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the button.",
      },
    ],
    types: [],
  },
};
