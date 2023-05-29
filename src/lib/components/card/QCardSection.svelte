<script lang="ts">
  import { stringifyClasses } from "$lib/utils/props";

  export let horizontal: boolean = false,
    className: string = "";
  export { className as class };

  $: classes = stringifyClasses(["q-card__section", "q-pa-sm", horizontal && "row", className]);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
