<script lang="ts">
  import { useAlign } from "$composables";
  import type { QCardActionsProps } from "./props";

  // #region:    --- Props
  let { align, vertical = false, children, ...props }: QCardActionsProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const alignClass = $derived(useAlign(align));
  // #endregion: --- Derived values

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
