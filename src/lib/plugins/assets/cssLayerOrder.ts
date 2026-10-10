import { parse, type AtRule, type Root } from "postcss";

/** Preserve existing layer precedence even when component styles arrive lazily. */
export function createCssLayerOrder(stylesheets: Iterable<string>) {
  const layers = new Set<string>();

  for (const css of stylesheets) {
    parse(css).walkAtRules("layer", (rule) => collectLayerNames(rule, layers));
  }

  if (!layers.size) {
    return "";
  }

  return `@layer ${[...layers].join(", ")};`;
}

function collectLayerNames(rule: AtRule, layers: Set<string>) {
  const parent = getParentLayer(rule);

  if (parent === undefined || !rule.params.trim()) {
    return;
  }

  for (const name of rule.params.split(",")) {
    layers.add(`${parent}${name.trim()}`);
  }
}

function getParentLayer(rule: AtRule) {
  const names: string[] = [];

  for (
    let parent: AtRule["parent"] | Root["parent"] = rule.parent;
    parent;
    parent = parent.parent
  ) {
    if (parent.type !== "atrule" || parent.name !== "layer") {
      continue;
    }

    const name = parent.params.trim();

    if (!name) {
      // An anonymous layer cannot be referenced in an order declaration.
      return;
    }

    names.unshift(name);
  }

  return names.length ? `${names.join(".")}.` : "";
}
