<script lang="ts">
  import { useAlign } from "$lib/composables/use-align";
  import type { CardActionsProps } from "./props";

  let { align, vertical = false, children, ...props }: CardActionsProps = $props();

  const alignClass = $derived(useAlign(align));

  Quaff.classes("q-card__actions", {
    bemClasses: {
      vertical,
    },
    classes: [alignClass, props.class],
  });
</script>

<nav {...props} class="q-card__actions" {...Quaff.classes}>
  {@render children?.()}
</nav>

<style lang="scss">
  @import "./cardActions.scss";
</style>
