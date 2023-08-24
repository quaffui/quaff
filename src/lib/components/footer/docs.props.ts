export const QFooterDocsProps = [
  {
    name: "value",
    type: "boolean",
    optional: true,
    clickableType: false,
    description:
      "The value indicating whether the footer is visible or hidden. (not supported yet)",
    default: "true",
  },
  {
    name: "border",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Determines whether the footer has a border around it. (not supported yet)",
    default: "false",
  },
  {
    name: "elevate",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Determines whether the footer has an elevated effect. (not supported yet)",
    default: "false",
  },
  {
    name: "height",
    type: "number | CssValue",
    optional: true,
    clickableType: true,
    description:
      'The height of the footer. Can be specified with a CSS unit. If not specified, "px" will be used. (not supported yet)',
    default: "undefined",
  },
];
