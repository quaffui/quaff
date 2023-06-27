import type { QComponentDocs } from "$utils/types";
import { QBtnDocsProps } from "./docs.props";

export let QBtnDocs: QComponentDocs = {
  name: "QBtn",
  description:
    "Buttons help users take action, such as sending an email, sharing a document, or liking a comment.",
  docs: {
    props: QBtnDocsProps,
    slots: [
      {
        name: "default",
        description:
          "The default slot can be used to display the button's text. This slot doesn't overwrite the label prop but appends to it.",
      },
    ],
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the button.",
      },
    ],
  },
};
