<script lang="ts">
  import useAlign, { type UseAlignProps } from "$lib/composables/use-align";
  import { stringifyClasses } from "$utils/props";
  import { type QCardActionsProps } from "./types";

  export let align: QCardActionsProps["align"] = undefined,
    vertical: QCardActionsProps["vertical"] = false,
    className: QCardActionsProps["className"] = undefined;
  export { className as class };

  $: alignClass = useAlign(align);

  $: classes = stringifyClasses(["q-card__actions", alignClass, vertical && "row", className]);
</script>

<nav class={classes} {...$$restProps}>
  <slot />
</nav>
