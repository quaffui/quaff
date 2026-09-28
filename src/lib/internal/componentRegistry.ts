// Order determines the CSS cascade. Each group names its stylesheet and public components.
// component("q-btn", { uses: ["QIcon"], keep: ["q-ripple"] }) means:
// - q-btn identifies this component's CSS, including q-btn__icon and q-btn--filled.
// - uses adds the styles needed by other components rendered internally.
// - keep preserves additional classes and their __element/--modifier variants.
const COMPONENT_REGISTRY = {
  avatar: group("components/avatar", { QAvatar: component("q-avatar") }),
  badge: group("components/badge", { QBadge: component("q-badge") }),
  "bottom-sheet": group("components/bottom-sheet", {
    QBottomSheet: component("q-bottom-sheet"),
  }),
  breadcrumbs: group("components/breadcrumbs", {
    QBreadcrumbs: component("q-breadcrumbs"),
    QBreadcrumbsEl: component("q-breadcrumbs", {
      keep: ["q-px-none", "q-px-sm", "q-px-md", "q-px-lg"],
      uses: ["QIcon"],
    }),
  }),
  button: group("components/button", {
    QBtn: component("q-btn", {
      uses: ["QCircularProgress", "QIcon"],
      keep: ["q-ripple"],
    }),
    QIconBtn: component("q-icon-btn", { uses: ["QBtn"] }),
  }),
  "button-group": group("components/button-group", {
    QBtnGroup: component("q-btn-group"),
    QBtnToggle: component("q-btn-group", { uses: ["QBtnGroup", "QBtn"] }),
  }),
  "split-button": group("components/split-button", {
    QSplitBtn: component("q-split-btn", { uses: ["QBtn", "QIconBtn", "QIcon", "QMenu"] }),
  }),
  card: group("components/card", {
    QCard: component("q-card"),
    QCardSection: component("q-card", { keep: ["row"] }),
    QCardActions: component("q-card", {
      keep: [
        "flex",
        "items-start",
        "items-center",
        "items-end",
        "justify-start",
        "justify-center",
        "justify-end",
        "justify-between",
        "justify-around",
        "justify-evenly",
      ],
    }),
  }),
  carousel: group("components/carousel", {
    QCarousel: component("q-carousel", { uses: ["QIconBtn"] }),
  }),
  checkbox: group("components/checkbox", {
    QCheckbox: component("q-checkbox", { keep: ["q-ripple"] }),
  }),
  chip: group("components/chip", {
    QChip: component("q-chip", { uses: ["QAvatar", "QIcon"], keep: ["q-ripple"] }),
  }),
  codeBlock: group(undefined, {
    QCodeBlock: component([], {
      keep: [
        "q-pb-sm",
        "q-ma-none",
        "items-center",
        "justify-between",
        "justify-end",
        "border-primary",
        "text-primary",
        "border-error",
        "text-error",
        "border-green",
        "text-green",
      ],
      uses: ["QBtn"],
    }),
  }),
  "color-picker": group("components/color-picker", {
    QColorPicker: component("q-color-picker", {
      uses: ["QInput", "QSlider", "QIconBtn", "QMenu", "QBtn", "QBtnToggle"],
    }),
  }),
  date: group("components/date", {
    QDate: component("q-date", {
      uses: ["QDialog", "QMenu", "QBtn", "QIconBtn", "QIcon", "QInput"],
    }),
  }),
  dialog: group("components/dialog", { QDialog: component("q-dialog") }),
  drawer: group("components/drawer", { QDrawer: component("q-drawer") }),
  "expansion-item": group("components/expansion-item", {
    QExpansionItem: component("q-expansion-item", {
      uses: ["QIconBtn", "QIcon", "QItem", "QItemSection", "QSeparator"],
    }),
  }),
  fab: group("components/fab", {
    QFab: component("q-fab", { uses: ["QBtn", "QTooltip"] }),
    QExtendedFab: component(["q-fab", "q-extended-fab"], { uses: ["QBtn", "QTooltip"] }),
    QFabMenu: component("q-fab", { uses: ["QBtn", "QTooltip", "QMenu"] }),
  }),
  field: group("shared/field", {}),
  footer: group("components/footer", { QFooter: component("q-footer") }),
  header: group("components/header", {
    QHeader: component("q-header"),
    QHeaderTitle: component("q-header-title"),
  }),
  icon: group("components/icon", { QIcon: component("q-icon") }),
  input: group(undefined, { QInput: component("q-field", { css: ["shared/field"] }) }),
  layout: group("components/layout", { QLayout: component("q-layout") }),
  list: group("components/list", {
    QList: component("q-list", { keep: ["q-py-sm"], css: ["components/separator"] }),
    QItem: component("q-item", { uses: ["QSeparator"], keep: ["q-ripple"] }),
    QItemSection: component("q-item", { keep: ["q-ripple"] }),
  }),
  "loading-indicator": group("components/loading-indicator", {
    QLoadingIndicator: component("q-loading-indicator"),
  }),
  menu: group("components/menu", { QMenu: component("q-menu") }),
  meta: group(undefined, { QMetaHead: component([]) }),
  navbar: group("components/navbar", { QNavbar: component("q-navbar") }),
  "nav-item": group("components/nav-item", {
    QNavGroup: component([], { uses: ["QExpansionItem", "QList"] }),
    QNavItem: component("q-nav-item", {
      uses: ["QIcon", "QBadge"],
      keep: ["q-ripple", "q-railbar"],
    }),
  }),
  progress: group("components/progress", {
    QCircularProgress: component("q-circular-progress", {
      keep: ["absolute-full", "flex", "flex-center"],
    }),
    QLinearProgress: component("q-linear-progress"),
  }),
  radio: group("components/radio", {
    QRadio: component("q-radio", { keep: ["q-ripple"] }),
  }),
  railbar: group("components/railbar", { QRailbar: component("q-railbar") }),
  search: group("components/search", {
    QSearch: component("q-search", {
      uses: ["QDialog", "QIcon", "QIconBtn", "QLinearProgress"],
      css: ["shared/field"],
    }),
  }),
  select: group("components/select", {
    QSelect: component("q-select", {
      uses: ["QIcon", "QItem", "QItemSection", "QList", "QMenu"],
      css: ["shared/field"],
    }),
  }),
  "side-sheet": group("components/side-sheet", {
    QSideSheet: component("q-side-sheet", { uses: ["QIconBtn"] }),
  }),
  slider: group("components/slider", {
    QRange: component("q-slider", { uses: ["QIcon"] }),
    QSlider: component("q-slider", { uses: ["QIcon"] }),
  }),
  snackbar: group("components/snackbar", {
    QSnackbar: component(["q-snackbar", "q-snackbar-positioner"], {
      uses: ["QBtn", "QIconBtn"],
    }),
  }),
  separator: group("components/separator", {
    QSeparator: component("q-separator", { keep: ["q-px-sm", "q-py-sm"] }),
  }),
  switch: group("components/switch", {
    QSwitch: component("q-switch", { uses: ["QIcon"], keep: ["q-ripple"] }),
  }),
  table: group("components/table", {
    QTable: component("q-table", { uses: ["QBtn", "QIcon", "QSelect"] }),
  }),
  tabs: group("components/tabs", {
    QTabs: component("q-tabs"),
    QTab: component("q-tab", { uses: ["QIcon"], keep: ["q-ripple"] }),
  }),
  time: group("components/time", {
    QTime: component("q-time", { uses: ["QIconBtn", "QDialog", "QInput", "QMenu", "QBtn"] }),
  }),
  toolbar: group("components/toolbar", { QToolbar: component("q-toolbar") }),
  tooltip: group("components/tooltip", { QTooltip: component("q-tooltip") }),
} as const;

