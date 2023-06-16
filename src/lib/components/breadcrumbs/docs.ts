import type { QComponentDocs } from "$utils/types";

export let QBreadcrumbsDocs: QComponentDocs = {
  name: "QBreadcrumbs",
  description:
    "Breadcrumbs are mostly used as a navigation aid. They allow users to keep track of their location within the page.",
  docs: {
    props: [
      {
        name: "separator",
        type: "string",
        default: "/",
        description:
          'What to use as a separator. To use an icon, prefix with "icon:" followed by the name of the icon.',
      },
      {
        name: "gutter",
        type: "QBreadcrumbsGutterOptions",
        default: "sm",
        description: "Space around separators.",
        clickableType: true,
      },
      {
        name: "activeColor",
        type: "string",
        default: "primary",
        description:
          "Color to use for the active breadcrumb element. See <link to colors docs> to see what colors can be used.",
      },
      {
        name: "separatorColor",
        type: "string",
        default: "outline",
        description:
          "Color to use for the separators. See <link to colors docs> to see what colors can be used.",
      },
    ],
    slots: [
      {
        name: "default",
        description:
          "The default slot is used to inserts breadcrumb elements. Use QBreadcrumbsEl to insert elements.",
      },
    ],
    methods: [],
    events: [],
    types: [
      {
        name: "QBreadcrumbsGutterOptions",
        description: "none | sm | md | lg",
      },
    ],
  },
};
