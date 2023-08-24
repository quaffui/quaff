<script lang="ts">
  import {useAlign} from "$lib/composables";
  import { createClasses } from "$lib/utils";
  import type { QCardActionsProps } from "./props";

  export let align: QCardActionsProps["align"] = undefined,
    vertical: QCardActionsProps["vertical"] = false,
    userClasses: QCardActionsProps["userClasses"] = undefined;
  export { userClasses as class };

  $: alignClass = useAlign(align);

  $: classes = createClasses([vertical && "vertical"], {
    component: "q-card",
    element: "actions",
    quaffClasses: [alignClass],
    userClasses,
  });
</script>

<nav class={classes} {...$$restProps}>
  <slot />
</nav>