type Registry = typeof COMPONENT_REGISTRY;
export type ComponentName = {
  [Path in keyof Registry]: keyof Registry[Path]["components"];
}[keyof Registry];
export type ComponentCssName = NonNullable<Registry[keyof Registry]["css"]>;

interface ComponentOptions<Css extends string = string> {
  css?: readonly Css[];
  keep?: readonly string[];
  uses?: readonly string[];
}

interface ComponentDefinition extends ComponentOptions<ComponentCssName> {
  path: string;
  classes: readonly string[];
  css: readonly ComponentCssName[];
}

interface ResolvedComponentMetadata {
  css: ComponentCssName[];
  keep: string[];
}

const COMPONENT_GROUPS: Record<
  string,
  {
    css: ComponentCssName | undefined;
    components: Record<string, ReturnType<typeof component<ComponentCssName>>>;
  }
> = COMPONENT_REGISTRY;

export const COMPONENT_CSS = Object.fromEntries(
  Object.entries(COMPONENT_GROUPS).flatMap(([path, { css }]) => (css ? [[path, css]] : []))
) as Record<string, ComponentCssName>;

export const COMPONENT_DEFINITIONS = Object.fromEntries<ComponentDefinition>(
  Object.entries(COMPONENT_GROUPS).flatMap(([path, group]) =>
    Object.entries(group.components).map(([name, definition]) => [
      name,
      {
        ...definition,
        path: `${path}/${name}.svelte`,
        css: [...(group.css ? [group.css] : []), ...(definition.css ?? [])],
      },
    ])
  )
) as Record<ComponentName, ComponentDefinition>;

