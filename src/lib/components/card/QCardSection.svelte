<!--
@component
Sections are used to group similar content within a card.
-->

<script lang="ts">
  import type { QCardSectionProps } from "./props";

  // #region:    --- Props
  let { horizontal = false, children, ...props }: QCardSectionProps = $props();
  // #endregion: --- Props

  Q.classes("q-card__section", {
    bemClasses: {
      horizontal,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-card__section" class:row={horizontal} data-quaff>
  {@render children?.()}
</div>
