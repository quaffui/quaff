import { setContext } from "svelte";

export const QBreadcrumbsCtxName = {
  activeColor: Symbol("activeColor"),
  separator: Symbol("separator"),
};

export const QDocsCtxName = {
  snippets: Symbol("snippets"),
};

export const QItemCtxName = {
  activeClass: Symbol("activeClass"),
  multiline: Symbol("multiline"),
};

export const QLayoutCtxName = {
  view: Symbol("layoutView"),
  header: Symbol("QHeader"),
  footer: Symbol("QFooter"),
  railbar: {
    left: Symbol("QRailbar-left"),
    right: Symbol("QRailbar-right"),
  },
  drawer: {
    left: Symbol("QDrawer-left"),
    right: Symbol("QDrawer-right"),
  },
};

export const QListCtxName = {
  activeClass: Symbol("activeClass"),
  separator: Symbol("separator"),
};

export const QTabsCtxName = {
  request: Symbol("request"),
  value: Symbol("value"),
  variant: Symbol("variant"),
};

export const QTooltipCtxName = {
  target: Symbol("target"),
};

export function setupTooltipContext(id: string) {
  setContext(QTooltipCtxName.target, id);
}
