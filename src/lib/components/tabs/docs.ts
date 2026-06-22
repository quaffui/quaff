import type { QComponentDocs } from "$docs";
import {
  QTabDocsProps,
  QTabDocsSnippets,
  QTabDocsDomAttributesConstraint,
  QTabDocsGenerics,
  QTabsDocsProps,
  QTabsDocsSnippets,
  QTabsDocsDomAttributesConstraint,
  QTabsDocsGenerics,
} from "./docs.props";

export const QTabsDocs: QComponentDocs = {
  name: "QTabs",
  description:
    "Tabs allow creating navigational tabs, enabling users to switch between different views or functional aspects.",
  docs: {
    generics: QTabsDocsGenerics,
    domAttributesConstraint: QTabsDocsDomAttributesConstraint,
    props: QTabsDocsProps,
    snippets: QTabsDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QTabDocs: QComponentDocs = {
  name: "QTabs",
  description:
    "Tabs allow creating navigational tabs, enabling users to switch between different views or functional aspects.",
  docs: {
    generics: QTabDocsGenerics,
    domAttributesConstraint: QTabDocsDomAttributesConstraint,
    props: QTabDocsProps,
    snippets: QTabDocsSnippets,
    methods: [],
    events: [],
  },
};
