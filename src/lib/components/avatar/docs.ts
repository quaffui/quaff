import { QAvatarDocsProps } from "./docs.props";
import type { QComponentDocs } from "$lib/utils";

export let QAvatarDocs: QComponentDocs = {
  name: "QAvatar",
  description:
    "Avatars can be used in many different ways as with icons or for user profile images/videos, for example. They can have many different shapes, the default one being a circle.",
  docs: {
    props: QAvatarDocsProps,
    slots: [
      {
        name: "default",
        description: "The default slot can be used to display initials inside the avatar.",
      },
    ],
    methods: [],
    events: [
      {
        name: "click",
        type: "(e: MouseEvent) => void",
        description: "Emitted when the user clicks on the avatar.",
      },
    ],
  },
};
