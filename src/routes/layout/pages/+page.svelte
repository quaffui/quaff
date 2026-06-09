<script lang="ts">
  import { QCodeBlock } from "$lib";
  import { pageTitle } from "$helpers/pageTitle";

  const basicPage = `<div class="q-page">
  <h1>Settings</h1>
  <p>Page content goes here.</p>
</div>`;

  const layoutPage = `<QLayout view="hHh Lpr fFf">
  {#snippet header()}
    <QHeader>App title</QHeader>
  {/snippet}

  {#snippet content()}
    <div class="q-page">
      <h1>Dashboard</h1>
    </div>
  {/snippet}
</QLayout>`;

  const pageGrid = `<div class="q-page">
  <div class="row q-col-gutter-md">
    <section class="col-xs-12 col-md-8">Main content</section>
    <aside class="col-xs-12 col-md-4">Side content</aside>
  </div>
</div>`;
</script>

<svelte:head>
  <title>{pageTitle("Pages")}</title>
</svelte:head>

<div class="q-page">
  <h1 class="q-mb-xl">Pages</h1>

  <p>
    Use <code class="q-docs-code">q-page</code> on the main content container for a screen. It provides
    responsive horizontal padding, centers the content, and keeps wide screens readable.
  </p>

  <QCodeBlock class="q-my-lg" language="svelte" code={basicPage} />

  <h2 class="q-my-lg">With QLayout</h2>

  <p>
    QLayout handles app bars, drawers, railbars, and footers. Put
    <code class="q-docs-code">q-page</code> inside the content area so the page itself owns the page width
    and spacing.
  </p>

  <QCodeBlock class="q-my-lg" language="svelte" code={layoutPage} />

  <h2 class="q-my-lg">Page Grid</h2>

  <p>
    Combine <code class="q-docs-code">q-page</code> with the row and column classes when a page needs
    responsive sections.
  </p>

  <QCodeBlock class="q-my-lg" language="svelte" code={pageGrid} />
</div>
