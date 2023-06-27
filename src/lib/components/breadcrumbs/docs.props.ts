export const QBreadcrumbsDocsProps = [
  {
    name: "separator",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      'Separator to use between the breadcrumb elements. To use an icon, prefix with "icon:" followed by the name of the icon.',
    default: "",
  },
  {
    name: "gutter",
    type: "QBreadcrumbsGutterOptions",
    optional: true,
    clickableType: true,
    description: "Space around separators.",
    default: "sm",
  },
  {
    name: "activeColor",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      "Color to use for the active breadcrumb element. See <link to colors docs> to see what colors can be used.",
    default: "primary",
  },
  {
    name: "separatorColor",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      "Color to use for the separators. See <link to colors docs> to see what colors can be used.",
    default: "outline",
  },
];

export const QBreadcrumbsElDocsProps = [
  {
    name: "label",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      "Text to use for the breadcrumb element. If default slot is defined, the label will be overwritten by it.",
    default: '""',
  },
  {
    name: "icon",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      "Name of the leading icon for the breadcrumb element. The icon prop overwrites to icon slot.",
    default: "undefined",
  },
  {
    name: "tag",
    type: "string",
    optional: true,
    clickableType: false,
    description: "Tag to use for the breadcrumb element.",
    default: '"div"',
  },
  {
    name: "to",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      'Makes the breadcrumb element navigational. Can be used with the router (e.g to="home") or as a normal href attribute (e.g to="#section-id")',
    default: "undefined",
  },
  {
    name: "href",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      'Also makes the breadcrumb element navigational. Can be used with the router (e.g to="home") or as a normal href attribute (e.g to="#section-id")',
    default: "undefined",
  },
  {
    name: "activeClass",
    type: "string",
    optional: true,
    clickableType: false,
    description: "Class to apply to the breadcrumb element when the route is active.",
    default: '"active"',
  },
];
