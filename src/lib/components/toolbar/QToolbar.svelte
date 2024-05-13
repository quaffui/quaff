<svelte:options runes={true} />

<script lang="ts">
  import type { QToolbarProps } from "./props";

  let {
    inset = false,
    border = false,
    elevate = false,
    height = "64px",
    children,
    ...props
  }: QToolbarProps = $props();

  const dynamicHeight = $derived(!props.class?.includes("q-header") ? height : undefined);
</script>

<header
  {...props}
  class="q-toolbar {props.class}"
  class:q-toolbar--inset={inset}
  class:q-toolbar--elevated={elevate}
  class:q-toolbar--bordered={border}
  role="toolbar"
  style:height={dynamicHeight}
>
  <nav>
    {@render children?.()}
  </nav>
</header>
