export const QBtnDocsProps = [
  {
    name: "disable",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Puts the button in a disabled state, making it unclickable.",
    default: "false",
  },
  {
    name: "flat",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Use flat design for the button, removing its elevation and background-color.",
    default: "false",
  },
  {
    name: "icon",
    type: "string",
    optional: true,
    clickableType: false,
    description: "Name of the leading icon to use for the button.",
    default: "undefined",
  },
  {
    name: "label",
    type: "string",
    optional: true,
    clickableType: false,
    description: "Text to use for the button.",
    default: "undefined",
  },
  {
    name: "loading",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Puts the button in a loading state, adding a loader as the leading icon.",
    default: "false",
  },
  {
    name: "outline",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Use outline design for the button, adding a border around it.",
    default: "false",
  },
  {
    name: "rectangle",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Use rectangle design for the button, removing the large border-radius.",
    default: "false",
  },
  {
    name: "to",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      'Makes the button navigational. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id").',
    default: "undefined",
  },
  {
    name: "unelevated",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Removes the button's elevation.",
    default: "false",
  },
  {
    name: "size",
    type: "QBtnSizeOptions",
    optional: true,
    clickableType: true,
    description: "Size of the button.",
    default: "md",
  },
];

export const QDialogDocsProps = [
  {
    name: "value",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "The value indicating whether the dialog is visible or hidden.",
    default: "false",
  },
  {
    name: "btnContent",
    type: "string",
    optional: true,
    clickableType: false,
    description: "The content to be displayed on the dialog button.",
    default: "undefined",
  },
  {
    name: "btnAttrs",
    type: "QBtnProps",
    optional: true,
    clickableType: false,
    description: "Additional attributes for the dialog button.",
    default: "{}",
  },
  {
    name: "position",
    type: "QDialogPositionOptions",
    optional: true,
    clickableType: true,
    description: "The position of the dialog relative to the viewport.",
    default: '"default"',
  },
  {
    name: "modal",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Determines whether the dialog is displayed as a modal or not.",
    default: "false",
  },
  {
    name: "fullscreen",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Determines whether the dialog is displayed in fullscreen mode.",
    default: "false",
  },
  {
    name: "persistent",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Determines whether the dialog remains persistent, not closing on click outside.",
    default: "false",
  },
];
