import type { QComponentDocs } from "$utils";
import { QHeaderDocsProps, QHeaderDocsSnippets } from "./docs.props";

export const QHeaderDocs: QComponentDocs = {
  name: "QHeader",
  description:
    "QHeader is a component used for the top section of a QLayout, typically containing a QToolbarTitle for titles, navigation, and actions. It can be configured to be elevated, bordered, reveal on scroll, and have a custom height.",
  docs: {
    props: QHeaderDocsProps,
    snippets: QHeaderDocsSnippets,
    methods: [],
    events: [],
  },
};
