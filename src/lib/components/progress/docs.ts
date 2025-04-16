import type { QComponentDocs } from "$lib/utils";
import {
  QLinearProgressDocsProps,
  QLinearProgressDocsSnippets,
  QCircularProgressDocsProps,
  QCircularProgressDocsSnippets,
} from "./docs.props";

export const QLinearProgressDocs: QComponentDocs = {
  name: "QLinearProgress",
  description:
    "The QLinearProgress component is used to display a progress bar, indicating the completion status of a task or process.",
  docs: {
    props: QLinearProgressDocsProps,
    snippets: QLinearProgressDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QCircularProgressDocs: QComponentDocs = {
  name: "QCircularProgress",
  description:
    "The QCircularProgress component is used to display a circular progress bar, indicating the completion status of a task or process.",
  docs: {
    props: QCircularProgressDocsProps,
    snippets: QCircularProgressDocsSnippets,
    methods: [],
    events: [],
  },
};
