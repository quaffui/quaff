<script lang="ts">
  import useAlign, { type UseAlignProps } from "$lib/composables/use-align";
  import { stringifyClasses } from "$utils/props";
  import { type QCardActionsProps } from "./props";

  export let align: QCardActionsProps["align"] = undefined,
    vertical: QCardActionsProps["vertical"] = false,
    userClasses: QCardActionsProps["userClasses"] = undefined;
  export { userClasses as class };

  $: alignClass = useAlign(align);

  $: classes = stringifyClasses(["q-card__actions", alignClass, vertical && "row", userClasses]);
</script>

<nav class={classes} {...$$restProps}>
  <slot />
</nav>
