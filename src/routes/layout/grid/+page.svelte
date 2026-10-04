<script lang="ts">
  import { resolve } from "$app/paths";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";

  useMeta(
    pageMeta(
      "Grid & Breakpoints",
      "Build responsive Svelte layouts with Quaff's grid system. Learn column classes, gutters, directional spacing, and the five layout breakpoints."
    )
  );

  const cols = [1, 2, 3, 4];
</script>

<div class="q-page">
  <h1 class="q-mb-xl">Grid system</h1>

  <p>
    Quaff provides a basic 12 column grid system with responsive support. Under the hood, we're
    using display: grid, providing you a modern grid without any hacks.
  </p>

  <div class="row">
    {#each cols as col (col)}
      <div
        class="col-xs-12 col-md-6 col-lg-3 {col % 2 === 0 ? 'primary' : 'secondary'} text-center"
      >
        col-xs-12 col-md-6 col-lg-3
      </div>
    {/each}
  </div>

  <h2 class="q-my-lg">Gutter</h2>

  <p>
    You can add space between your columns using the <code class="q-docs-code">q-gutter-*</code>
    classes, where * is either xs, sm, md, lg, xl or none. Use
    <code class="q-docs-code">q-gutter-x-*</code> or
    <code class="q-docs-code">q-gutter-y-*</code> when spacing should only apply in one axis. The
    <code class="q-docs-code">q-col-gutter-*</code> names are supported as compatibility aliases for row
    grids.
  </p>

  {#each ["xs", "sm", "md", "lg", "xl", "none"] as size (size)}
    <h4>{size}</h4>

    <div class="row q-gutter-{size}">
      <div class="border text-center col-6 primary">col-6</div>
      <div class="border text-center col-6 secondary">col-6</div>
      <div class="border text-center col-4 primary">col-4</div>
      <div class="border text-center col-4 secondary">col-4</div>
      <div class="border text-center col-4 primary">col-4</div>
      <div class="border text-center col-3 primary">col-3</div>
      <div class="border text-center col-3 secondary">col-3</div>
      <div class="border text-center col-3 primary">col-3</div>
      <div class="border text-center col-3 secondary">col-3</div>
    </div>
  {/each}

  <h3 class="q-my-lg">Directional Gutter</h3>

  <p>
    The following example uses <code class="q-docs-code">q-col-gutter-x-md</code> with
    <code class="q-docs-code">q-col-gutter-y-sm</code>:
  </p>

  <div class="row q-col-gutter-x-md q-col-gutter-y-sm">
    <div class="border text-center col-6 primary">col-6</div>
    <div class="border text-center col-6 secondary">col-6</div>
    <div class="border text-center col-6 primary">col-6</div>
    <div class="border text-center col-6 secondary">col-6</div>
  </div>

  <h2 class="q-my-lg">Breakpoints</h2>

  <p>
    Grid classes use the MD3 window sizes below, matching <code class="q-docs-code"
      >Quaff.screen</code
    >. See
    <a class="q-docs-link" href={resolve("/layout/adaptive", {})}>adaptive layouts</a> for navigation
    and list/detail examples.
  </p>

  <ul class="q-ml-lg">
    {#each [["xs", 0, 599], ["sm", 600, 839], ["md", 840, 1199], ["lg", 1200, 1599], ["xl", 1600]] as info (info)}
      <li class="q-mb-md">
        <strong>{info[0]}</strong>
        {#if info.length === 3}
          {info[1]}-{info[2]}px
        {:else}
          {info[1]}px and larger
        {/if}
      </li>
    {/each}
  </ul>
</div>
