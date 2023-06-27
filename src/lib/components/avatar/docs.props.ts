export const QAvatarDocsProps = [
  {
    name: "shape",
    type: "QAvatarShapeOptions",
    optional: true,
    clickableType: true,
    description: "Shape of the avatar.",
    default: "circle",
  },
  {
    name: "size",
    type: "QAvatarSizeOptions",
    optional: true,
    clickableType: true,
    description:
      'Size of the avatar, can be a custom size using CSS units. If no unit is specified, "px" will be used.',
    default: "md",
  },
  {
    name: "src",
    type: "string",
    optional: true,
    clickableType: false,
    description:
      "Source of the image to use as the avatar. Can be a url or a path to a local file.",
    default: "undefined",
  },
  {
    name: "video",
    type: "boolean",
    optional: true,
    clickableType: false,
    description: 'If set to true, will use the "src" prop as a video source.',
    default: "false",
  },
];