export const COMPONENT_PARENT_FOLDER = Object.fromEntries(
  Object.entries(COMPONENT_GROUPS).flatMap(([path, { components }]) =>
    Object.keys(components).map((name) => [name, `components/${path}`])
  )
) as Record<ComponentName, string>;

export const COMPONENT_NAMES_BY_IMPORT_PATH = Object.fromEntries(
  Object.entries(COMPONENT_DEFINITIONS).map(([name, definition]) => [definition.path, name])
) as Readonly<Record<string, ComponentName>>;

export const COMPONENT_METADATA = Object.fromEntries(
  Object.keys(COMPONENT_DEFINITIONS).map((name) => [
    name,
    collectComponentMetadata(name as ComponentName),
  ])
) as Record<ComponentName, ResolvedComponentMetadata>;

export const CSS_BY_CLASS: Record<string, ComponentCssName[]> = {};

for (const definition of Object.values(COMPONENT_DEFINITIONS)) {
  for (const className of definition.classes) {
    addUnique((CSS_BY_CLASS[className] ??= []), definition.css);
  }

  // Extra classes must survive pruning, but do not identify this component's stylesheet.
  for (const className of definition.keep ?? []) {
    CSS_BY_CLASS[className] ??= [];
  }
}

export const UTILITY_COMPONENT_DEPENDENCIES = {
  Notify: ["QSnackbar"],
} satisfies Record<string, readonly ComponentName[]>;

function group<Css extends string | undefined, Components>(css: Css, components: Components) {
  return { css, components };
}

function component<Css extends string = never>(
  classes: string | readonly string[],
  options: ComponentOptions<Css> = {}
) {
  return { classes: typeof classes === "string" ? [classes] : classes, ...options };
}

function collectComponentMetadata(
  name: ComponentName,
  seen = new Set<ComponentName>()
): ResolvedComponentMetadata {
  const metadata: ResolvedComponentMetadata = { css: [], keep: [] };

  if (seen.has(name)) {
    return metadata;
  }

  seen.add(name);

  const definition = COMPONENT_DEFINITIONS[name];

  metadata.css.push(...definition.css);
  metadata.keep.push(...definition.classes, ...(definition.keep ?? []));

  for (const dependency of definition.uses ?? []) {
    if (!(dependency in COMPONENT_DEFINITIONS)) {
      throw new Error(`${name} uses unknown component ${dependency}`);
    }

    const dependencyMetadata = collectComponentMetadata(dependency as ComponentName, seen);

    addUnique(metadata.css, dependencyMetadata.css);
    addUnique(metadata.keep, dependencyMetadata.keep);
  }

  return metadata;
}

function addUnique<Value>(target: Value[], values: readonly Value[]) {
  for (const value of values) {
    if (!target.includes(value)) {
      target.push(value);
    }
  }
}
