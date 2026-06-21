import type { QComponentDocs } from "$utils";
import {
  QIconDocsProps,
  QIconDocsSnippets,
  QIconDocsDomAttributesConstraint,
  QIconDocsGenerics,
} from "./docs.props";

export const QIconDocs: QComponentDocs = {
  name: "QIcon",
  description:
    "This component allows you to insert icons within elements of the page. Supported cions are Material Symbols icons.",
  docs: {
    generics: QIconDocsGenerics,
    domAttributesConstraint: QIconDocsDomAttributesConstraint,
    props: QIconDocsProps,
    snippets: QIconDocsSnippets,
    methods: [],
    events: [],
  },
};
