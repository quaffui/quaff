import { describe, expect, it } from "vitest";
import { analyzeSource } from "../analyzeSource.js";
import { collectTemplateCandidates } from "../templateValues.js";
import { collectIconNames } from "./iconFontStylesheet.js";
import type { ComponentName } from "../../../internal/componentRegistry.js";

const AVAILABLE_NAMES = new Set([
  "home",
  "menu",
  "save",
  "arrow_drop_up",
  "arrow_drop_down",
  "calendar_month",
  "chevron_left",
  "chevron_right",
  "edit",
  "close",
  "check",
  "schedule",
  "keyboard",
  "keyboard_arrow_down",
  "arrow_back",
  "search",
  "info",
  "warning",
  "delete",
  "add",
  "favorite",
  "filter_3",
]);

describe("icon usage", () => {
  it("reuses CSS candidates for markup, data dictionaries and conditional literals", async () => {
    const usage = await analyzeSource(`
      <script>
        const navigation = [{icon: "home"}, {icon: "menu"}];
        const icon = warning ? "warning" : "info";
      </script>
      <QBtn icon="save" class="not_an_icon" />
    `);
    const names = await collectIconNames([usage], AVAILABLE_NAMES, [], new Set());

    expect([...names]).toEqual(["home", "info", "menu", "save", "warning"]);
  });

  it("adds valid safelisted runtime icons without changing source candidates", async () => {
    const usage = await analyzeSource("<QIcon name={serverResponse.icon} />");
    const originalCandidates = new Set(usage.candidates);
    const names = await collectIconNames([usage], AVAILABLE_NAMES, ["favorite"], new Set());

    expect([...names]).toEqual(["favorite"]);
    expect(usage.candidates).toEqual(originalCandidates);
  });

  it("rejects misspelled safelist names instead of silently dropping icons", async () => {
    await expect(collectIconNames([], AVAILABLE_NAMES, ["favortie"], new Set())).rejects.toThrow(
      "Unknown Material Symbols icon in safelist: favortie"
    );
  });

  it("retains both dropdown states generated inside a selected QSelect", async () => {
    const names = await collectForComponents(["QSelect"]);

    expect(names.has("arrow_drop_down")).toBe(true);
    expect(names.has("arrow_drop_up")).toBe(true);
    expect(names.has("calendar_month")).toBe(false);
  });

  it("includes private date components and transitive component defaults", async () => {
    const names = await collectForComponents(["QDate"]);

    for (const name of ["calendar_month", "chevron_left", "chevron_right", "edit", "close"]) {
      expect(names.has(name), name).toBe(true);
    }
  });

  it("keeps chip filter state and clock mode icons", async () => {
    const names = await collectForComponents(["QChip", "QTime"]);

    for (const name of ["check", "schedule", "keyboard"]) {
      expect(names.has(name), name).toBe(true);
    }
  });

  it("only reads selected component groups", async () => {
    const names = await collectForComponents(["QBtn"]);

    expect(names.has("calendar_month")).toBe(false);
    expect(names.has("arrow_drop_up")).toBe(false);
    expect(names.has("keyboard")).toBe(false);
  });
});

describe("finite icon templates", () => {
  it("collects all branches without evaluating their conditions", () => {
    const candidates = collectTemplateCandidates('`arrow_drop_${isMenuOpen ? "up" : "down"}`');

    expect(candidates).toEqual(new Set(["arrow_drop_up", "arrow_drop_down"]));
  });

  it("combines multiple finite interpolations and nested conditionals", () => {
    const candidates = collectTemplateCandidates(
      '`arrow_${first ? "drop" : "circle"}_${second ? "up" : third ? "down" : "left"}`'
    );

    expect(candidates).toEqual(
      new Set([
        "arrow_drop_up",
        "arrow_drop_down",
        "arrow_drop_left",
        "arrow_circle_up",
        "arrow_circle_down",
        "arrow_circle_left",
      ])
    );
  });

  it("does not invent a complete result for unknown runtime expressions", () => {
    expect(collectTemplateCandidates("`arrow_drop_${direction}`")).toEqual(new Set());
    expect(collectTemplateCandidates('`arrow_drop_${open ? "up" : direction}`')).toEqual(new Set());
  });

  it("decodes string escapes and literal concatenation", () => {
    const source = '`arrow_drop_${"u" + "p"}` `arrow_drop_\\u0064own`';

    expect(collectTemplateCandidates(source)).toEqual(
      new Set(["arrow_drop_up", "arrow_drop_down"])
    );
  });

  it("preserves numeric addition before converting an interpolation to text", async () => {
    const usage = await analyzeSource("<QIcon name={`filter_${1 + 2}`} />", false, true);
    const names = await collectIconNames([usage], AVAILABLE_NAMES, [], new Set());

    expect(names).toEqual(new Set(["filter_3"]));
    expect(collectTemplateCandidates('`filter_${"1" + 2}`')).toEqual(new Set(["filter_12"]));
  });

  it("retains every icon branch in nested templates", async () => {
    const source = '<QIcon name={`arrow_${outer ? `drop_${inner ? "up" : "down"}` : "back"}`} />';
    const usage = await analyzeSource(source, false, true);
    const names = await collectIconNames([usage], AVAILABLE_NAMES, [], new Set());

    expect(names).toEqual(new Set(["arrow_back", "arrow_drop_down", "arrow_drop_up"]));
  });

  it("ignores unfinished templates instead of breaking source analysis", () => {
    expect(collectTemplateCandidates('`arrow_drop_${open ? "up" : }`')).toEqual(new Set());
  });

  it("caps combinatorial template growth", () => {
    const interpolation = '${open ? "a" : "b"}';
    const source = "`" + interpolation.repeat(9) + "`";

    expect(collectTemplateCandidates(source)).toEqual(new Set());
  });
});

function collectForComponents(components: ComponentName[]) {
  return collectIconNames([], AVAILABLE_NAMES, [], new Set(components));
}
