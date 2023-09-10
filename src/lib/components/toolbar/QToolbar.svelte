<script lang="ts">
  import type { QToolbarProps } from "./props";

  export let inset: QToolbarProps["inset"] = false,
    border: QToolbarProps["border"] = false,
    elevate: QToolbarProps["elevate"] = false,
    height: QToolbarProps["height"] = "64px",
    userClasses: QToolbarProps["userClasses"] = "";
  export { userClasses as class };

  $: dynamicHeight = !userClasses?.includes("q-header") ? height : undefined;
</script>

<header
  class="q-toolbar {userClasses}"
  class:q-toolbar--inset={inset}
  class:q-toolbar--elevated={elevate}
  class:q-toolbar--bordered={border}
  role="toolbar"
  style:height={dynamicHeight}
  {...$$restProps}
>
  <nav>
    <slot />
  </nav>
</header>
