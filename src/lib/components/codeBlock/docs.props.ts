export const QCodeBlockDocsProps = [
  {
    name: "language",
    type: "string",
    optional: false,
    clickableType: false,
    description: "Language to use for highlighting.",
    default: "",
  },
  {
    name: "code",
    type: "string",
    optional: true,
    clickableType: false,
    description: "Code to highlight.",
    default: "",
  },
  {
    name: "title",
    type: "string",
    optional: true,
    clickableType: false,
    description: "Title to display above the code.",
    default: "undefined",
  },
  {
    name: "copiable",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: "Wether the code should be copiable or not.",
    default: "false",
  },
];
