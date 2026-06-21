import type { QComponentDocs } from "$utils";
import {
  QTooltipDocsProps,
  QTooltipDocsSnippets,
  QTooltipDocsDomAttributesConstraint,
  QTooltipDocsGenerics,
} from "./docs.props";

export const QTooltipDocs: QComponentDocs = {
  name: "QTooltip",
  description:
    "The Tooltip component displays informative text on hover or focus, providing additional context.",
  docs: {
    generics: QTooltipDocsGenerics,
    domAttributesConstraint: QTooltipDocsDomAttributesConstraint,
    props: QTooltipDocsProps,
    snippets: QTooltipDocsSnippets,
    methods: [],
    events: [],
  },
};
