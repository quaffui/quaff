<script lang="ts">
  import type { QToolbarProps } from "./props";

  let {
    inset = false,
    border = false,
    elevate = false,
    height = 64,
    children,
    ...props
  }: QToolbarProps = $props();

  Q.classes("q-toolbar", {
    bemClasses: {
      inset,
      elevated: elevate,
      bordered: border,
    },
    classes: [props.class],
  });
</script>

<nav
  {...props}
  class="q-toolbar"
  {...Q.classes}
  role="toolbar"
  style:--toolbar-height="{height}px"
  data-quaff
>
  {@render children?.()}
</nav>
