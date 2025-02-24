import type { QComponentDocs } from "$lib/utils";
import { QListDocsProps, QListDocsSnippets } from "./docs.props";

export const QListDocs: QComponentDocs = {
  name: "QList",
  description:
    "The QList component is used to display a list of items with options for adding text, icons and actions.",
  docs: {
    props: QListDocsProps,
    snippets: QListDocsSnippets,
    methods: [],
    events: [],
  },
};
