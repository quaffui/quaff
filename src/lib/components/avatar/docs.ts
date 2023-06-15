export interface QAvatarProp {
  name: string;
  type: string;
  default?: any;
  description: string;
  clickableType?: true;
  optional?: true;
}

export interface QAvatarSlot {
  name: string;
  description: string;
}

export interface QAvatarType {
  name: string;
  description: string;
}

export let QAvatarDocs: {
  name: string;
  description: string;
  docs: {
    props: QAvatarProp[];
    slots: QAvatarSlot[];
    types: QAvatarType[];
  };
} = {
  name: "QAvatar",
  description:
    "Avatars can be used in many different ways as with icons or for user profile images/videos, for example. They can have many different shapes, the default one being a circle.",
  docs: {
    props: [
      {
        name: "shape",
        type: "QAvatarShapeOptions",
        default: "circle",
        description: "Shape of the avatar.",
        clickableType: true,
      },
      {
        name: "size",
        type: "QAvatarSizeOptions",
        default: "md",
        description:
          'Size of the avatar, can be a custom size using CSS units. If no unit is specified, "px" will be used.',
        clickableType: true,
      },
      {
        name: "src",
        optional: true,
        type: "string",
        description:
          "Source of the image to use as the avatar. Can be a url or a path to a local file.",
      },
      {
        name: "video",
        type: "boolean",
        default: false,
        description: 'If set to true, will use the "src" prop as a video source.',
      },
    ],
    slots: [
      {
        name: "default",
        description: "The default slot can be used to display initials inside the avatar.",
      },
    ],
    types: [
      {
        name: "QAvatarShapeOptions",
        description:
          "circle | rounded | top-round | left-round | right-round | bottom-round | top-left-round | top-right-round | bottom-left-round | bottom-right-round",
      },
      {
        name: "QAvatarSizeOptions",
        description: "xs | sm | md | lg | xl | string | number",
      },
    ],
  },
};
