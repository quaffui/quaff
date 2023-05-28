<script lang="ts">
  import useAlign, { type UseAlignProps } from "$lib/composables/use-align";
  import { type QCardActionsProps } from "./types";

  export let align: QCardActionsProps["align"] = undefined,
    vertical: QCardActionsProps["vertical"] = false;

  let props: QCardActionsProps;
  $: props = {
    align,
    vertical,
  };

  $: alignClass = useAlign(props);

  $: classes = `q-card__actions ${alignClass}` + (vertical === true ? " row" : "");
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
