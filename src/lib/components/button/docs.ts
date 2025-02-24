import type { QComponentDocs } from "$lib/utils";
import { QBtnDocsProps, QBtnDocsSnippets } from "./docs.props";

export const QBtnDocs: QComponentDocs = {
  name: "QBtn",
  description:
    "Buttons help users take action, such as sending an email, sharing a document, or liking a comment.",
  docs: {
    props: QBtnDocsProps,
    snippets: QBtnDocsSnippets,
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
