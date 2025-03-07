import type { QComponentDocs } from "$lib/utils";
import {
  QLinearProgressDocsProps,
  QLinearProgressDocsSnippets,
  QCircularProgressDocsProps,
  QCircularProgressDocsSnippets,
} from "./docs.props";

export const QLinearProgressDocs: QComponentDocs = {
  name: "QProgress",
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
  name: "QProgress",
  description:
    "The QCircularProgress component is used to display a cicular progress bar, indicating the completion status of a task or process.",
  docs: {
    props: QCircularProgressDocsProps,
    snippets: QCircularProgressDocsSnippets,
    methods: [],
    events: [],
  },
};
