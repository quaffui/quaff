import type { QComponentDocs } from "$utils";
import {
  QCardActionsDocsProps,
  QCardActionsDocsSnippets,
  QCardDocsProps,
  QCardDocsSnippets,
  QCardSectionDocsProps,
  QCardSectionDocsSnippets,
} from "./docs.props";

export const QCardDocs: QComponentDocs = {
  name: "QCard",
  description:
    "Cards provide a clean, flexible, and convenient means of displaying a wide variety of content.",
  docs: {
    props: QCardDocsProps,
    snippets: QCardDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QCardSectionDocs: QComponentDocs = {
  name: "QCardSection",
  description: "Sections are used to group similar content within a card.",
  docs: {
    props: QCardSectionDocsProps,
    snippets: QCardSectionDocsSnippets,
    methods: [],
    events: [],
  },
};

export const QCardActionsDocs: QComponentDocs = {
  name: "QCardActions",
  description: "Actions hold actionable items like buttons within a card.",
  docs: {
    props: QCardActionsDocsProps,
    snippets: QCardActionsDocsSnippets,
    methods: [],
    events: [],
  },
};
