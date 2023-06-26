export const QAvatarDocsProps = [
  {
    name: "shape",
    type: "QAvatarShapeOptions",
    optional: false,
    description: "Shape of the avatar.\r\nYAY.",
  },
  {
    name: "size",
    type: "string",
    optional: false,
    description:
      'Size of the avatar, can be a custom size using CSS units. If no unit is specified, "px" will be used.',
  },
  {
    name: "src",
    type: "string",
    optional: true,
    description:
      "Source of the image to use as the avatar. Can be a url or a path to a local file.",
  },
  {
    name: "video",
    type: "boolean",
    optional: false,
    description: 'If set to true, will use the "src" prop as a video source.',
  },
];
