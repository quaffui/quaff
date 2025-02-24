import type { QComponentDocs } from "$lib/utils";
import { QFooterDocsProps, QFooterDocsSnippets } from "./docs.props";

export const QFooterDocs: QComponentDocs = {
  name: "QFooter",
  description:
    "Footers can be used to display navigation and key actions at the bottom of the screen.",
  docs: {
    props: QFooterDocsProps,
    snippets: QFooterDocsSnippets,
    methods: [],
    events: [],
  },
};
