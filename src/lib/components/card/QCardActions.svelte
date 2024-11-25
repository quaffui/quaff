<svelte:options runes={true} />

<script lang="ts">
  import { useAlign } from "$lib/composables/useAlign";
  import type { QCardActionsProps } from "./props";

  let { align, vertical = false, children, ...props }: QCardActionsProps = $props();

  const alignClass = $derived(useAlign(align));

  Q.classes("q-card__actions", {
    bemClasses: {
      vertical,
    },
    classes: [alignClass, props.class],
  });
</script>

<nav {...props} class="q-card__actions" {...Q.classes} data-quaff>
  {@render children?.()}
</nav>
