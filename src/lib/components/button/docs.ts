import type { QComponentDocs } from "$docs";
import {
  QBtnDocsDomAttributesConstraint,
  QBtnDocsGenerics,
  QBtnDocsProps,
  QBtnDocsSnippets,
  QBtnDocsTypeDependencies,
  QIconBtnDocsDomAttributesConstraint,
  QIconBtnDocsGenerics,
  QIconBtnDocsProps,
  QIconBtnDocsSnippets,
  QIconBtnDocsTypeDependencies,
} from "./docs.props";

export const QBtnDocs: QComponentDocs = {
  name: "QBtn",
  description:
    "Buttons help users take action, such as sending an email, sharing a document, or liking a comment.",
  docs: {
    generics: QBtnDocsGenerics,
    domAttributesConstraint: QBtnDocsDomAttributesConstraint,
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
    typeDependencies: QBtnDocsTypeDependencies,
  },
};

export const QIconBtnDocs: QComponentDocs = {
  name: "QIconBtn",
  description:
    "Icon buttons are buttons that contain only icons (no text labels) and are typically used in toolbars, navigation bars, or as action buttons.",
  docs: {
    generics: QIconBtnDocsGenerics,
    domAttributesConstraint: QIconBtnDocsDomAttributesConstraint,
    props: QIconBtnDocsProps,
    snippets: QIconBtnDocsSnippets,
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the button.",
      },
    ],
    typeDependencies: QIconBtnDocsTypeDependencies,
  },
};
