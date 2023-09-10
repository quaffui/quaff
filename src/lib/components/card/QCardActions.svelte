<script lang="ts">
  import {useAlign} from "$lib/composables";
  import type { QCardActionsProps } from "./props";

  export let align: QCardActionsProps["align"] = undefined,
    vertical: QCardActionsProps["vertical"] = false,
    userClasses: QCardActionsProps["userClasses"] = "";
  export { userClasses as class };

  $: alignClass = useAlign(align);
</script>

<nav
  class="q-card__actions {alignClass} {userClasses}"
  class:q-card__actions--vertical={vertical}
  {...$$restProps}
>
  <slot />
</nav>
