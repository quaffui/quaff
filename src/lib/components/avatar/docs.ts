import type { QComponentDocs } from "$docs";
import {
  QAvatarDocsProps,
  QAvatarDocsSnippets,
  QAvatarDocsDomAttributesConstraint,
  QAvatarDocsGenerics,
  QAvatarDocsTypeDependencies,
} from "./docs.props";

export const QAvatarDocs: QComponentDocs = {
  name: "QAvatar",
  description:
    "Avatars can be used in many different ways as with icons or for user profile images/videos, for example. They can have many different shapes, the default one being a circle.",
  docs: {
    generics: QAvatarDocsGenerics,
    domAttributesConstraint: QAvatarDocsDomAttributesConstraint,
    props: QAvatarDocsProps,
    snippets: QAvatarDocsSnippets,
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the avatar.",
      },
    ],
    typeDependencies: QAvatarDocsTypeDependencies,
  },
};
