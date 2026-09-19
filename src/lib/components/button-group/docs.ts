import type { QComponentDocs } from "$docs";
import {
  QBtnGroupDocsDomAttributesConstraint,
  QBtnGroupDocsGenerics,
  QBtnGroupDocsProps,
  QBtnGroupDocsSnippets,
  QBtnGroupDocsTypeDependencies,
  QBtnToggleDocsDomAttributesConstraint,
  QBtnToggleDocsGenerics,
  QBtnToggleDocsProps,
  QBtnToggleDocsSnippets,
  QBtnToggleDocsTypeDependencies,
} from "./docs.props";

export const QBtnGroupDocs: QComponentDocs = {
  name: "QBtnGroup",
  description:
    "Group related buttons with Material 3 standard or connected layouts and shared sizing.",
  docs: {
    generics: QBtnGroupDocsGenerics,
    domAttributesConstraint: QBtnGroupDocsDomAttributesConstraint,
    props: QBtnGroupDocsProps,
    snippets: QBtnGroupDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QBtnGroupDocsTypeDependencies,
  },
};

export const QBtnToggleDocs: QComponentDocs = {
  name: "QBtnToggle",
  description:
    "Choose one or several values with connected or standard button groups, including baseline segmented buttons.",
  docs: {
    generics: QBtnToggleDocsGenerics,
    domAttributesConstraint: QBtnToggleDocsDomAttributesConstraint,
    props: QBtnToggleDocsProps,
    snippets: QBtnToggleDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QBtnToggleDocsTypeDependencies,
  },
};
