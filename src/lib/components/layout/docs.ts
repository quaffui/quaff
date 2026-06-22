import type { QComponentDocs } from "$docs";
import {
  QLayoutDocsProps,
  QLayoutDocsSnippets,
  QLayoutDocsDomAttributesConstraint,
  QLayoutDocsGenerics,
} from "./docs.props";

export const QLayoutDocs: QComponentDocs = {
  name: "QLayout",
  description:
    "The QLayout component is designed to be the skeleton of the entire page, with navigational elements such as header, railbars, drawers and footer. This component is not mandatory but it really helps structure the page.",
  docs: {
    generics: QLayoutDocsGenerics,
    domAttributesConstraint: QLayoutDocsDomAttributesConstraint,
    props: QLayoutDocsProps,
    snippets: QLayoutDocsSnippets,
    methods: [],
    events: [],
  },
};
