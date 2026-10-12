import { describe, expect, it } from "vitest";
import { parse } from "svelte/compiler";
import {
  createFiniteIconEvaluator,
  readSyntaxChildren,
  type SyntaxNode,
} from "./finiteIconValues.js";

function findIconExpression(root: unknown): SyntaxNode | undefined {
  if (typeof root !== "object" || root === null) {
    return;
  }

  const node = root as SyntaxNode;

  if (node.type === "Attribute" && node.name === "name") {
    return (node.value as { expression: SyntaxNode }).expression;
  }

  if (node.type === "Property" && (node.key as { name?: string }).name === "name") {
    return node.value as SyntaxNode;
  }

  for (const child of readSyntaxChildren(node)) {
    const expression = findIconExpression(child);

    if (expression) {
      return expression;
    }
  }
}

function readValues(script: string, expression = "icon", markup?: string) {
  const root = parse(
    `<script lang="ts">${script}</script>${markup ?? `<QIcon name={${expression}} />`}`,
    { modern: true }
  );
  const evaluator = createFiniteIconEvaluator(root);
  const expressionNode = findIconExpression(root);
  expect(expressionNode).toBeDefined();
  const usage = evaluator.getValues(expressionNode);

  return { names: [...usage.values].sort(), complete: usage.complete };
}

