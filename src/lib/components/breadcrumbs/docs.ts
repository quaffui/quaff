import type { QComponentDocs } from "$lib/utils";
import { QBreadcrumbsDocsProps } from "./docs.props";

export const QBreadcrumbsDocs: QComponentDocs = {
  name: "QBreadcrumbs",
  description:
    "Breadcrumbs are mostly used as a navigation aid. They allow users to keep track of their location within the page.",
  docs: {
    props: QBreadcrumbsDocsProps,
    slots: [
      {
        name: "default",
        description:
          "The default slot is used to inserts breadcrumb elements. Use QBreadcrumbsEl to insert elements.",
      },
    ],
    methods: [],
    events: [],
  },
};
