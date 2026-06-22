import type { QComponentDocs } from "$docs";
import {
  QLinearProgressDocsProps,
  QLinearProgressDocsSnippets,
  QLinearProgressDocsDomAttributesConstraint,
  QLinearProgressDocsGenerics,
  QCircularProgressDocsProps,
  QCircularProgressDocsSnippets,
  QCircularProgressDocsDomAttributesConstraint,
  QCircularProgressDocsGenerics,
} from "./docs.props";

export const QLinearProgressDocs: QComponentDocs = {
  name: "QLinearProgress",
  description:
    "The QLinearProgress component is used to display a progress bar, indicating the completion status of a task or process.",
  docs: {
    generics: QLinearProgressDocsGenerics,
    domAttributesConstraint: QLinearProgressDocsDomAttributesConstraint,
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
    generics: QCircularProgressDocsGenerics,
    domAttributesConstraint: QCircularProgressDocsDomAttributesConstraint,
    props: QCircularProgressDocsProps,
    snippets: QCircularProgressDocsSnippets,
    methods: [],
    events: [],
  },
};
