import type { QComponentDocs } from "$lib/utils";
import { QCardActionsDocsProps, QCardDocsProps, QCardSectionDocsProps } from "./docs.props";

export const QCardDocs: QComponentDocs = {
  name: "QCard",
  description:
    "Cards provide a clean, flexible, and convenient means of displaying a wide variety of content.",
  docs: {
    props: QCardDocsProps,
    slots: [
      {
        name: "default",
        description: "Use this slot to add content to the card.",
      },
    ],
    methods: [],
    events: [],
  },
};

export const QCardSectionDocs: QComponentDocs = {
  name: "QCardSection",
  description: "Sections are used to group similar content within a card.",
  docs: {
    props: QCardSectionDocsProps,
    slots: [
      {
        name: "default",
        description: "Use this slot to add content to the card section.",
      },
    ],
    methods: [],
    events: [],
  },
};

export const QCardActionsDocs: QComponentDocs = {
  name: "QCardActions",
  description: "Actions hold actionable items like buttons within a card.",
  docs: {
    props: QCardActionsDocsProps,
    slots: [
      {
        name: "default",
        description: "Use this slot to add action items to the card.",
      },
    ],
    methods: [],
    events: [],
  },
};
