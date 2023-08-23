<script lang="ts">
  import { createClasses } from "$lib/utils";
  import type { QToolbarTitleProps } from "./props";

  export let shrink: QToolbarTitleProps["shrink"] = false,
    userClasses: QToolbarTitleProps["userClasses"] = undefined,
    userStyles: QToolbarTitleProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: classes = createClasses([shrink && "shrink", userClasses], { component: "q-toolbar-title" });
</script>

<div class={classes} {...$$restProps} style={userStyles}>
  <slot />
</div>
