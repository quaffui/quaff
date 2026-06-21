import type { QComponentDocs } from "$utils";
import {
  QFooterDocsProps,
  QFooterDocsSnippets,
  QFooterDocsDomAttributesConstraint,
  QFooterDocsGenerics,
} from "./docs.props";

export const QFooterDocs: QComponentDocs = {
  name: "QFooter",
  description:
    "Footers can be used to display navigation and key actions at the bottom of the screen.",
  docs: {
    generics: QFooterDocsGenerics,
    domAttributesConstraint: QFooterDocsDomAttributesConstraint,
    props: QFooterDocsProps,
    snippets: QFooterDocsSnippets,
    methods: [],
    events: [],
  },
};
