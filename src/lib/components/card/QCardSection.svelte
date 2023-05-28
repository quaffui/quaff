<script lang="ts">
  export let horizontal: boolean = false;

  $: classes = "q-card__section q-pa-sm" + (horizontal === true ? " row" : "");
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
