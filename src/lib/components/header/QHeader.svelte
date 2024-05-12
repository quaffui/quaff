<svelte:options runes={true} />

<script lang="ts">
  import { createClasses } from "$lib/utils";
  import { getContext, untrack } from "svelte";
  import { QToolbar } from "$lib";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QHeaderProps } from "./props";

  let {
    inset = false,
    elevate = false,
    border = false,
    children,
    ...props
  }: QHeaderProps = $props();

  let ctx = getContext<LayoutContext | undefined>("layout");

  $effect(() => {
    if (!$ctx) {
      console.warn("QHeader should be used inside QLayout");
    }
  });

  const classes = $derived(
    createClasses([$ctx?.header?.fixed && "fixed"], {
      component: "q-header",
      userClasses: props.class,
    })
  );

  $effect(() => {
    if (untrack(() => $ctx)?.header) {
      $ctx!.header!.display = !props.style?.includes("display: none");
    }
  });
</script>

<QToolbar {...props} {inset} {elevate} {border} class={classes} role="header">
  {@render children?.()}
</QToolbar>
