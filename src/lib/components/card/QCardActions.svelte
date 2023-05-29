<script lang="ts">
  import useAlign, { type UseAlignProps } from "$lib/composables/use-align";
  import { type QCardActionsProps } from "./types";

  export let align: QCardActionsProps["align"] = undefined,
    vertical: QCardActionsProps["vertical"] = false,
    className: string | undefined;

  let props: QCardActionsProps;
  $: props = {
    align,
    vertical,
  };

  $: alignClass = useAlign(props);

  $: classes = [
    "q-card__actions",
    alignClass,
    vertical && "row",
    className
  ].filter(Boolean).join(" ");

  export {className as class};
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
