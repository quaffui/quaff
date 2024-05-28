<svelte:options runes={true} />

<script lang="ts">
  import { untrack } from "svelte";
  import { createClasses } from "$lib/utils";
  import { QToolbar } from "$lib";
  import QContext from "$lib/classes/QContext.svelte";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QHeaderProps } from "./props";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
