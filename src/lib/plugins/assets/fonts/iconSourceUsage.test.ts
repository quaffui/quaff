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
});
