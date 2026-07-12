import type { QComponentDocs } from "$docs";
import {
  QHeaderDocsProps,
  QHeaderDocsSnippets,
  QHeaderDocsDomAttributesConstraint,
  QHeaderDocsGenerics,
  QHeaderDocsTypeDependencies,
  QHeaderTitleDocsProps,
  QHeaderTitleDocsSnippets,
  QHeaderTitleDocsDomAttributesConstraint,
  QHeaderTitleDocsGenerics,
  QHeaderTitleDocsTypeDependencies,
} from "./docs.props";

export const QHeaderDocs: QComponentDocs = {
  name: "QHeader",
  description:
    "QHeader is a top app bar for titles, navigation, and actions. It can be used independently or integrated with QLayout.",
  docs: {
    generics: QHeaderDocsGenerics,
    domAttributesConstraint: QHeaderDocsDomAttributesConstraint,
    props: QHeaderDocsProps,
    snippets: QHeaderDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QHeaderDocsTypeDependencies,
  },
};

export const QHeaderTitleDocs: QComponentDocs = {
  name: "QHeaderTitle",
  description: "QHeaderTitle positions a title or central control within QHeader.",
  docs: {
    generics: QHeaderTitleDocsGenerics,
    domAttributesConstraint: QHeaderTitleDocsDomAttributesConstraint,
    props: QHeaderTitleDocsProps,
    snippets: QHeaderTitleDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QHeaderTitleDocsTypeDependencies,
  },
};
