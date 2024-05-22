<svelte:options runes={true} />

<script lang="ts">
  import { createClasses } from "$lib/utils";
  import { untrack } from "svelte";
  import { QToolbar } from "$lib";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QHeaderProps } from "./props";
  import QContext from "$lib/classes/QContext.svelte";

  let {
    inset = false,
    elevate = false,
    border = false,
    children,
    ...props
  }: QHeaderProps = $props();

  const ctx = QContext.get<LayoutContext>("layout");

  const header = $derived(ctx?.value?.header);

  $effect(() => {
    if (!ctx) {
      console.warn("QHeader should be used inside QLayout");
    }
  });

  const classes = $derived(
    createClasses([header?.fixed && "fixed"], {
      component: "q-header",
      userClasses: props.class,
    })
  );

  $effect(() => {
    props.style;

    untrack(() => {
      if (header) {
        ctx?.updateEntry("header", {
          ...header,
          display: !props.style?.includes("display: none"),
        });
      }
    });
  });
</script>

<QToolbar {...props} {inset} {elevate} {border} class={classes} role="header">
  {@render children?.()}
</QToolbar>
