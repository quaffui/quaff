import { describe, expect, it } from "vitest";
import { collectIconSourceUsage as collect } from "./iconSourceUsage.js";

describe("precise icon source usage", () => {
  it("follows icon props while excluding prose, attributes and unused data", async () => {
    const usage = await collect(`
      <script>
        const unused = { icon: "menu" };
        const icon = $derived(isSaved ? "bookmark" : "bookmark_add");
      </script>
      <p title="home">title padding QDate</p>
      <QBtn {icon} label="save" />
    `);

    expect(usage.names).toEqual(new Set(["bookmark", "bookmark_add"]));
    expect(usage.components).toEqual(new Set(["QBtn"]));
    expect(usage.unresolved).toEqual([]);
  });

  it.each([
    ['import { QIcon as Symbol } from "@quaffui/quaff";', '<Symbol name="home"/>'],
    ['import Symbol from "@quaffui/quaff/components/icon/QIcon.svelte";', "<Symbol>home</Symbol>"],
    ['import * as Q from "@quaffui/quaff";', '<Q.QIcon name="home"/>'],
    ['import * as Q from "@quaffui/quaff"; const Quaff = Q;', "<Quaff.QIcon>home</Quaff.QIcon>"],
  ])("resolves imports without relying on the local component spelling", async (script, markup) => {
    const usage = await collect(`<script>${script}</script>${markup}`);

    expect(usage.names).toEqual(new Set(["home"]));
    expect(usage.components).toEqual(new Set(["QIcon"]));
  });

  it("respects local components and template shadows", async () => {
    const usage = await collect(`
      <script>import QIcon from "./OwnIcon.svelte";</script>
      <QIcon name="home" />
      {#snippet example(QBtn)}<QBtn icon="save"/>{/snippet}
    `);

    expect(usage.names.size).toBe(0);
    expect(usage.components.size).toBe(0);
    expect(usage.unresolved).not.toEqual([]);
  });

  it("projects only icon fields from readonly options and object members", async () => {
    const usage = await collect(`
      <script>
        const options = [{ value: "menu", label: "home", icon: "save" }];
        const icons = { first: "bookmark", unused: "delete" };
        const items = [{ icon: "group" }];
      </script>
      <QBtnToggle {options}/><QIcon name={icons.first}/>
      {#each [{ icon: "map", label: "delete" }] as { icon }}<QBtn {icon}/>{/each}
      <QBtn {...{ ["icon"]: "cloud" }}/>
      {#each items as items}<QIcon name={items.icon}/>{/each}
    `);

    expect(usage.names).toEqual(new Set(["save", "bookmark", "map", "cloud", "group"]));
    expect(usage.unresolved).toEqual([]);
  });

  it("reports mutations and unknown runtime values rather than claiming completeness", async () => {
    const usage = await collect(`
      <script>const icons = { current: "home" }; icons.current = server.icon;</script>
      <QIcon name={icons.current}/><QBtn icon={server.next}/>
    `);

    expect(usage.names).toEqual(new Set(["home"]));
    expect(usage.unresolved).toHaveLength(2);
  });

  it("keeps raw icon text and infers component defaults only from actual classes", async () => {
    const usage = await collect(`
      <i class="material-symbols-rounded">home menu</i>
      <span class="q-icon">save</span>
      <span class={["material-symbols-outlined", runtimeClass]}>cloud</span>
      <span class={[[runtimeClass]]}>unused</span>
      <span class={{"material-symbols-outlined": true}}>bookmark</span>
      <span class={[{"q-icon": true}, [{"q-icon--rounded": true}]]}>delete</span>
      <span class={{"material-symbols-outlined": false}}>favorite</span>
      <span class="q-checkbox--error"/>
      <i class="custom-icon">star</i>
      <style>.custom-icon {font-family: "Material Symbols Outlined";}</style>
      <p>q-select</p>
    `);

    expect(usage.names).toEqual(
      new Set(["home", "menu", "save", "star", "cloud", "bookmark", "delete"])
    );
    expect(usage.components).toEqual(new Set(["QIcon", "QCheckbox"]));
    expect(usage.unresolved).toHaveLength(1);

    for (const classes of [
      "{[runtimeClass]: true}",
      "{...runtimeClasses}",
      "classes",
      "runtimeClass",
    ]) {
      const dynamic = await collect(
        `<script>const classes = {"q-icon": true};</script><span class={${classes}}>home</span>`
      );

      expect(dynamic.names.size).toBe(0);
      expect(dynamic.unresolved).toHaveLength(1);
    }
  });

  it("collects JS mount/server render props through aliases", async () => {
    const usage = await collect(
      `
      import { mount as attach } from "svelte";
      import { render } from "svelte/server";
      import { QIcon as Symbol, QBtn, QCheckbox } from "@quaffui/quaff";
      attach(Symbol, {target, props: {name: "home"}});
      render(QBtn, {props: {icon: "save", label: "delete"}});
      render(QCheckbox);
    `,
      "test.ts"
    );

    expect(usage.names).toEqual(new Set(["home", "save"]));
    expect(usage.components).toEqual(new Set(["QIcon", "QBtn", "QCheckbox"]));
    expect(usage.unresolved).toEqual([]);
  });

  it.each(["test.ts", "test.svelte"])(
    "ignores style tags inside script strings in %s",
    async (file) => {
      const script = `
        const template = \`<style>\${css}</style>\`;
        const unused = '<style>.q-icon::before {content: "delete";}</style>';
      `;
      const code = file.endsWith(".svelte")
        ? `<script>${script}</script><QIcon name="save"/>`
        : `import {render} from "svelte/server"; import {QIcon} from "@quaffui/quaff";
           ${script} render(QIcon, {props: {name: "save"}});`;
      const usage = await collect(code, file);

      expect(usage.names).toEqual(new Set(["save"]));
      expect(usage.unresolved).toEqual([]);
    }
  );

  it("collects actual component and head styles alongside script templates", async () => {
    const usage = await collect(`
      <script>const template = \`<style>\${css}</style>\`;</script>
      <i class="head-icon">menu</i><i class="component-icon">save</i>
      <svelte:head>
        <style>.head-icon {font-family: "Material Symbols Outlined";}</style>
      </svelte:head>
      <style lang="scss">
        .component-icon {font-family: var(--font-icon); &::before {content: "home";}}
      </style>
    `);

    expect(usage.names).toEqual(new Set(["home", "menu", "save"]));
    expect(usage.unresolved).toEqual([]);
  });

  it("requires the declared icon prefix for breadcrumb separators", async () => {
    const usage = await collect(
      '<QBreadcrumbs separator="home"/><QBreadcrumbs separator="icon:chevron_right"/>'
    );

    expect(usage.names).toEqual(new Set(["chevron_right"]));
  });

  it("ignores SVG/image snippets while retaining a literal fallback", async () => {
    const usage = await collect(`
      {#snippet custom()}<svg><path/></svg>{/snippet}
      <QBtn icon={isCustom ? custom : "save"}/>
      <QBtn icon={\`img:\${getImage()}\`}/>
      <QIcon><svg><title>home</title><path/></svg></QIcon>
      <QIcon name="save">menu</QIcon>
    `);

    expect(usage.names).toEqual(new Set(["save"]));
    expect(usage.unresolved).toEqual([]);
  });

  it("detects Notify calls and reports opaque HTML", async () => {
    const usage = await collect(
      '<script>import {Notify as toast} from "@quaffui/quaff"; toast.create("home");</script>{@html response}'
    );

    expect(usage.names.size).toBe(0);
    expect(usage.components).toEqual(new Set(["QSnackbar"]));
    expect(usage.unresolved).toHaveLength(1);

    const namespaceUsage = await collect(
      '<script>import * as Q from "@quaffui/quaff"; Q.Notify.create("hello");</script>'
    );

    expect(namespaceUsage.components).toEqual(new Set(["QSnackbar"]));
    expect(namespaceUsage.unresolved).toEqual([]);
  });

  it("keeps icon CSS content and custom properties without keeping ordinary CSS labels", async () => {
    const usage = await collect(
      `
      .icon {font-family: var(--font-icon); --glyph: "home";}
      .icon::before {content: var(--glyph);}
      .icon::after {content: "\\73 ave";}
      .label::before {font-family: Roboto; content: "menu";}
      .q-icon { &::after {content: "star";} }
      .shorthand::before {font: 24px "Material Symbols Outlined"; content: "cloud";}
      .q-icon--outlined::before {content: "favorite";}
      .q-icon--rounded::before {content: "bookmark";}
      .q-icon--filled::before {content: "delete";}
    `,
      "test.css"
    );

    expect(usage.names).toEqual(
      new Set(["home", "save", "star", "cloud", "favorite", "bookmark", "delete"])
    );
    expect(usage.unresolved).toEqual([]);
  });

  it("reports external CSS values and private glyphs", async () => {
    const usage = await collect(
      '.icon {font-family: var(--font-icon);} .icon::before {content: var(--external);} .icon::after {content: "\\e88a";}',
      "test.css"
    );

    expect(usage.names.size).toBe(0);
    expect(usage.unresolved).toHaveLength(2);

    for (const content of ["$glyph", "#{$glyph}", '"#{$glyph}"', "var(--glyph)"]) {
      const dynamic = await collect(
        `.q-icon {--glyph: "#{$icon}"; content: ${content};}`,
        "test.scss"
      );

      expect(dynamic.unresolved).toHaveLength(1);
    }
  });

  it("throws for malformed source so development can keep its last valid font", async () => {
    await expect(collect("<script>const icon = ;</script>")).rejects.toThrow(
      "Could not parse icon usage"
    );
  });

  it.each([
    'const options=[{icon:"home"}]; options[0].icon=server.icon;',
    'const options=[{icon:"home"}]; const wrapper={options}; wrapper.options[0].icon=server.icon;',
  ])("diagnoses computed array mutations and escapes", async (script) => {
    const usage = await collect(`<script>${script}</script><QBtnToggle {options}/>`);

    expect(usage.names).toEqual(new Set(["home"]));
    expect(usage.unresolved).toHaveLength(1);
  });

  it("diagnoses accessor props without evaluating application code", async () => {
    const usage = await collect('<QBtn {...{get icon() {return "home";}}}/>');

    expect(usage.names.size).toBe(0);
    expect(usage.unresolved).toHaveLength(1);
  });

  it("leaves imported data and custom preprocessors to the safelist", async () => {
    expect((await collect('{"icon":"home"}', "test.json")).names.size).toBe(0);
    expect((await collect("---\ntitle: home\n---", "test.md")).unresolved).toHaveLength(1);

    const stylesheet = '.#{$name} {font-family: var(--font-icon); content: "home";}';

    for (const usage of [
      await collect(stylesheet, "test.scss"),
      await collect(`<QIcon name="save"/><style lang="scss">${stylesheet}</style>`),
    ]) {
      expect(usage.unresolved).toHaveLength(1);
      expect(usage.unresolved[0].reason).toContain("preprocessor");
    }

    await expect(collect(stylesheet, "test.css")).rejects.toThrow();
  });

  it("diagnoses dynamically selected components even without icon props", async () => {
    const usage = await collect(
      "<script>const Current = isDate ? QDate : QSelect;</script><Current/>"
    );

    expect(usage.components.size).toBe(0);
    expect(usage.unresolved).toHaveLength(1);
    expect(usage.unresolved[0].reason).toContain("include");
  });

  it("projects readonly array indices, spreads, derived values and fallback candidates", async () => {
    const usage = await collect(`
      <script>const options = $derived([{icon: "home"}]);</script>
      <QBtnToggle {options}/>
      <QIcon name={["menu", "unused"][0]}/>
      {#each [...["save"], "delete"] as name}<QIcon {name}/>{/each}
      <QBtn {...({icon: "cloud"} ?? {icon: "star"})}/>
    `);

    expect(usage.names).toEqual(new Set(["home", "menu", "save", "delete", "cloud", "star"]));
    expect(usage.unresolved).toEqual([]);
  });

  it("keeps selection source candidates while warning about unverified calls", async () => {
    for (const expression of [
      "rows.find(row => row.id === selected)?.icon",
      "rows.filter(row => row.enabled)[0]?.icon",
      "rows.slice(1)[0]?.icon",
      "rows.at(-1)?.icon",
      "rows.find(predicate)?.icon",
      "rows.filter(row => row.enabled).slice(1)[0]?.icon",
      "rows[index]?.icon",
    ]) {
      const usage = await collect(`
        <script>const rows = [{icon: "home"}, {icon: "save"}];</script>
        <QIcon name={${expression}}/>
      `);

      expect(usage.names, expression).toEqual(new Set(["home", "save"]));
      expect(usage.unresolved, expression).toHaveLength(1);
    }
  });

  it("keeps state initializers and mutated selection candidates incomplete", async () => {
    const usage = await collect(`
      <script>
        const rows = [{icon: "home"}];
        const options = $state([{icon: "menu"}]);
      </script>
      <QIcon name={rows.find(row => {row.icon = external; return true})?.icon}/>
      <QBtnToggle {options}/>
    `);

    expect(usage.names).toEqual(new Set(["home", "menu"]));
    expect(usage.unresolved).toHaveLength(2);
  });

  it("warns when array elements escape through loop bindings", async () => {
    for (const script of [
      'for (const row of rows) row.icon = "save";',
      'let row; for (row of rows) row.icon = "save";',
      'for (const [row] of [rows]) row.icon = "save";',
      'async function updateRows() { for await (const row of rows) row.icon = "save"; }',
    ]) {
      const usage = await collect(`
        <script>const rows = [{icon: "home"}]; ${script}</script>
        <QIcon name={rows[0].icon}/>
      `);

      expect(usage.names, script).toEqual(new Set(["home"]));
      expect(usage.unresolved, script).toHaveLength(1);
    }
  });

  it("warns when script aliases can expose array elements to mutation", async () => {
    for (const script of [
      'let row; row = rows[0]; row.icon = "save";',
      'let row; [row] = rows; row.icon = "save";',
      'let row; ({ row } = { row: rows[0] }); row.icon = "save";',
      'let row; row ??= rows[0]; row.icon = "save";',
      'function getRow() { return rows[0]; } getRow().icon = "save";',
      'function edit(row = rows[0]) { row.icon = "save"; } edit();',
      'function* getRows() { yield rows[0]; } getRows().next().value.icon = "save";',
      'try { throw rows[0]; } catch (row) { row.icon = "save"; }',
      'class Editor { row = rows[0]; } new Editor().row.icon = "save";',
      'function edit(strings, row) { row.icon = "save"; } edit`${rows[0]}`;',
    ]) {
      const usage = await collect(`
        <script>const rows = [{icon: "home"}]; ${script}</script>
        <QIcon name={rows[0].icon}/>
      `);

      expect(usage.names, script).toEqual(new Set(["home"]));
      expect(usage.unresolved, script).toHaveLength(1);
    }
  });

  it("keeps readonly array indices complete when escapes reference shadowed arrays", async () => {
    const usage = await collect(`
      <script>
        const rows = [{icon: "home"}];
        {
          const rows = [{icon: "menu"}];
          for (const row of rows) row.icon = "save";
          let row;
          row = rows[0];
          row.icon = "save";
          function getRow() { return rows[0]; }
          function edit(row = rows[0]) { row.icon = "save"; }
          getRow().icon = "save";
          edit();
        }
      </script>
      <QIcon name={rows[0].icon}/>
    `);

    expect(usage.names).toEqual(new Set(["home"]));
    expect(usage.unresolved).toEqual([]);
  });

  it("warns when separate module exports expose mutable icon data", async () => {
    for (const declaration of ["export {rows};", "export {rows as icons};"]) {
      const usage = await collect(`
        <script module>const rows = [{icon: "home"}]; ${declaration}</script>
        <QIcon name={rows[0].icon}/>
      `);

      expect(usage.names, declaration).toEqual(new Set(["home"]));
      expect(usage.unresolved, declaration).toHaveLength(1);
    }
  });

  it("keeps private icon data complete across re-exports, types and instance shadowing", async () => {
    for (const [declaration, instance] of [
      ['export {rows} from "./other.js";', ""],
      ["export type {rows};", ""],
      ["export {type rows};", ""],
      ["export {rows};", 'const rows = [{icon: "home"}];'],
    ]) {
      const usage = await collect(`
        <script module lang="ts">const rows = [{icon: "home"}]; ${declaration}</script>
        <script>${instance}</script>
        <QIcon name={rows[0].icon}/>
      `);

      expect(usage.names, declaration).toEqual(new Set(["home"]));
      expect(usage.unresolved, declaration).toEqual([]);
    }
  });

  it("warns when Svelte bindings can mutate indexed icon values", async () => {
    for (const [tag, expression] of [
      ["input", "names[0]"],
      ["QInput", "names[0]"],
      ["input", "rows[0].icon"],
    ]) {
      const markup = `<${tag} bind:value={${expression}}/><span class="q-icon">{${expression}}</span>`;
      const usage = await collect(`
        <script>const names = ["home"]; const rows = [{icon: "home"}];</script>
        ${markup}
      `);

      expect(usage.names, markup).toEqual(new Set(["home"]));
      expect(usage.unresolved, markup).toHaveLength(1);
    }
  });

  it("keeps readonly icon arrays complete when bindings reference a shadowed name", async () => {
    const usage = await collect(`
      <script>const names = ["home"];</script>
      {#each [["menu"]] as names}<input bind:value={names[0]}/>{/each}
      <span class="q-icon">{names[0]}</span>
    `);

    expect(usage.names).toEqual(new Set(["home"]));
    expect(usage.unresolved).toEqual([]);
  });

  it("warns when mutable template aliases expose the source array", async () => {
    for (const markup of [
      "{#each rows as row}<input bind:value={row.icon}/>{/each}",
      '{#each rows as row}<button onclick={() => row.icon = "save"}>Save</button>{/each}',
      "{#each [rows] as group}{#each group as row}<input bind:value={row.icon}/>{/each}{/each}",
      "{#each [{rows}] as {rows: group}}{#each group as row}<input bind:value={row.icon}/>{/each}{/each}",
      "{#await rows[0] then row}<input bind:value={row.icon}/>{/await}",
    ]) {
      const usage = await collect(`
        <script>const rows = [{icon: "home"}];</script>
        ${markup}<span class="q-icon">{rows[0].icon}</span>
      `);

      expect(usage.names, markup).toEqual(new Set(["home"]));
      expect(usage.unresolved, markup).toHaveLength(1);
    }
  });

  it("warns when external component props or action parameters expose array items", async () => {
    for (const markup of [
      "<Editor row={rows[0]}/>",
      "<Editor {rows}/>",
      "<Editor {...{row: rows[0]}}/>",
      "<QTable {rows}/>",
      "{#each rows as row}<Editor {row}/>{/each}",
      "<row-editor row={rows[0]}/>",
      "<div use:edit={rows[0]}/>",
    ]) {
      const usage = await collect(`
        <script>import Editor from "./Editor.svelte"; const rows = [{icon: "home"}];</script>
        ${markup}<span class="q-icon">{rows[0].icon}</span>
      `);

      expect(usage.names, markup).toEqual(new Set(["home"]));
      expect(usage.unresolved, markup).toHaveLength(1);
    }
  });

  it("keeps read-only template aliases and native attributes complete", async () => {
    const usage = await collect(`
      <script>const rows = [{icon: "home"}];</script>
      {#each rows as row}<QIcon name={row.icon}/><input value={row.icon}/>{/each}
      {#each [{icon: "menu"}] as rows}<input bind:value={rows.icon}/>{/each}
      <span class="q-icon">{rows[0].icon}</span>
    `);

    expect(usage.names).toEqual(new Set(["home"]));
    expect(usage.unresolved).toEqual([]);
  });

  it("leaves objects with accessors incomplete even when projecting another field", async () => {
    const usage = await collect(`
      <script>
        const rows = [{icon: "home", get label() {this.icon = "save"; return "Edit";}}];
      </script>
      <QBtnToggle options={rows}/><span class="q-icon">{rows[0].icon}</span>
    `);

    expect(usage.names).toEqual(new Set(["home"]));
    expect(usage.unresolved).toHaveLength(2);
  });

  it("follows scalar aliases of selected fields and derived fallbacks", async () => {
    const usage = await collect(`
      <script>
        const rows = [{icon: "home"}, {icon: "menu"}];
        const name = rows.find(row => row.id === selected)?.icon ?? "save";
        const icon = $derived(rows.filter(row => row.enabled)[0]?.icon || "star");
      </script>
      <QIcon {name}/><QBtn {icon}/>
    `);

    expect(usage.names).toEqual(new Set(["home", "menu", "save", "star"]));
    expect(usage.unresolved).toHaveLength(2);
  });

  it("leaves custom iterators and missing array indices incomplete", async () => {
    for (const [expression, expectedNames] of [
      ['[...{*[Symbol.iterator]() {throw new Error("must not execute")}}][0]', []],
      ["[][0]", []],
      ["[,][0]", []],
      ['[...["save"]][3]', ["save"]],
    ] as const) {
      const usage = await collect(`
        <script>Array.prototype[0] = "home"; Array.prototype[3] = "home";</script>
        <QIcon name={${expression}}/>
      `);

      expect(usage.names, expression).toEqual(new Set(expectedNames));
      expect(usage.unresolved, expression).toHaveLength(1);
    }
  });

  it("leaves getters, custom methods, imported arrays and shadowed runes unresolved", async () => {
    for (const script of [
      'const rows = [{get icon() {throw new Error("must not execute")}}];',
      'const rows = {find() {throw new Error("must not execute")}, icon: "delete"};',
      'import rows from "./icons.js";',
      'function $derived() {return [{icon: "star"}]} const rows = $derived([]);',
      'function $state() {return [{icon: "star"}]} const rows = $state([]);',
      "const rows = other; const other = rows;",
    ]) {
      const usage = await collect(
        `<script>${script}</script><QIcon name={rows.find(predicate)?.icon}/>`
      );

      expect(usage.names, script).toEqual(new Set());
      expect(usage.unresolved, script).toHaveLength(1);
    }
  });
});