describe("finite icon values", () => {
  it("keeps output alternatives without collecting condition strings", () => {
    expect(readValues('const icon = mode === "unused" ? "home" : "menu";')).toEqual({
      names: ["home", "menu"],
      complete: true,
    });
    expect(readValues('const icon = external() ?? "home";')).toEqual({
      names: ["home"],
      complete: false,
    });
  });

  it("resolves readonly aliases, derived expressions and bounded templates", () => {
    expect(
      readValues(
        'const suffix = "up"; const icon = $derived(`arrow_drop_${flag ? suffix : "down"}`);'
      )
    ).toEqual({ names: ["arrow_drop_down", "arrow_drop_up"], complete: true });
    expect(readValues('const icon = ("ho" + "me") as const;')).toEqual({
      names: ["home"],
      complete: true,
    });
  });

  it("reads simple zero-argument function and derived callback returns", () => {
    expect(
      readValues(
        'function getIcon(){ if(flag) return "home"; return "menu"; } const icon = getIcon();'
      )
    ).toEqual({ names: ["home", "menu"], complete: true });
    expect(
      readValues('const getIcon = () => "home"; const icon = $derived.by(() => getIcon());')
    ).toEqual({ names: ["home"], complete: true });

    expect(
      readValues(
        'function getIcon(value: boolean){ return value ? "pause" : "play_arrow"; } const icon = getIcon(external);'
      )
    ).toEqual({ names: ["pause", "play_arrow"], complete: true });
  });

  it("uses primitive addition and respects locally shadowed undefined", () => {
    expect(readValues("const icon = `filter_${true + 1}`;")).toEqual({
      names: ["filter_2"],
      complete: true,
    });
    expect(readValues("const icon = `filter_${null + 1}`;")).toEqual({
      names: ["filter_1"],
      complete: true,
    });
    expect(readValues('const undefined = "home"; const icon = undefined;')).toEqual({
      names: ["home"],
      complete: true,
    });
  });

  it("respects lexical shadowing in functions and nested templates", () => {
    for (const script of [
      'const icon = "home"; class Example {static {const icon = "menu";}}',
      'const icon = "home"; class Example {static {const icon = "menu";} read(){return {name: icon};}}',
      'const icon = "home"; namespace Example {const icon = "menu";}',
    ]) {
      expect(readValues(script)).toEqual({ names: ["home"], complete: true });
    }

    expect(
      readValues(
        'const icon = "menu"; function getIcon(){ const icon = "home"; return icon; }',
        "getIcon()"
      )
    ).toEqual({ names: ["home"], complete: true });
    for (const markup of [
      "{#each external as icon}<QIcon name={icon}/>{/each}",
      "{#snippet renderIcon(icon)}<QIcon name={icon}/>{/snippet}",
    ]) {
      expect(readValues('const icon = "menu";', "icon", markup)).toEqual({
        names: [],
        complete: false,
      });
    }
  });

  it("masks await values and hoisted mutable variables", () => {
    expect(
      readValues(
        'const icon = "menu";',
        "icon",
        "{#await promise then icon}<QIcon name={icon}/>{/await}"
      )
    ).toEqual({ names: [], complete: false });
    expect(
      readValues(
        'const icon = "menu"; function getIcon(){ if(flag){var icon="home";} return icon; }',
        "getIcon()"
      )
    ).toEqual({ names: ["home"], complete: false });

    expect(
      readValues(
        'const icon = "menu";',
        "icon",
        "{#await promise}<QIcon name={icon}/>{:then icon}<span/>{/await}"
      )
    ).toEqual({ names: ["menu"], complete: true });
    expect(
      readValues(
        'const icon = "menu";',
        "icon",
        "{#await promise then icon}<span/>{/await}<QIcon name={icon}/>"
      )
    ).toEqual({ names: ["menu"], complete: true });
  });

  it("keeps each fallbacks outside loop binding scope", () => {
    for (const markup of [
      "{#each [] as icon}<span/>{:else}<QIcon name={icon}/>{/each}",
      "{#each [] as item, icon}<span/>{:else}<QIcon name={icon}/>{/each}",
      "{#each [] as icon (icon)}<span/>{:else}<QIcon name={icon}/>{/each}",
    ]) {
      expect(readValues('const icon = "save";', "icon", markup)).toEqual({
        names: ["save"],
        complete: true,
      });
    }
  });

  it("never proves mutable initial values or writes exhaustive", () => {
    for (const script of [
      'function getIcon(){ return "home"; } [getIcon] = [() => "menu"]; const icon = getIcon();',
      'function getIcon(){ return "home"; } ({getIcon} = {getIcon: () => "menu"}); const icon = getIcon();',
      'let icon = $state("home");',
      'let icon = "home"; icon = external();',
      'function getIcon(){ return "home"; } getIcon = () => "menu"; const icon = getIcon();',
      'let getIcon = () => "home"; getIcon = external; const icon = getIcon();',
    ]) {
      expect(readValues(script)).toEqual({ names: ["home"], complete: false });
    }

    expect(
      readValues(
        'const icon = $derived("home");',
        "icon",
        "<QInput bind:value={icon}/><QIcon name={icon}/>"
      )
    ).toEqual({ names: ["home"], complete: false });

    expect(
      readValues(
        'let { expandIcon = "keyboard_arrow_down" } = $props(); const icon = $derived(expandIcon);'
      )
    ).toEqual({ names: ["keyboard_arrow_down"], complete: false });
  });

  it("keeps imported values, object access and parameterized functions incomplete", () => {
    expect(readValues('import { icon } from "./icons";')).toEqual({ names: [], complete: false });
    expect(readValues('const icons = { icon: "home" }; const icon = icons.icon;')).toEqual({
      names: [],
      complete: false,
    });
    expect(
      readValues('const getIcon = (prefix: string) => prefix + "me"; const icon = getIcon("ho");')
    ).toEqual({ names: [], complete: false });
  });

  it("bounds cycles, recursive functions and excessive variants", () => {
    expect(readValues("const icon = other; const other = icon;")).toEqual({
      names: [],
      complete: false,
    });
    expect(readValues("function getIcon(){ return getIcon(); } const icon = getIcon();")).toEqual({
      names: [],
      complete: false,
    });
    const variants = Array.from({ length: 8 }, (_, index) => `\${flag${index} ? "a" : "b"}`).join(
      ""
    );
    expect(readValues(`const icon = \`${variants}\`;`).complete).toBe(false);
  });

  it("exposes declaration identity for component shadowing", () => {
    const root = parse(
      '<script>import { QIcon as Icon } from "quaff";</script><Icon name="home"/>{#snippet render(Icon)}<Icon name="menu"/>{/snippet}',
      { modern: true }
    );
    const evaluator = createFiniteIconEvaluator(root);
    const first = root.fragment.nodes[0];
    const snippet = root.fragment.nodes[1];
    expect(evaluator.getBinding("Icon", first)).toMatchObject({ type: "Identifier", name: "Icon" });
    expect(evaluator.getBinding("Icon", first)).not.toBe(evaluator.getBinding("Icon", snippet));
  });
});
