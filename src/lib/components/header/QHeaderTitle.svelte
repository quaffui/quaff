<!--
@component
QHeaderTitle positions a title or central control within QHeader.
-->

<script lang="ts">
  import type { QHeaderTitleProps } from "./props";

  let { shrink = false, children, ...props }: QHeaderTitleProps = $props();

  Q.classes("q-header-title", {
    bemClasses: {
      shrink,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-header-title" data-quaff>
  {@render children?.()}
</div>
