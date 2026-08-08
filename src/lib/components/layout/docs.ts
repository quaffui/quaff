import type { QComponentDocs } from "$docs";
import {
  QLayoutDocsProps,
  QLayoutDocsSnippets,
  QLayoutDocsDomAttributesConstraint,
  QLayoutDocsGenerics,
  QLayoutDocsTypeDependencies,
} from "./docs.props";

export const QLayoutDocs: QComponentDocs = {
  name: "QLayout",
  description:
    "The QLayout component is designed to be the skeleton of the entire page, with navigational elements such as a header, railbars, drawers, a navbar, and a footer. This component is not mandatory but it helps structure the page.",
  docs: {
    generics: QLayoutDocsGenerics,
    domAttributesConstraint: QLayoutDocsDomAttributesConstraint,
    props: QLayoutDocsProps,
    snippets: QLayoutDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QLayoutDocsTypeDependencies,
  },
};
