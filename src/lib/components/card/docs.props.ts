export const QCardDocsProps = [
  {
    name: "bordered",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Puts a border around the card.",
    default: "false",
  },
  {
    name: "fill",
    type: "string | boolean",
    optional: true,
    clickableType: false,
    description: "Defines the fill color of the card.",
    default: "undefined",
  },
  {
    name: "flat",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Makes the card flat, removing its elevation.",
    default: "false",
  },
  {
    name: "round",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Adds rounded corners to the card.",
    default: "false",
  },
  {
    name: "title",
    type: "string",
    optional: true,
    clickableType: false,
    description: "Sets the title of the card.",
    default: "undefined",
  },
];

export const QCardSectionDocsProps = [
  {
    name: "horizontal",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Lays out the section content horizontally.",
    default: "false",
  },
];

export const QCardActionsDocsProps = [
  {
    name: "vertical",
    type: "boolean",
    optional: false,
    clickableType: false,
    description: "Lays out the action items vertically.",
    default: "false",
  },
];
