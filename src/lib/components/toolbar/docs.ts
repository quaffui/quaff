import type { QComponentDocs } from "$lib/utils";
import {
  QToolbarDocsProps,
  QToolbarDocsSnippets,
  QToolbarTitleDocsProps,
  QToolbarTitleDocsSnippets,
} from "./docs.props";

export const QToolbarDocs: QComponentDocs = {
  name: "QToolbar",
  description:
    "The Toolbar component is used to hold common actions and controls, often located at the top of an application or view.",
  docs: {
    props: QToolbarDocsProps,
    snippets: QToolbarDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QToolbarTitleDocs: QComponentDocs = {
  name: "QToolbar",
  description:
    "The Toolbar component is used to hold common actions and controls, often located at the top of an application or view.",
  docs: {
    props: QToolbarTitleDocsProps,
    snippets: QToolbarTitleDocsSnippets,
    methods: [],
    events: [],
  },
};
