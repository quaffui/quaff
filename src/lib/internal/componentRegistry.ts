// Order determines the CSS cascade. Blocks are explicit because component names do not always match.
const COMPONENT_REGISTRY = {
  avatar: group("components/avatar", { QAvatar: component("q-avatar") }),
  badge: group("components/badge", { QBadge: component("q-badge") }),
  "bottom-sheet": group("components/bottom-sheet", {
    QBottomSheet: component("q-bottom-sheet"),
  }),
  breadcrumbs: group("components/breadcrumbs", {
    QBreadcrumbs: component("q-breadcrumbs"),
    QBreadcrumbsEl: component("q-breadcrumbs", {
      helpers: ["q-px-none", "q-px-sm", "q-px-md", "q-px-lg"],
      renders: ["QIcon"],
    }),
  }),
  button: group("components/button", {
    QBtn: component("q-btn", {
      renders: ["QCircularProgress", "QIcon"],
      selectorBlocks: ["q-ripple"],
    }),
    QIconBtn: component("q-icon-btn", { renders: ["QBtn"] }),
  }),
  "button-group": group("components/button-group", {
    QBtnGroup: component("q-btn-group"),
    QBtnToggle: component("q-btn-group", { renders: ["QBtnGroup", "QBtn"] }),
  }),
  "split-button": group("components/split-button", {
    QSplitBtn: component("q-split-btn", { renders: ["QBtn", "QIconBtn", "QIcon", "QMenu"] }),
  }),
  card: group("components/card", {
    QCard: component("q-card"),
    QCardSection: component("q-card", { helpers: ["row"] }),
    QCardActions: component("q-card", {
      helpers: [
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
    QCarousel: component("q-carousel", { renders: ["QIconBtn"] }),
  }),
  checkbox: group("components/checkbox", {
    QCheckbox: component("q-checkbox", { selectorBlocks: ["q-ripple"] }),
  }),
  chip: group("components/chip", {
    QChip: component("q-chip", { renders: ["QAvatar", "QIcon"], selectorBlocks: ["q-ripple"] }),
  }),
  codeBlock: group(undefined, {
    QCodeBlock: component([], {
      helpers: [
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
      renders: ["QBtn"],
    }),
  }),
  date: group("components/date", {
    QDate: component("q-date", {
      renders: ["QDialog", "QMenu", "QBtn", "QIconBtn", "QIcon", "QInput"],
    }),
  }),
  dialog: group("components/dialog", { QDialog: component("q-dialog") }),
  drawer: group("components/drawer", { QDrawer: component("q-drawer") }),
  "expansion-item": group("components/expansion-item", {
    QExpansionItem: component("q-expansion-item", {
      renders: ["QIconBtn", "QIcon", "QItem", "QItemSection", "QSeparator"],
    }),
  }),
  fab: group("components/fab", {
    QFab: component("q-fab", { renders: ["QBtn", "QTooltip"] }),
    QExtendedFab: component(["q-fab", "q-extended-fab"], { renders: ["QBtn", "QTooltip"] }),
    QFabMenu: component("q-fab", { renders: ["QBtn", "QTooltip", "QMenu"] }),
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
    QList: component("q-list", { helpers: ["q-py-sm"], css: ["components/separator"] }),
    QItem: component("q-item", { renders: ["QSeparator"], selectorBlocks: ["q-ripple"] }),
    QItemSection: component("q-item", { selectorBlocks: ["q-ripple"] }),
  }),
  "loading-indicator": group("components/loading-indicator", {
    QLoadingIndicator: component("q-loading-indicator"),
  }),
  menu: group("components/menu", { QMenu: component("q-menu") }),
  meta: group(undefined, { QMeta: component([]) }),
  navbar: group("components/navbar", { QNavbar: component("q-navbar") }),
  "nav-item": group("components/nav-item", {
    QNavGroup: component([], { renders: ["QExpansionItem", "QList"] }),
    QNavItem: component("q-nav-item", {
      renders: ["QIcon", "QBadge"],
      selectorBlocks: ["q-ripple"],
    }),
  }),
  progress: group("components/progress", {
    QCircularProgress: component("q-circular-progress", {
      helpers: ["absolute-full", "flex", "flex-center"],
    }),
    QLinearProgress: component("q-linear-progress"),
  }),
  radio: group("components/radio", {
    QRadio: component("q-radio", { selectorBlocks: ["q-ripple"] }),
  }),
  railbar: group("components/railbar", { QRailbar: component("q-railbar") }),
  search: group("components/search", {
    QSearch: component("q-search", {
      renders: ["QDialog", "QIcon", "QIconBtn", "QLinearProgress"],
      css: ["shared/field"],
    }),
  }),
  select: group("components/select", {
    QSelect: component("q-select", {
      renders: ["QIcon", "QItem", "QItemSection", "QList", "QMenu"],
      css: ["shared/field"],
    }),
  }),
  "side-sheet": group("components/side-sheet", {
    QSideSheet: component("q-side-sheet", { renders: ["QIconBtn"] }),
  }),
  slider: group("components/slider", {
    QRange: component("q-slider", { renders: ["QIcon"] }),
    QSlider: component("q-slider", { renders: ["QIcon"] }),
  }),
  snackbar: group("components/snackbar", {
    QSnackbar: component(["q-snackbar", "q-snackbar-positioner"], {
      renders: ["QBtn", "QIconBtn"],
    }),
  }),
  separator: group("components/separator", {
    QSeparator: component("q-separator", { helpers: ["q-px-sm", "q-py-sm"] }),
  }),
  switch: group("components/switch", {
    QSwitch: component("q-switch", { renders: ["QIcon"], selectorBlocks: ["q-ripple"] }),
  }),
  table: group("components/table", {
    QTable: component("q-table", { renders: ["QBtn", "QIcon", "QSelect"] }),
  }),
  tabs: group("components/tabs", {
    QTabs: component("q-tabs"),
    QTab: component("q-tab", { renders: ["QIcon"], selectorBlocks: ["q-ripple"] }),
  }),
  time: group("components/time", {
    QTime: component("q-time", { renders: ["QIconBtn", "QDialog", "QInput", "QMenu", "QBtn"] }),
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
  helpers?: readonly string[];
  renders?: readonly string[];
  selectorBlocks?: readonly string[];
}

interface ComponentDefinition extends ComponentOptions<ComponentCssName> {
  path: string;
  blocks: readonly string[];
  css: readonly ComponentCssName[];
}

interface ResolvedComponentMetadata {
  blocks: string[];
  css: ComponentCssName[];
  helpers: string[];
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

export const COMPONENT_BLOCK_CSS_DEPENDENCIES: Record<string, ComponentCssName[]> = {};

for (const definition of Object.values(COMPONENT_DEFINITIONS)) {
  for (const block of definition.blocks) {
    addUnique((COMPONENT_BLOCK_CSS_DEPENDENCIES[block] ??= []), definition.css);
  }

  for (const block of definition.selectorBlocks ?? []) {
    COMPONENT_BLOCK_CSS_DEPENDENCIES[block] ??= [];
  }
}

export const UTILITY_COMPONENT_DEPENDENCIES = {
  Notify: ["QSnackbar"],
} satisfies Record<string, readonly ComponentName[]>;

function group<Css extends string | undefined, Components>(css: Css, components: Components) {
  return { css, components };
}

function component<Css extends string = never>(
  blocks: string | readonly string[],
  options: ComponentOptions<Css> = {}
) {
  return { blocks: typeof blocks === "string" ? [blocks] : blocks, ...options };
}

function collectComponentMetadata(
  name: ComponentName,
  seen = new Set<ComponentName>()
): ResolvedComponentMetadata {
  const metadata: ResolvedComponentMetadata = { blocks: [], css: [], helpers: [] };

  if (seen.has(name)) {
    return metadata;
  }

  seen.add(name);

  const definition = COMPONENT_DEFINITIONS[name];

  metadata.blocks.push(...definition.blocks, ...(definition.selectorBlocks ?? []));
  metadata.css.push(...definition.css);
  metadata.helpers.push(...(definition.helpers ?? []));

  for (const dependency of definition.renders ?? []) {
    if (!(dependency in COMPONENT_DEFINITIONS)) {
      throw new Error(`${name} renders unknown component ${dependency}`);
    }

    const dependencyMetadata = collectComponentMetadata(dependency as ComponentName, seen);

    addUnique(metadata.blocks, dependencyMetadata.blocks);
    addUnique(metadata.css, dependencyMetadata.css);
    addUnique(metadata.helpers, dependencyMetadata.helpers);
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
