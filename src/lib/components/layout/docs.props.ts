export const QLayoutDocsProps = [
  {
    name: "view",
    type: "QLayoutViewOptions",
    optional: true,
    clickableType: true,
    description:
      'The layout view configuration, which defines how layout components (header, railbars, drawers, footer) should be displayed on screen.\nSee <a href="https://quasar.dev/layout/layout/#understanding-the-view-prop" target="_blank">Quasar\'s explanation on the view prop</a>.',
    default: '"hhh lpr fff"',
  },
  {
    name: "headerHeight",
    type: "string | number",
    optional: true,
    clickableType: false,
    description:
      'The height of the header. Can be specified with CSS units. If no unit is specified, "px" will be used.',
    default: "64px",
  },
  {
    name: "footerHeight",
    type: "string | number",
    optional: true,
    clickableType: false,
    description:
      'The height of the footer. Can be specified with CSS units. If no unit is specified, "px" will be used.',
    default: "80px",
  },
  {
    name: "leftDrawerWidth",
    type: "string | number",
    optional: true,
    clickableType: false,
    description:
      'The width of the left drawer. Can be specified with CSS units. If no unit is specified, "px" will be used.',
    default: "300px",
  },
  {
    name: "rightDrawerWidth",
    type: "string | number",
    optional: true,
    clickableType: false,
    description:
      'The width of the right drawer. Can be specified with CSS units. If no unit is specified, "px" will be used.',
    default: "300px",
  },
  {
    name: "leftRailbarWidth",
    type: "string | number",
    optional: true,
    clickableType: false,
    description:
      'The width of the left railbar. Can be specified with CSS units. If no unit is specified, "px" will be used.',
    default: "88px",
  },
  {
    name: "rightRailbarWidth",
    type: "string | number",
    optional: true,
    clickableType: false,
    description:
      'The width of the right railbar. Can be specified with CSS units. If no unit is specified, "px" will be used.',
    default: "88px",
  },
];
