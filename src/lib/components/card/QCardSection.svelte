<script lang="ts">
  export let horizontal: boolean = false,
    className: string | undefined;

  $: classes = [
    "q-card__section",
    "q-pa-sm",
    horizontal && "row",
    className
  ].filter(Boolean).join(" ");

  export {className as class};
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
