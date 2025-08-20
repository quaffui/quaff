<script lang="ts">
  import type { QToolbarTitleProps } from "./props";

  // #region:    --- Props
  let { shrink = false, children, ...props }: QToolbarTitleProps = $props();
  // #endregion: --- Props

  Q.classes("q-toolbar-title", {
    bemClasses: {
      shrink,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-toolbar-title" data-quaff>
  {@render children?.()}
</div>
