import type { QComponentDocs } from "$lib/utils/types";

export let QCardDocs: QComponentDocs = {
  name: "QCard",
  description:
    "Cards provide a clean, flexible, and convenient means of displaying a wide variety of content.",
  docs: {
    props: [
      {
        name: "bordered",
        type: "boolean",
        default: false,
        description: "Puts a border around the card.",
      },
      {
        name: "fill",
        type: "string | boolean",
        default: undefined,
        description: "Defines the fill color of the card.",
        optional: true,
      },
      {
        name: "flat",
        type: "boolean",
        default: false,
        description: "Makes the card flat, removing its elevation.",
      },
      {
        name: "round",
        type: "boolean",
        default: false,
        description: "Adds rounded corners to the card.",
      },
      {
        name: "title",
        type: "string",
        default: undefined,
        description: "Sets the title of the card.",
        optional: true,
      },
    ],
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

export let QCardSectionDocs: QComponentDocs = {
  name: "QCardSection",
  description: "Sections are used to group similar content within a card.",
  docs: {
    props: [
      {
        name: "horizontal",
        type: "boolean",
        default: false,
        description: "Lays out the section content horizontally.",
      },
    ],
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

export let QCardActionsDocs: QComponentDocs = {
  name: "QCardActions",
  description: "Actions hold actionable items like buttons within a card.",
  docs: {
    props: [
      {
        name: "vertical",
        type: "boolean",
        default: false,
        description: "Lays out the action items vertically.",
      },
    ],
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
