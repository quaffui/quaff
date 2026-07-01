import type { QComponentDocs } from "$docs";
import {
  QToolbarDocsProps,
  QToolbarDocsSnippets,
  QToolbarDocsDomAttributesConstraint,
  QToolbarDocsGenerics,
  QToolbarTitleDocsProps,
  QToolbarTitleDocsSnippets,
  QToolbarTitleDocsDomAttributesConstraint,
  QToolbarTitleDocsGenerics,
  QToolbarDocsTypeDependencies,
  QToolbarTitleDocsTypeDependencies,
} from "./docs.props";

export const QToolbarDocs: QComponentDocs = {
  name: "QToolbar",
  description:
    "The Toolbar component is used to hold common actions and controls, often located at the top of an application or view.",
  docs: {
    generics: QToolbarDocsGenerics,
    domAttributesConstraint: QToolbarDocsDomAttributesConstraint,
    props: QToolbarDocsProps,
    snippets: QToolbarDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QToolbarDocsTypeDependencies,
  },
};

export const QToolbarTitleDocs: QComponentDocs = {
  name: "QToolbar",
  description:
    "The Toolbar component is used to hold common actions and controls, often located at the top of an application or view.",
  docs: {
    generics: QToolbarTitleDocsGenerics,
    domAttributesConstraint: QToolbarTitleDocsDomAttributesConstraint,
    props: QToolbarTitleDocsProps,
    snippets: QToolbarTitleDocsSnippets,
    methods: [],
    events: [],
    typeDependencies: QToolbarTitleDocsTypeDependencies,
  },
};
