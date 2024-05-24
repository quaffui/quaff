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

  Q.classes("q-toolbar", {
    bemClasses: {
      inset,
      elevated: elevate,
      bordered: border,
    },
    classes: [props.class],
  });
</script>

<header {...props} class="q-toolbar" {...Q.classes} role="toolbar" style:height={dynamicHeight}>
  <nav>
    {@render children?.()}
  </nav>
</header>
