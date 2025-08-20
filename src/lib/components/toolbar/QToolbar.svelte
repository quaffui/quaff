<script lang="ts">
  import type { QToolbarProps } from "./props";

  // #region:    --- Props
  let {
    inset = false,
    border = false,
    elevate = false,
    height = 64,
    children,
    ...props
  }: QToolbarProps = $props();
  // #endregion: --- Props

  Q.classes("q-toolbar", {
    bemClasses: {
      inset,
      elevated: elevate,
      bordered: border,
    },
    classes: [props.class],
  });
</script>

<nav {...props} class="q-toolbar" role="toolbar" style:--toolbar-height="{height}px" data-quaff>
  {@render children?.()}
</nav>
