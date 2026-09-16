const buttonCss = ["button", "icon", "progress"] as const;
const listCss = ["list", "separator"] as const;
const pickerCss = ["field", "dialog", "menu", ...buttonCss] as const;
const selectCss = ["field", "select", "icon", "list", "menu"] as const;
const sliderCss = ["slider", "icon"] as const;

// Order determines the CSS cascade. Each group declares its stylesheet and component dependencies.
const registry = {
  avatar: { css: "components/avatar", components: { QAvatar: ["avatar"] } },
  breadcrumbs: {
    css: "components/breadcrumbs",
    components: { QBreadcrumbs: ["breadcrumbs"], QBreadcrumbsEl: ["breadcrumbs", "icon"] },
  },
  button: { css: "components/button", components: { QBtn: buttonCss, QIconBtn: buttonCss } },
  card: {
    css: "components/card",
    components: { QCard: ["card"], QCardSection: ["card"], QCardActions: ["card"] },
  },
  checkbox: { css: "components/checkbox", components: { QCheckbox: ["checkbox"] } },
  chip: { css: "components/chip", components: { QChip: ["chip", "avatar", "icon"] } },
  codeBlock: { components: { QCodeBlock: buttonCss } },
  date: { css: "components/date", components: { QDate: ["date", ...pickerCss] } },
  dialog: { css: "components/dialog", components: { QDialog: ["dialog"] } },
  drawer: { css: "components/drawer", components: { QDrawer: ["drawer"] } },
  "expansion-item": {
    css: "components/expansion-item",
    components: { QExpansionItem: ["expansion-item", "button", "icon", ...listCss, "progress"] },
  },
  field: { css: "shared/field" },
  footer: { css: "components/footer", components: { QFooter: ["footer"] } },
  header: {
    css: "components/header",
    components: { QHeader: ["header"], QHeaderTitle: ["header"] },
  },
  icon: { css: "components/icon", components: { QIcon: ["icon"] } },
  input: { css: "components/input", components: { QInput: ["field"] } },
  layout: { css: "components/layout", components: { QLayout: ["layout"] } },
  list: {
    css: "components/list",
    components: { QList: listCss, QItem: listCss, QItemSection: ["list"] },
  },
  menu: { css: "components/menu", components: { QMenu: ["menu"] } },
  navbar: {
    css: "components/navbar",
    components: { QNavbar: ["navbar"], QNavItem: ["navbar", "icon"] },
  },
  progress: {
    css: "components/progress",
    components: { QCircularProgress: ["progress"], QLinearProgress: ["progress"] },
  },
  radio: { css: "components/radio", components: { QRadio: ["radio"] } },
  railbar: { css: "components/railbar", components: { QRailbar: ["railbar"] } },
  select: { css: "components/select", components: { QSelect: selectCss } },
  slider: { css: "components/slider", components: { QRange: sliderCss, QSlider: sliderCss } },
  snackbar: { css: "components/snackbar", components: { QSnackbar: ["snackbar", ...buttonCss] } },
  separator: { css: "components/separator", components: { QSeparator: ["separator"] } },
  switch: { css: "components/switch", components: { QSwitch: ["switch", "icon"] } },
  table: { css: "components/table", components: { QTable: ["table", ...buttonCss, ...selectCss] } },
  tabs: { css: "components/tabs", components: { QTabs: ["tabs"], QTab: ["tabs", "icon"] } },
  time: { css: "components/time", components: { QTime: ["time", ...pickerCss] } },
  tooltip: { css: "components/tooltip", components: { QTooltip: ["tooltip"] } },
} as const;

type Registry = typeof registry;
type RegistryKeysWith<Property extends string> = {
  [Key in keyof Registry]: Registry[Key] extends Record<Property, unknown> ? Key : never;
}[keyof Registry];
type CssKey = RegistryKeysWith<"css">;
type ComponentPath = RegistryKeysWith<"components">;
type ComponentName = {
  [Path in ComponentPath]: keyof Registry[Path]["components"];
}[ComponentPath];

export type ComponentCssName = Registry[CssKey]["css"];

const entries: Record<
  string,
  { css?: ComponentCssName; components?: Record<string, readonly CssKey[]> }
> = registry;

export const ComponentCss = Object.fromEntries(
  Object.entries(entries).flatMap(([key, { css }]) => (css ? [[key, css]] : []))
) as Record<CssKey, ComponentCssName>;

export const ComponentCssDependencies = Object.fromEntries(
  Object.values(entries).flatMap(({ components }) =>
    Object.entries(components ?? {}).map(([name, css]) => [
      name,
      css.map((key) => ComponentCss[key]),
    ])
  )
) as Record<ComponentName, ComponentCssName[]>;

export const ComponentPathCssDependencies = Object.fromEntries(
  Object.entries(entries).flatMap(([path, { components }]) => {
    if (!components) {
      return [];
    }

    const css = Object.keys(components).flatMap(
      (name) => ComponentCssDependencies[name as ComponentName]
    );

    return [[path, [...new Set(css)]]];
  })
) as Record<ComponentPath, ComponentCssName[]>;

export const UtilityCssDependencies = {
  Notify: ComponentCssDependencies.QSnackbar,
} satisfies Record<string, readonly ComponentCssName[]>;
