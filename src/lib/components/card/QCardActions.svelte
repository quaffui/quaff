<script lang="ts">
  import { useAlign } from "$composables";
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

<nav {...props} class="q-card__actions" data-quaff>
  {@render children?.()}
</nav>
