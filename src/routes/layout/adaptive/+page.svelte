<script lang="ts">
  import { resolve } from "$app/paths";
  import { QCodeBlock } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import ListeningRoom from "./ListeningRoom.svelte";

  useMeta(
    pageMeta(
      "Adaptive Layouts",
      "Adapt Svelte layouts to window and container sizes with Quaff. Switch navigation patterns, build list-detail views, and use reactive screen state."
    )
  );

  const BREAKPOINTS = [
    ["xs", "< 600px", "Compact"],
    ["sm", "600–< 840px", "Medium"],
    ["md", "840–< 1200px", "Expanded"],
    ["lg", "1200–< 1600px", "Large"],
    ["xl", "≥ 1600px", "Extra-large"],
  ];
</script>

<div class="q-page adaptive-docs">
  <h1>Adaptive layouts</h1>
  <p>
    Quaff uses Material Design 3 breakpoints throughout its JavaScript helpers, grid classes, and
    responsive Sass mixins. Resize this record catalog to see navigation and list/detail panes
    adapt.
  </p>

  <ListeningRoom />

  <h2>Window sizes</h2>
  <div class="table-scroll">
    <table>
      <thead><tr><th>Key</th><th>Width</th><th>MD3 size</th></tr></thead>
      <tbody>
        {#each BREAKPOINTS as [key, width, name] (key)}
          <tr
            ><th scope="row"><code class="q-docs-code">{key}</code></th><td>{width}</td><td
              >{name}</td
            ></tr
          >
        {/each}
      </tbody>
    </table>
  </div>
  <QCodeBlock
    language="ts"
    code={`import { Quaff } from "@quaffui/quaff";

Quaff.screen.name;       // "xs" | "sm" | "md" | "lg" | "xl"
Quaff.screen.gt.md;      // Above the md class: at least 1200px
!Quaff.screen.lt.md;     // md or wider: at least 840px
Quaff.screen.navigation; // "navbar" below 600px, otherwise "railbar"
Quaff.screen.twoPane;    // true from 840px`}
  />
  <p>
    <a class="q-docs-link" href={resolve("/utils/quaff", {})}
      ><code class="q-docs-code">Quaff.screen</code></a
    >
    provides reactive, read-only viewport dimensions and size flags. Its
    <code class="q-docs-code">gt.md</code>
    flag means above the entire md class, while <code class="q-docs-code">!Quaff.screen.lt.md</code> includes
    md.
  </p>
  <p>
    Call <code class="q-docs-code">Quaff.init()</code> once during root layout setup, including in
    client-only apps. Until the root mounts, the viewport is <code class="q-docs-code">0 × 0</code>,
    <code class="q-docs-code">name</code>
    is
    <code class="q-docs-code">"xs"</code>, and <code class="q-docs-code">ready</code> is false. Live measurements
    begin on mount, keeping the initial server render and hydration consistent.
  </p>

  <h2>Navigation</h2>
  <p>
    Share destinations between a bottom bar on compact windows and a rail on larger windows. Render
    each in its <a class="q-docs-link" href={resolve("/components/layout", {})}>QLayout</a>
    slot.
  </p>
  <QCodeBlock
    language="svelte"
    code={`{#snippet destinations()}
  <QNavItem icon="album" label="Catalog" href="/catalog" />
  <!-- More destinations -->
{/snippet}

<QLayout>
  {#snippet navbar()}
    {#if Quaff.screen.navigation === "navbar"}
      <QNavbar>{@render destinations()}</QNavbar>
    {/if}
  {/snippet}
  {#snippet railbarStart()}
    {#if Quaff.screen.navigation === "railbar"}
      <QRailbar>{@render destinations()}</QRailbar>
    {/if}
  {/snippet}
  <!-- Application content -->
</QLayout>`}
  />

  <h2>List and detail</h2>
  <p>
    Compact and medium windows show one pane. From 840px, the usual list/detail arrangement shows
    both. Keep selection and Back behavior in your app; keep panes mounted to preserve scroll and
    form state.
  </p>
  <QCodeBlock
    language="ts"
    code={`import { Quaff } from "@quaffui/quaff";

let showDetail = $state(false); // Set true on selection; false on Back.
const twoPane = $derived(Quaff.screen.twoPane);`}
  />
  <QCodeBlock
    language="svelte"
    code={`<div class="row q-gutter-lg">
  <section class="col-xs-12 col-md-6" hidden={!twoPane && showDetail}>
    <!-- List -->
  </section>
  <section class="col-xs-12 col-md-6" hidden={!twoPane && !showDetail}>
    <!-- Selected item or empty state -->
  </section>
</div>`}
  />
  <p>
    This demo uses 16px margins on compact windows, 24px margins and pane gaps above that, and a
    360px list pane from 840px (412px from 1200px). Adapt the arrangement to your content. Show list
    selection only when both panes are visible, and move focus when a focused pane or navigation
    disappears.
  </p>

  <h2>Embedded layouts</h2>
  <p>For an app inside a container, derive its screen state from the measured width:</p>
  <QCodeBlock
    language="ts"
    code={`import { Quaff } from "@quaffui/quaff";

let width = $state<number>();
const screen = $derived(Quaff.getScreen(width));`}
  />
  <QCodeBlock
    language="svelte"
    code={"<div bind:clientWidth={width}><!-- Use screen here. --></div>"}
  />
  <p>
    <code class="q-docs-code">getScreen</code> returns the same
    <code class="q-docs-code">ScreenState</code>
    shape and accepts an optional height, defaulting to <code class="q-docs-code">0</code>. It is
    pure and needs no <code class="q-docs-code">Quaff.init()</code>. Its
    <code class="q-docs-code">ready</code> flag is false until width is a valid measurement;
    <code class="q-docs-code">0</code>
    is valid, while <code class="q-docs-code">undefined</code> means unavailable. Grid classes and Sass
    media queries always follow the viewport, not this container.
  </p>
  <p>
    See the <a class="q-docs-link" href={resolve("/layout/grid", {})}>grid utilities</a> and
    <a class="q-docs-link" href="https://m3.material.io/foundations/layout/breakpoints/overview"
      >MD3 breakpoint guidance</a
    >.
  </p>
</div>

<style>
  .adaptive-docs {
    min-width: 0;
  }

  h1,
  h2 {
    overflow-wrap: anywhere;
  }

  h2 {
    margin-block: 32px 16px;
  }

  p {
    margin-block: 16px;
  }

  .table-scroll {
    overflow-x: auto;
    margin-block: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 12px;
    border-bottom: 1px solid var(--outline-variant);
    border-radius: 0;
    text-align: start;
  }
</style>
