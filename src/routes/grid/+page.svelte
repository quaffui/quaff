<script lang="ts">
  import { pageTitle } from "$helpers/pageTitle";

  const cols = [1, 2, 3, 4];
</script>

<svelte:head>
  <title>{pageTitle("Grid")}</title>
</svelte:head>

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
    You can add space between your columns using the q-gutter-* classes, where * is either xs, sm,
    md, lg, xl or none.
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

  <h2 class="q-my-lg">Breakpoints</h2>

  <ul class="q-ml-lg">
    {#each [["xs", 0, 599], ["sm", 600, 959], ["md", 960, 1279], ["lg", 1280, 1919], ["xl", 1920]] as info (info)}
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
