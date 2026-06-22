import type { QComponentDocs } from "$docs";
import {
  QItemDocsProps,
  QItemDocsSnippets,
  QItemDocsDomAttributesConstraint,
  QItemDocsGenerics,
  QItemSectionDocsProps,
  QItemSectionDocsSnippets,
  QItemSectionDocsDomAttributesConstraint,
  QItemSectionDocsGenerics,
  QListDocsProps,
  QListDocsSnippets,
  QListDocsDomAttributesConstraint,
  QListDocsGenerics,
} from "./docs.props";

export const QListDocs: QComponentDocs = {
  name: "QList",
  description:
    "The QList component is used to display a list of items with options for adding text, icons and actions.",
  docs: {
    generics: QListDocsGenerics,
    domAttributesConstraint: QListDocsDomAttributesConstraint,
    props: QListDocsProps,
    snippets: QListDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QItemDocs: QComponentDocs = {
  name: "QItem",
  description:
    "The QItem component is generally used inside lists to display related pieces of information.",
  docs: {
    generics: QItemDocsGenerics,
    domAttributesConstraint: QItemDocsDomAttributesConstraint,
    props: QItemDocsProps,
    snippets: QItemDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QItemSectionDocs: QComponentDocs = {
  name: "QItemSection",
  description:
    "The QItemSection component is used inside QItem to separate different types of information.",
  docs: {
    generics: QItemSectionDocsGenerics,
    domAttributesConstraint: QItemSectionDocsDomAttributesConstraint,
    props: QItemSectionDocsProps,
    snippets: QItemSectionDocsSnippets,
    methods: [],
    events: [],
  },
};
