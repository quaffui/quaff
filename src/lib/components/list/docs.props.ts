export const QSeparatorPropsVertical = [
  {
    name: "spacing",
    type: '"none" | "sm" | "md" | "lg"',
    description: "",
  },
  {
    name: "inset",
    type: "boolean",
    description: "",
  },
  {
    name: "vertical",
    type: "true",
    description: "",
  },
  {
    name: "color",
    type: "string",
    description: "",
  },
  {
    name: "size",
    type: "string",
    description: "",
  },
  {
    name: "text",
    type: "string",
    description: "",
  },
  {
    name: "textAlign",
    type: '"top" | "middle" | "bottom"',
    description: "",
  },
];

export const QSeparatorPropsHorizontal = [
  {
    name: "spacing",
    type: '"none" | "sm" | "md" | "lg"',
    description: "",
  },
  {
    name: "inset",
    type: "boolean",
    description: "",
  },
  {
    name: "vertical",
    type: "false",
    description: "",
  },
  {
    name: "color",
    type: "string",
    description: "",
  },
  {
    name: "size",
    type: "string",
    description: "",
  },
  {
    name: "text",
    type: "string",
    description: "",
  },
  {
    name: "textAlign",
    type: '"left" | "center" | "right"',
    description: "",
  },
];

export const QListDocsProps = [
  {
    name: "bordered",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "roundedBorders",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "dense",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "separator",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "separatorOptions",
    type: '{ spacing?: "none" | "sm" | "md" | "lg"; inset?: boolean; color?: string; size?: string; text?: string; textAlign?: "top" | "middle" | "bottom" | "left" | "center" | "right"; }',
    description: "",
    default: {},
  },
  {
    name: "padding",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "tag",
    type: "string",
    description: "",
    default: "div",
  },
];

export const QItemDocsProps = [
  {
    name: "tag",
    type: "string",
    description: "",
    default: "div",
  },
  {
    name: "active",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "clickable",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "dense",
    type: "boolean",
    description: "",
    default: false,
  },
  {
    name: "tabindex",
    type: "string | number",
    description: "",
    default: 0,
  },
];

export const QItemSectionDocsProps = [
  {
    name: "thumbnail",
    type: "boolean",
    description: "",
  },
  {
    name: "video",
    type: "boolean",
    description: "",
  },
  {
    name: "icon",
    type: "boolean",
    description: "",
  },
  {
    name: "avatar",
    type: "boolean",
    description: "",
  },
];
