import type { QComponentDocs } from "$utils/types";
import { QChipDocsProps } from "./docs.props";

export let QChipDocs: QComponentDocs = {
  name: "QChip",
  description:
    "Chips help people enter information, make selections, filter content, or trigger actions. They represent options in a specific context, unlike buttons, which are persistent.",
  docs: {
    props: QChipDocsProps,
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
