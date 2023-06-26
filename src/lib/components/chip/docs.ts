import type { QComponentDocs } from "$utils/types";

export let QChipDocs: QComponentDocs = {
  name: "QChip",
  description:
    "Chips help people enter information, make selections, filter content, or trigger actions. They represent options in a specific context, unlike buttons, which are persistent.",
  docs: {
    props: [
      {
        name: "content",
        type: "string",
        description: "The content inside the chip. Will overwrite the default slot.",
      },
      {
        name: "icon",
        type: "string",
        optional: true,
        description:
          'Name of the leading icon to use for the chip. If starts with "img:", will be used as an image src instead.',
      },
      {
        name: "iconRight",
        type: "string",
        optional: true,
        description:
          'Name of the trailing icon to use for the chip. If starts with "img:", will be used as an image src instead.',
      },
      {
        name: "disable",
        type: "boolean",
        default: false,
        description: "Puts the chip in a disabled state, making it unclickable.",
      },
      {
        name: "responsive",
        type: "boolean",
        default: false,
        description: "Makes leading and trailing images responsive, making them take more space.",
      },
      {
        name: "vertical",
        type: "boolean",
        default: false,
        description: "If true, the chip will display its content vertically.",
      },
      {
        name: "round",
        type: "boolean",
        default: false,
        description: "Use round design for the chip, adding a large border-radius to it.",
      },
      {
        name: "outlined",
        type: "boolean",
        default: false,
        description: "Use outline design for the chip, adding a border around it.",
      },
      {
        name: "size",
        type: "string",
        default: "medium",
        description: "Size of the chip. Can be small, medium or large.",
      },
      {
        name: "tabindex",
        type: "string | number",
        optional: true,
        description: "Tabindex of the chip.",
      },
      {
        name: "href",
        type: "string",
        optional: true,
        description:
          'Makes the chip a navigation chip. Can be used with the router (e.g to="/home") or as a normal href attribute (e.g to="#section-id")',
      },
    ],
    slots: [
      {
        name: "default",
        description:
          'The default slot for the chip\'s content. Is overwritten by the "content" prop',
      },
      {
        name: "leading",
        description:
          "Slot for content to display at the start of the chip. Use with an icon or a media.",
      },
      {
        name: "trailing",
        description:
          "Slot for content to display at the end of the chip. Use with an icon or a media.",
      },
    ],
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the chip.",
      },
    ],
  },
};
