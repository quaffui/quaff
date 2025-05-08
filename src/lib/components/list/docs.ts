import type { QComponentDocs } from "$utils";
import {
  QItemDocsProps,
  QItemDocsSnippets,
  QItemSectionDocsProps,
  QItemSectionDocsSnippets,
  QListDocsProps,
  QListDocsSnippets,
} from "./docs.props";

export const QListDocs: QComponentDocs = {
  name: "QList",
  description:
    "The QList component is used to display a list of items with options for adding text, icons and actions.",
  docs: {
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
    props: QItemSectionDocsProps,
    snippets: QItemSectionDocsSnippets,
    methods: [],
    events: [],
  },
};
