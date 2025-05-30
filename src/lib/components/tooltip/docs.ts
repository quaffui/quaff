import { QToolbarDocsSnippets } from "$components/header/docs.props";
import type { QComponentDocs } from "$utils";
import { QTooltipDocsProps } from "./docs.props";

export const QTooltipDocs: QComponentDocs = {
  name: "QTooltip",
  description:
    "The Tooltip component displays informative text on hover or focus, providing additional context.",
  docs: {
    props: QTooltipDocsProps,
    snippets: QToolbarDocsSnippets,
    methods: [],
    events: [],
  },
};
