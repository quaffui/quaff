<script lang="ts">
  import type { QToolbarTitleProps } from "./props";

  let { shrink = false, children, ...props }: QToolbarTitleProps = $props();

  Q.classes("q-toolbar-title", {
    bemClasses: {
      shrink,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-toolbar-title" {...Q.classes}>
  {@render children?.()}
</div>
