export const QLinearProgressDocsProps = [
  {
    name: "value",
    type: "number",
    optional: false,
    clickableType: false,
    description: "",
    default: "0",
  },
  {
    name: "from",
    type: '"left" | "right"',
    optional: true,
    clickableType: false,
    description: "",
    default: "left",
  },
  {
    name: "rounded",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "",
    default: "false",
  },
];

export const QCircularProgressDocsProps = [
  {
    name: "value",
    type: "number",
    optional: false,
    clickableType: false,
    description: "",
    default: "0",
  },
  {
    name: "indeterminate",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "",
    default: "false",
  },
  {
    name: "size",
    type: "CssValue | number",
    optional: true,
    clickableType: true,
    description: "",
    default: "2em",
  },
  {
    name: "color",
    type: "string",
    optional: true,
    clickableType: false,
    description: "",
    default: "undefined",
  },
  {
    name: "thickness",
    type: "number",
    optional: true,
    clickableType: false,
    description: "",
    default: "5",
  },
];
