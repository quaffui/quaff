import type { QComponentDocs } from "$docs";
import {
  QCardActionsDocsProps,
  QCardActionsDocsSnippets,
  QCardActionsDocsGenerics,
  QCardActionsDocsDomAttributesConstraint,
  QCardDocsProps,
  QCardDocsSnippets,
  QCardDocsGenerics,
  QCardDocsDomAttributesConstraint,
  QCardSectionDocsProps,
  QCardSectionDocsSnippets,
  QCardSectionDocsGenerics,
  QCardSectionDocsDomAttributesConstraint,
} from "./docs.props";

export const QCardDocs: QComponentDocs = {
  name: "QCard",
  description:
    "Cards provide a clean, flexible, and convenient means of displaying a wide variety of content.",
  docs: {
    generics: QCardDocsGenerics,
    domAttributesConstraint: QCardDocsDomAttributesConstraint,
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
    generics: QCardSectionDocsGenerics,
    domAttributesConstraint: QCardSectionDocsDomAttributesConstraint,
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
    generics: QCardActionsDocsGenerics,
    domAttributesConstraint: QCardActionsDocsDomAttributesConstraint,
    props: QCardActionsDocsProps,
    snippets: QCardActionsDocsSnippets,
    methods: [],
    events: [],
  },
};
